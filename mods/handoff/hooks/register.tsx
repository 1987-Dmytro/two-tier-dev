// handoff — a Claude Code mod (two-tier-dev).
// When the context fills past `threshold` (read from $.session.usage() at the end of a turn), on `/handoff now`, or
// on the band's button, it asks the model — over the session's own transcript, served from the prompt cache
// ($.model.fork) — for a handoff document, writes it under `handoffDir`, and (with `autoClear`) runs /clear and
// submits the resume prompt, so the work continues in a fresh context with nothing retyped.
// Below the threshold, Jev (absorbed from compact-adviser) judges each settled answer: is the unit of work finished,
// and was it hands-on? Past a floor that slides with the fill, `jev: hint` lights the band, `jev: auto` hands off there.
// A band above the prompt shows the fill, the hint and the buttons. Headless runs (`claude -p`) are left alone.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import { JEV_FROM, JEV_TIMEOUT_MS, JEV_URL, floorFor, parseJudgment, requestBody, score, stateOf, type Judgment, type Mode } from './jev'
import { handoffPrompt, parseHandoff, resumePrompt, stampOf, type Lang } from './text'

type Settings = { threshold: number; handoffDir: string; autoClear: boolean; minTurns: number; language: Lang; jev: Mode }

type State = {
  s: Settings
  isInteractive: boolean
  isArmed: boolean // re-armed once the fill drops well below the threshold (a fresh context after /clear)
  isRunning: boolean
  lastPath: string | undefined
  prompt: string // the user's last typed prompt: what Jev reads beside the answer
  seq: number // turns started: a judgment that comes back after the next turn began is dropped
  judged: string | undefined // the turn Jev was last asked about
}

type Outcome = { isWritten: true; relPath: string; text: string } | { isWritten: false; text: string }

const fill = atom({ plugin: 'handoff', key: 'fill' } as const, null)
const isHidden = atom({ plugin: 'handoff', key: 'isHidden' } as const, false)
const note = atom({ plugin: 'handoff', key: 'note' } as const, '')
const advice = atom({ plugin: 'handoff', key: 'advice' } as const, '')

const clamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo)

const settingsOf = (o: Readonly<Record<string, unknown>>): Settings => ({
  threshold: clamp(Number(o.threshold ?? 70), 10, 95),
  handoffDir: String(o.handoffDir ?? 'handoffs').replace(/^\/+|\/+$/g, '') || 'handoffs',
  autoClear: o.autoClear !== false,
  minTurns: Math.max(0, Number(o.minTurns ?? 2)),
  language: o.language === 'en' ? 'en' : 'ru',
  jev: o.jev === 'off' || o.jev === 'auto' ? o.jev : 'hint',
})

const words = (lang: Lang) =>
  lang === 'en'
    ? { now: 'Handoff → fresh context', file: 'File only', compact: 'Compact', hide: 'Hide', ctx: 'ctx', at: 'handoff @', jev: 'Jev: unit finished' }
    : { now: 'Хендофф → свежий контекст', file: 'Только файл', compact: 'Compact', hide: 'Скрыть', ctx: 'контекст', at: 'хендофф @', jev: 'Jev: задача на границе' }

export const register: Register = (on, options) => {
  const st: State = {
    s: settingsOf(options),
    isInteractive: false,
    isArmed: true,
    isRunning: false,
    lastPath: undefined,
    prompt: '',
    seq: 0,
    judged: undefined,
  }

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

  // A main-loop turn begins (a subagent's run raises none): keep the typed prompt for Jev, drop the last hint.
  on('turn.start', async ($, e, next) => {
    st.seq++
    if (e.text.trim()) st.prompt = e.text
    if (await read($, advice)) await update($, advice, () => '')
    return next(e)
  })

  // /clear resets $.state, and session.start does not fire again: put the fill back so the band shows at once.
  on('classic.SessionStart', async ($, e, next) => {
    const result = await next(e)
    if (!st.isInteractive || e.source !== 'clear') return result
    try {
      const percent = (await $.session.usage()).context.percent ?? 0
      await update($, fill, () => percent)
    } catch {
      /* no figure: the band comes back after the next turn */
    }
    return result
  })

  // The decision point: after every main-loop turn, read the window's fill; past the threshold — hand off;
  // below it, ask Jev whether this answer closes a unit of work.
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
    if (percent < st.s.threshold) {
      if (st.s.jev !== 'off' && st.isArmed && e.reason === 'answer' && e.answer.trim() && percent >= JEV_FROM && st.judged !== e.turnId) {
        st.judged = e.turnId
        const answer = e.answer
        const seq = st.seq
        // Outside this dispatch: the turn ends while Jev answers.
        $.clock.after(0, () => void judgeBoundary($, st, answer, percent, seq))
      }
      return result
    }
    if (!st.isArmed) return result
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
    const tip = await read($, advice)
    const isHot = percent >= st.s.threshold || tip !== ''
    return (
      <Box>
        <Text color={isHot ? 'yellow' : undefined} dimColor={!isHot}>
          {w.ctx} {percent}% · {w.at}
          {st.s.threshold}%{tip ? ` · ${w.jev} ${tip}` : ''}{last ? ` · ${last}` : ''}{' '}
        </Text>
        <Button key="now" label={w.now} hotkey="h" variant="primary" onPress={() => void handoffAndResume($, st, 'button')} />
        <Text> </Text>
        <Button key="file" label={w.file} hotkey="f" onPress={() => void handoffFileOnly($, st)} />
        <Text> </Text>
        <Button key="compact" label={w.compact} hotkey="c" onPress={() => void compactNow($)} />
        <Text> </Text>
        <Button key="hide" label={w.hide} plain onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}

// Jev's judgment of the answer just settled: the hint, or (jev: auto) the handoff right at the boundary.
// No key, an error, a timeout or a wrong model — no advice and nothing changes; each call is one journal line, no content.
async function judgeBoundary($: EngineInterface, st: State, answer: string, percent: number, seq: number): Promise<void> {
  if (st.isRunning) return
  const key = await $.env.get('TYPESAFE_API_KEY')
  if (!key) return
  let tools: string[] = []
  try {
    const ms = await $.session.messages()
    let i = ms.length - 1
    while (i >= 0 && !(ms[i]!.role === 'user' && !ms[i]!.toolResults?.length && ms[i]!.text.trim())) i--
    tools = ms.slice(i + 1).flatMap(m => m.toolUses.map(u => u.tool))
  } catch {
    /* counts unknown: Jev reads the text alone */
  }
  const t0 = await $.clock.now()
  let verdict: Judgment | string
  try {
    const res = await Promise.race([
      $.http.fetch(JEV_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: requestBody(stateOf(st.prompt, answer, tools, key)),
      }),
      $.clock.sleep(JEV_TIMEOUT_MS).then(() => undefined),
    ])
    verdict = !res ? `timeout after ${JEV_TIMEOUT_MS} ms` : !res.ok ? `HTTP ${res.status}` : parseJudgment(res.text)
  } catch (err) {
    verdict = `network: ${err instanceof Error ? err.message : String(err)}`.split(key).join('[key]')
  }
  const floor = floorFor(percent, st.s.threshold)
  const s = typeof verdict === 'string' ? undefined : Math.round(score(verdict) * 100) / 100
  const isStale = st.seq !== seq || st.isRunning
  const decision = s === undefined ? 'error' : isStale ? 'stale' : s < floor ? 'below' : st.s.jev
  await journal($, st, {
    at: new Date(t0).toISOString(),
    ms: (await $.clock.now()) - t0,
    percent,
    floor,
    score: s,
    decision,
    ...(typeof verdict === 'string' ? { error: verdict } : { model: verdict.model, in: verdict.inputTokens, out: verdict.outputTokens }),
  })
  if (s === undefined || isStale) return
  $.ui.status(`ctx ${percent}% · handoff @${st.s.threshold}% · jev ${s.toFixed(2)}/${floor.toFixed(2)}`)
  if (s < floor) return
  const tip = `${s.toFixed(2)} ≥ ${floor.toFixed(2)}`
  if (st.s.jev === 'auto') {
    let turns = st.s.minTurns
    try {
      turns = await $.session.turns()
    } catch {
      /* count unknown: treated as enough */
    }
    if (turns >= st.s.minTurns && st.isArmed) {
      st.isArmed = false
      $.ui.toast(`handoff: Jev — unit finished (${tip}), writing the handoff…`, { timeoutMs: 6000 })
      await handoffAndResume($, st, 'jev')
      return
    }
  }
  await update($, advice, () => tip) // the band turns yellow; no toast — every finished answer would raise one
}

// One line per Jev call in <handoffDir>/jev.jsonl: numbers and the decision, never the prompt or the answer.
// ponytail: read-and-rewrite append, a 4 MiB file (~25k lines) is the ceiling; rotate by date if it ever nears it.
async function journal($: EngineInterface, st: State, rec: Record<string, unknown>): Promise<void> {
  try {
    const path = `${await $.session.root()}/${st.s.handoffDir}/jev.jsonl`
    let old = ''
    try {
      old = await $.fs.read(path)
    } catch {
      /* first line */
    }
    await $.fs.write(path, `${old}${JSON.stringify(rec)}\n`)
  } catch {
    /* the journal is a convenience */
  }
}

// The band's Compact: Claude Code's own /compact path, between turns.
async function compactNow($: EngineInterface): Promise<void> {
  try {
    const r = await $.session.compact()
    await update($, note, () => (r.skip !== undefined ? `compact: ${r.skip}` : 'compacted'))
    await update($, advice, () => '')
  } catch (err) {
    $.ui.toast(`handoff: compact failed — ${err instanceof Error ? err.message : String(err)}`, { timeoutMs: 6000 })
  }
}

async function handoffAndResume($: EngineInterface, st: State, trigger: 'auto' | 'button' | 'jev'): Promise<void> {
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

async function writeHandoff($: EngineInterface, st: State, trigger: 'auto' | 'command' | 'button' | 'jev'): Promise<Outcome> {
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
