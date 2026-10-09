// handoff — a Claude Code mod (two-tier-dev).
// When the context fills past `threshold` (read from $.session.usage() at the end of a turn), on `/handoff now`, or
// on the band's button, it asks the model — over the session's own transcript, served from the prompt cache
// ($.model.fork) — for a handoff document, writes it under `handoffDir`, and (with `autoClear`) runs /clear and
// submits the resume prompt, so the work continues in a fresh context with nothing retyped.
// A band above the prompt shows the fill and two buttons. Headless runs (`claude -p`) are left alone.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import { handoffPrompt, parseHandoff, resumePrompt, stampOf, type Lang } from './text'

type Settings = { threshold: number; handoffDir: string; autoClear: boolean; minTurns: number; language: Lang }

type State = {
  s: Settings
  isInteractive: boolean
  isArmed: boolean // re-armed once the fill drops well below the threshold (a fresh context after /clear)
  isRunning: boolean
  lastPath: string | undefined
}

type Outcome = { isWritten: true; relPath: string; text: string } | { isWritten: false; text: string }

const fill = atom({ plugin: 'handoff', key: 'fill' } as const, null)
const isHidden = atom({ plugin: 'handoff', key: 'isHidden' } as const, false)
const note = atom({ plugin: 'handoff', key: 'note' } as const, '')

const clamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo)

const settingsOf = (o: Readonly<Record<string, unknown>>): Settings => ({
  threshold: clamp(Number(o.threshold ?? 70), 10, 95),
  handoffDir: String(o.handoffDir ?? 'handoffs').replace(/^\/+|\/+$/g, '') || 'handoffs',
  autoClear: o.autoClear !== false,
  minTurns: Math.max(0, Number(o.minTurns ?? 2)),
  language: o.language === 'en' ? 'en' : 'ru',
})

const words = (lang: Lang) =>
  lang === 'en'
    ? { now: 'Handoff → fresh context', file: 'File only', hide: 'Hide', ctx: 'ctx', at: 'handoff @' }
    : { now: 'Хендофф → свежий контекст', file: 'Только файл', hide: 'Скрыть', ctx: 'контекст', at: 'хендофф @' }

export const register: Register = (on, options) => {
  const st: State = { s: settingsOf(options), isInteractive: false, isArmed: true, isRunning: false, lastPath: undefined }

  on('session.start', async ($, e, next) => {
    st.isInteractive = e.isInteractive
    if (st.isInteractive) {
      await $.command.register({
        name: 'handoff',
        description: 'Write a handoff from this session; `now` also clears the context and resumes from it.',
        argumentHint: 'now | write | status | last',
      })
    }
    return next(e)
  })

  // The decision point: after every main-loop turn, read the window's fill; past the threshold — hand off.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined || !st.isInteractive || st.isRunning || e.isAborted) return result
    let percent = 0
    try {
      percent = (await $.session.usage()).context.percent ?? 0
    } catch {
      return result // no figure, no decision
    }
    await update($, fill, () => percent)
    $.ui.status(`ctx ${percent}% · handoff @${st.s.threshold}%`)
    if (percent < st.s.threshold - 20) st.isArmed = true
    if (!st.isArmed || percent < st.s.threshold) return result
    let turns = st.s.minTurns
    try {
      turns = await $.session.turns()
    } catch {
      /* count unknown: treated as enough */
    }
    if (turns < st.s.minTurns) return result
    st.isArmed = false
    $.ui.toast(`handoff: context at ${percent}% — writing the handoff…`, { timeoutMs: 6000 })
    // Outside this dispatch: the turn is not held while the fork and the /clear run.
    $.clock.after(250, () => void handoffAndResume($, st, 'auto'))
    return result
  })

  on('command.run', { command: 'handoff' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'status') return { text: await statusLine($, st) }
    if (arg === 'last') {
      const last = st.lastPath ?? (await readLast($))
      return { text: last ? `last handoff: ${last}` : 'no handoff written yet' }
    }
    const outcome = await writeHandoff($, st, 'command')
    if (!outcome.isWritten) return { text: outcome.text }
    if (arg === 'now' && st.s.autoClear) {
      // /clear cannot run inside the command's own dispatch; it follows once the session is idle.
      $.clock.after(100, () => void clearAndResume($, st, outcome.relPath))
      return { text: `${outcome.text} — clearing the context and resuming from it…` }
    }
    return { text: `${outcome.text} — fresh-session line: ${resumePrompt(st.s.language, outcome.relPath)}` }
  })

  // The band above the prompt: the fill, and the handoff one press away.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const percent = await read($, fill)
    if (e.props.hasSurvey || percent === null || (await read($, isHidden))) return next(e)
    const { Box, Button, Text } = $.ui.resolve(e)
    const w = words(st.s.language)
    const last = await read($, note)
    const isHot = percent >= st.s.threshold
    return (
      <Box>
        <Text color={isHot ? 'yellow' : undefined} dimColor={!isHot}>
          {w.ctx} {percent}% · {w.at}
          {st.s.threshold}%{last ? ` · ${last}` : ''}{' '}
        </Text>
        <Button key="now" label={w.now} hotkey="h" variant="primary" onPress={() => void handoffAndResume($, st, 'button')} />
        <Text> </Text>
        <Button key="file" label={w.file} hotkey="f" onPress={() => void handoffFileOnly($, st)} />
        <Text> </Text>
        <Button key="hide" label={w.hide} plain onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}

async function handoffAndResume($: EngineInterface, st: State, trigger: 'auto' | 'button'): Promise<void> {
  const outcome = await writeHandoff($, st, trigger)
  await update($, note, () => outcome.text)
  if (outcome.isWritten && st.s.autoClear) await clearAndResume($, st, outcome.relPath)
}

async function handoffFileOnly($: EngineInterface, st: State): Promise<void> {
  const outcome = await writeHandoff($, st, 'button')
  await update($, note, () => outcome.text)
  if (outcome.isWritten) $.ui.log(`fresh-session line: ${resumePrompt(st.s.language, outcome.relPath)}`)
}

async function statusLine($: EngineInterface, st: State): Promise<string> {
  let fillText = 'unknown'
  try {
    const { context } = await $.session.usage()
    fillText = `${context.percent ?? 0}% of ${context.window} tokens`
  } catch {
    /* no figure */
  }
  const last = st.lastPath ?? (await readLast($))
  return `handoff · context ${fillText} · threshold ${st.s.threshold}% · auto-clear ${st.s.autoClear ? 'on' : 'off'} · dir ${st.s.handoffDir}/ · last: ${last ?? '—'}`
}

async function readLast($: EngineInterface): Promise<string | undefined> {
  try {
    const v = await $.store.get('lastPath')
    return typeof v === 'string' ? v : undefined
  } catch {
    return undefined
  }
}

async function writeHandoff($: EngineInterface, st: State, trigger: 'auto' | 'command' | 'button'): Promise<Outcome> {
  if (st.isRunning) return { isWritten: false, text: 'handoff: already running' }
  st.isRunning = true
  try {
    const stamp = stampOf(await $.clock.now())
    const fork = await $.model.fork({ prompt: handoffPrompt(st.s.language, stamp, st.s.handoffDir) })
    if (!fork.isAnswered) {
      const why = `handoff: no text from the model (${fork.reason})`
      $.ui.toast(why, { timeoutMs: 6000 })
      return { isWritten: false, text: why }
    }
    const { slug, body } = parseHandoff(fork.text)
    const relPath = `${st.s.handoffDir}/handoff-${stamp}${slug ? `-${slug}` : ''}.md`
    const root = await $.session.root()
    await $.fs.write(`${root}/${relPath}`, body)
    st.lastPath = relPath
    try {
      await $.store.set('lastPath', relPath)
    } catch {
      /* the store is a convenience */
    }
    $.ui.log(`handoff (${trigger}): ${relPath}`)
    return { isWritten: true, relPath, text: `handoff written: ${relPath}` }
  } catch (err) {
    const why = `handoff: failed — ${err instanceof Error ? err.message : String(err)}`
    $.ui.toast(why, { timeoutMs: 6000 })
    return { isWritten: false, text: why }
  } finally {
    st.isRunning = false
  }
}

async function clearAndResume($: EngineInterface, st: State, relPath: string): Promise<void> {
  try {
    await $.command.run({ command: 'clear' })
    await $.prompt.submit({ text: resumePrompt(st.s.language, relPath) })
  } catch (err) {
    $.ui.toast(`handoff: written, but the fresh start failed — ${err instanceof Error ? err.message : String(err)}`, {
      timeoutMs: 8000,
    })
  }
}
