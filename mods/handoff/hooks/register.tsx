// handoff — a Claude Code mod (two-tier-dev).
// 0.5.0: the handoff rides a compaction in the same session — never /clear. A /clear dropped the conversation, the task list
// and the tie to background work; a compaction keeps the session (its id, tasks, background tasks, notifications) and puts a
// summary in the conversation's place. The mod tells every compaction of a person's session what to keep — the handoff's
// sections — and saves its summary under `handoffDir` as the map on disk:
// - the engine's own compaction (its threshold mid-turn, `/compact`): a `session.compact` hook adds the instructions;
// - past `threshold` at the end of a turn, on Jev's boundary (`jev: auto`), on the band's button or `/handoff now`: the mod
//   compacts itself between turns ($.session.compact with the instructions — a plugin's own call skips its own hook).
// A turn's growth past the threshold is bounded only by the engine's compaction window (`autoCompactWindow`): the mod
// cannot compact while a turn runs. `/handoff status` prints that window beside the threshold.
// Below the threshold, Jev (absorbed from compact-adviser) judges each settled answer: is the unit of work finished,
// and was it hands-on? Past a floor that slides with the fill, `jev: hint` lights the band, `jev: auto` compacts there.
// SPEC-v3.5 F1 (0.4.0): /handoff is registered everywhere the mod loads — a host like the Code tab starts as the SDK does (isInteractive
// false) and attaches a surface later; the mod acts by itself only in a person's session: the REPL or an attached surface, the rule of
// spec-board and window-guard (an attach is latched). The threshold is `handoff_threshold_pct` of the project's budgets.json (defaults,
// project only tightens — the rule of window-guard), else the `threshold` option, else 70; it is read at each decision and each status.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionCompacted, SessionMessage } from 'claude-code'
import { JEV_FROM, JEV_TIMEOUT_MS, JEV_URL, floorFor, parseJudgment, requestBody, score, stateOf, type Judgment, type Mode } from './jev'
import { compactDoc, compactInstructions, handoffPrompt, parseHandoff, resumePrompt, stampOf, summaryOf, withInstructions, type Lang } from './text'

type Settings = { threshold: number; handoffDir: string; autoCompact: boolean; minTurns: number; language: Lang; jev: Mode }

type State = {
  s: Settings
  isAttended: boolean // the REPL, or a surface attached once (session.attach): a person's session
  isArmed: boolean // re-armed once the fill drops well below the threshold (after a compaction: its size afterwards)
  threshold: number // the threshold of the last decision: what the band and Jev's floor read
  isRunning: boolean
  lastPath: string | undefined
  lastJev: string // Jev's last decision as /handoff status names it ('—' before the first)
  prompt: string // the user's last typed prompt: what Jev reads beside the answer
  seq: number // turns started: a judgment that comes back after the next turn began is dropped
  judged: string | undefined // the turn Jev was last asked about
}

type Outcome = { isWritten: true; relPath: string; text: string } | { isWritten: false; text: string }
type Trigger = 'threshold' | 'jev' | 'button' | 'command'

const fill = atom({ plugin: 'handoff', key: 'fill' } as const, null)
const isHidden = atom({ plugin: 'handoff', key: 'isHidden' } as const, false)
const note = atom({ plugin: 'handoff', key: 'note' } as const, '')
const advice = atom({ plugin: 'handoff', key: 'advice' } as const, '')

const clamp = (n: number, lo: number, hi: number) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo)
const kTokens = (n: number | undefined) => (n === undefined ? '?' : `${Math.round(n / 1000)}k`)
type Fill = { tokens?: number; window: number; percent?: number; isCompactionWindow: boolean }
const sizeOf = (f: Fill) => (f.tokens === undefined ? '' : ` · ${kTokens(f.tokens)}/${kTokens(f.window)}`)
const percentOf = (tokens: number, window: number) => Math.round((tokens / window) * 100)

// The fill as the person sees it — the app's context figure and /context measure against the compaction window
// (`autoCompactWindow`, `rawMaxTokens`), which may be smaller than the model's: 386k is 64 % of a 600k compaction window and
// only 38 % of a 1M model window. `context.percent` is the model's; the breakdown (`summary`: estimated locally, no request)
// names the compaction window. No breakdown — the model's window, as before.
async function fillOf($: EngineInterface): Promise<Fill> {
  const { context } = await $.session.usage({ breakdown: 'summary' })
  const raw = context.breakdown?.rawMaxTokens
  if (raw !== undefined && raw > 0) {
    return { tokens: context.tokens, window: raw, percent: context.tokens === undefined ? undefined : percentOf(context.tokens, raw), isCompactionWindow: raw !== context.window }
  }
  return { tokens: context.tokens, window: context.window, percent: context.percent, isCompactionWindow: false }
}
const messageOf = (err: unknown) => (err instanceof Error ? err.message : String(err))

const settingsOf = (o: Readonly<Record<string, unknown>>): Settings => ({
  threshold: clamp(Number(o.threshold ?? 70), 10, 95),
  handoffDir: String(o.handoffDir ?? 'handoffs').replace(/^\/+|\/+$/g, '') || 'handoffs',
  autoCompact: o.autoCompact !== false,
  minTurns: Math.max(0, Number(o.minTurns ?? 2)),
  language: o.language === 'en' ? 'en' : 'ru',
  jev: o.jev === 'off' || o.jev === 'auto' ? o.jev : 'hint',
})

const words = (lang: Lang) =>
  lang === 'en'
    ? { now: 'Hand off → compact', file: 'File only', hide: 'Hide', ctx: 'ctx', at: 'handoff @', jev: 'Jev: unit finished' }
    : { now: 'Передать → compact', file: 'Только файл', hide: 'Скрыть', ctx: 'контекст', at: 'хендофф @', jev: 'Jev: задача на границе' }

export const register: Register = (on, options) => {
  const st: State = {
    s: settingsOf(options),
    isAttended: false,
    isArmed: true,
    threshold: 70,
    isRunning: false,
    lastPath: undefined,
    lastJev: '—',
    prompt: '',
    seq: 0,
    judged: undefined,
  }

  on('session.start', async ($, e, next) => {
    st.isAttended ||= e.isInteractive // a host may attach before this runs
    await $.command.register({
      name: 'handoff',
      description: 'Hand off in place: `now` compacts this session with the handoff sections (never /clear); `write` writes the file only.',
      argumentHint: 'now | write | status | last',
    })
    return next(e)
  })

  on('session.attach', ($, e, next) => {
    st.isAttended = true
    return next(e)
  })

  // A main-loop turn begins: keep the typed prompt for Jev, drop the last hint. A subagent's or teammate's run raises it too
  // (e.agentId): it is not the person's turn, so it neither replaces the prompt nor makes a pending judgment stale.
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    st.seq++
    if (e.text.trim()) st.prompt = e.text
    if (await read($, advice)) await update($, advice, () => '')
    return next(e)
  })

  // A person's /clear resets $.state, and session.start does not fire again: put the fill back so the band shows at once.
  on('classic.SessionStart', async ($, e, next) => {
    const result = await next(e)
    if (e.source !== 'clear' || !(await isPersons($, st))) return result
    try {
      const { percent } = await fillOf($)
      if (percent !== undefined) await update($, fill, () => percent)
    } catch {
      /* no figure: the band comes back after the next turn */
    }
    return result
  })

  // Every compaction of a person's main conversation the mod did not start itself — the engine's threshold mid-turn, a
  // `/compact`, another plugin, a precompute: the summary keeps the handoff's sections; once it stands, it is saved as a file.
  on('session.compact', async ($, e, next) => {
    if (e.agentId !== undefined || !(await isPersons($, st))) return next(e)
    const result = await next({ ...e, instructions: withInstructions(e.instructions, compactInstructions(st.s.language)) })
    if (e.trigger === 'precompute' || result.skip !== undefined) return result
    await afterCompact($, st, e.trigger, e.messages, result)
    return result
  })

  // The decision point: after every main-loop turn, read the window's fill; past the threshold — compact in place;
  // below it, ask Jev whether this answer closes a unit of work.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId !== undefined || st.isRunning || e.isAborted || !(await isPersons($, st))) return result
    const threshold = (st.threshold = await thresholdOf($, st))
    let now: Fill | undefined
    try {
      now = await fillOf($)
    } catch {
      /* shown below as unknown */
    }
    const percent = now?.percent
    if (now === undefined || percent === undefined) {
      // No figure (no response yet in this window, or the read failed): no decision — said, not silent.
      $.ui.status(`ctx unknown · handoff @${threshold}%`)
      return result
    }
    await update($, fill, () => percent)
    $.ui.status(`ctx ${percent}%${sizeOf(now)} · handoff @${threshold}%`)
    if (percent < threshold - 20) st.isArmed = true
    if (percent < threshold) {
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
    $.ui.toast(
      st.s.autoCompact
        ? `handoff: context at ${percent}% — compacting in place; the work stays in this session…`
        : `handoff: context at ${percent}% — writing the handoff file…`,
      { timeoutMs: 6000 },
    )
    // Outside this dispatch, once the turn has ended: a compaction is refused while a turn runs.
    $.clock.after(250, () => void (st.s.autoCompact ? compactInPlace($, st, 'threshold') : handoffFileOnly($, st, 'threshold')))
    return result
  })

  on('command.run', { command: 'handoff' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'status') return { text: await statusLine($, st) }
    if (arg === 'last') {
      const last = st.lastPath ?? (await readLast($))
      return { text: last ? `last handoff: ${last}` : 'no handoff written yet' }
    }
    if (arg === 'now') {
      // The compaction cannot run inside the command's own dispatch; it follows once the session is idle.
      $.clock.after(100, () => void compactInPlace($, st, 'command'))
      return { text: 'handoff: compacting in place with the handoff sections — the work stays in this session…' }
    }
    const outcome = await writeHandoff($, st, 'command')
    if (!outcome.isWritten) return { text: outcome.text }
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
    const isHot = percent >= st.threshold || tip !== ''
    return (
      <Box>
        <Text color={isHot ? 'yellow' : undefined} dimColor={!isHot}>
          {w.ctx} {percent}% · {w.at}
          {st.threshold}%{tip ? ` · ${w.jev} ${tip}` : ''}{last ? ` · ${last}` : ''}{' '}
        </Text>
        <Button key="now" label={w.now} hotkey="h" variant="primary" onPress={() => void compactInPlace($, st, 'button')} />
        <Text> </Text>
        <Button key="file" label={w.file} hotkey="f" onPress={() => void handoffFileOnly($, st)} />
        <Text> </Text>
        <Button key="hide" label={w.hide} plain onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}

// Jev's judgment of the answer just settled: the hint, or (jev: auto) the compaction right at the boundary.
// No key, an error, a timeout or a wrong model — no advice and nothing changes; each call is one journal line, no content.
async function judgeBoundary($: EngineInterface, st: State, answer: string, percent: number, seq: number): Promise<void> {
  if (st.isRunning) return
  const key = await $.env.get('TYPESAFE_API_KEY')
  if (!key) {
    st.lastJev = `no TYPESAFE_API_KEY at ${percent}%`
    return
  }
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
    verdict = `network: ${messageOf(err)}`.split(key).join('[key]')
  }
  const floor = floorFor(percent, st.threshold)
  const s = typeof verdict === 'string' ? undefined : Math.round(score(verdict) * 100) / 100
  const isStale = st.seq !== seq || st.isRunning
  const decision = s === undefined ? 'error' : isStale ? 'stale' : s < floor ? 'below' : st.s.jev
  st.lastJev = `${decision} ${s === undefined ? '' : `${s.toFixed(2)}/${floor.toFixed(2)} `}at ${percent}%`
  await journal($, st, 'jev.jsonl', {
    at: new Date(t0).toISOString(),
    ms: (await $.clock.now()) - t0,
    percent,
    floor,
    score: s,
    decision,
    ...(typeof verdict === 'string' ? { error: verdict } : { model: verdict.model, in: verdict.inputTokens, out: verdict.outputTokens }),
  })
  if (s === undefined || isStale) return
  $.ui.status(`ctx ${percent}% · handoff @${st.threshold}% · jev ${s.toFixed(2)}/${floor.toFixed(2)}`)
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
      $.ui.toast(`handoff: Jev — unit finished (${tip}), ${st.s.autoCompact ? 'compacting in place' : 'writing the handoff file'}…`, { timeoutMs: 6000 })
      await (st.s.autoCompact ? compactInPlace($, st, 'jev') : handoffFileOnly($, st, 'jev'))
      return
    }
  }
  await update($, advice, () => tip) // the band turns yellow; no toast — every finished answer would raise one
}

// One line per record in <handoffDir>/<file>: numbers and decisions, never the prompt, the answer or the summary.
// ponytail: read-and-rewrite append, a 4 MiB file (~25k lines) is the ceiling; rotate by date if it ever nears it.
async function journal($: EngineInterface, st: State, file: string, rec: Record<string, unknown>): Promise<void> {
  try {
    const path = `${await $.session.root()}/${st.s.handoffDir}/${file}`
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

// The mod's own compaction, between turns: the handoff's sections as instructions, then the same bookkeeping as the hook's.
// Not done — busy, vetoed ({ skip }), refused (a turn runs) or failed: nothing is cleared; a trigger that disarmed the mod
// (threshold, Jev) re-arms it, so the next turn's end tries again; the button and /handoff now never held the arm.
async function compactInPlace($: EngineInterface, st: State, trigger: Trigger): Promise<void> {
  const rearm = () => {
    if (trigger === 'threshold' || trigger === 'jev') st.isArmed = true
  }
  if (st.isRunning) {
    rearm()
    return
  }
  st.isRunning = true
  try {
    let before: readonly SessionMessage[] = []
    try {
      before = await $.session.messages()
    } catch {
      /* no snapshot: the file holds every text the compaction left */
    }
    const result = await $.session.compact({ instructions: compactInstructions(st.s.language) })
    if (result.skip !== undefined) {
      rearm()
      await update($, note, () => `compact: ${result.skip}`)
      return
    }
    const relPath = await afterCompact($, st, trigger, before, result)
    await update($, note, () => (relPath ? `compacted · ${relPath}` : 'compacted'))
    await update($, advice, () => '')
  } catch (err) {
    rearm()
    const why = `handoff: compact failed — ${messageOf(err)}; nothing was cleared`
    $.ui.toast(why, { timeoutMs: 8000 })
    await update($, note, () => why)
  } finally {
    st.isRunning = false
  }
}

// A compaction stood: save its summary as the handoff file, re-arm from its size afterwards (the last response's figure is
// stale until the next one), one journal line. Returns the file's path relative to the root, or undefined when unwritten.
async function afterCompact($: EngineInterface, st: State, trigger: string, before: readonly SessionMessage[], result: SessionCompacted): Promise<string | undefined> {
  let relPath: string | undefined
  let at = 0
  try {
    at = await $.clock.now()
    const stamp = stampOf(at)
    const path = `${st.s.handoffDir}/handoff-${stampOf(at, true)}-compact-${trigger}.md` // to the second: two in a minute keep both
    await $.fs.write(`${await $.session.root()}/${path}`, compactDoc(st.s.language, stamp, trigger, summaryOf(before, result.messages), result.tokensBefore, result.tokensAfter))
    relPath = path
    st.lastPath = path
    $.ui.log(`handoff (compact, ${trigger}): ${path}`)
    try {
      await $.store.set('lastPath', path)
    } catch {
      /* the store is a convenience */
    }
  } catch (err) {
    $.ui.toast(`handoff: compacted, but the file failed — ${messageOf(err)}`, { timeoutMs: 6000 })
  }
  try {
    const { window } = await fillOf($) // the same window the band and the threshold read
    if (result.tokensAfter !== undefined && window > 0) {
      const percent = percentOf(result.tokensAfter, window)
      const threshold = await thresholdOf($, st)
      await update($, fill, () => percent)
      $.ui.status(`ctx ${percent}% · ${kTokens(result.tokensAfter)}/${kTokens(window)} · handoff @${threshold}% · compacted`)
      if (percent < threshold - 20) st.isArmed = true
    }
  } catch {
    /* no window: the next turn's figure re-arms */
  }
  await journal($, st, 'compact.jsonl', {
    at: new Date(at).toISOString(),
    trigger,
    before: result.tokensBefore ?? null,
    after: result.tokensAfter ?? null,
    file: relPath ?? null,
  })
  return relPath
}

async function handoffFileOnly($: EngineInterface, st: State, trigger: Trigger = 'button'): Promise<void> {
  const outcome = await writeHandoff($, st, trigger)
  await update($, note, () => outcome.text)
  if (outcome.isWritten) $.ui.log(`fresh-session line: ${resumePrompt(st.s.language, outcome.relPath)}`)
}

// A person's session: the REPL, or a surface attached now or once (spec-board and window-guard read it the same way).
async function isPersons($: EngineInterface, st: State): Promise<boolean> {
  return st.isAttended || (await $.session.surfaces()).length > 0
}

const isPct = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

// handoff_threshold_pct of the project's budgets.json (the repo root, else the session root): defaults, and project only tightens; no file,
// bad JSON or no key — undefined.
async function budgetThreshold($: EngineInterface): Promise<number | undefined> {
  try {
    const root = (await $.session.repo())?.root ?? (await $.session.root())
    const { defaults, project } = JSON.parse(await $.fs.read(`${root}/budgets.json`))
    const d = isPct(defaults?.handoff_threshold_pct) ? defaults.handoff_threshold_pct : undefined
    const p = isPct(project?.handoff_threshold_pct) ? project.handoff_threshold_pct : undefined
    return p !== undefined && (d === undefined || p <= d) ? p : d
  } catch {
    return undefined
  }
}

// The threshold now: budgets.json, else the option (the user's settings — the fallback), clamped as the option is.
async function thresholdOf($: EngineInterface, st: State): Promise<number> {
  const b = await budgetThreshold($)
  return b === undefined ? st.s.threshold : clamp(b, 10, 95)
}

// The engine's own compaction point (autoCompactWindow): what bounds a turn's growth past the threshold.
async function autoCompactText($: EngineInterface): Promise<string> {
  try {
    const b = (await $.session.usage({ breakdown: 'summary' })).context.breakdown
    if (!b) return 'unknown'
    return b.isAutoCompactEnabled && b.autoCompactThreshold !== undefined ? `${kTokens(b.autoCompactThreshold)} (${b.autocompactSource})` : 'off'
  } catch {
    return 'unknown'
  }
}

async function statusLine($: EngineInterface, st: State): Promise<string> {
  let fillText = 'unknown'
  try {
    const f = await fillOf($)
    const of = `${f.window} tokens (${f.isCompactionWindow ? 'compaction window, as the app shows' : 'model window'})`
    fillText = f.percent === undefined ? `unknown of ${of}, no response since the start or the last compaction` : `${f.percent}% of ${of}, ${kTokens(f.tokens)}`
  } catch {
    /* no figure */
  }
  const last = st.lastPath ?? (await readLast($))
  const b = await budgetThreshold($)
  const surfaces = await $.session.surfaces()
  const surface = surfaces.length ? surfaces.join(',') : st.isAttended ? 'attached' : 'none'
  const key = st.s.jev === 'off' ? '' : ` (key ${(await $.env.get('TYPESAFE_API_KEY')) ? 'present' : 'absent'}; last ${st.lastJev})`
  return [
    `handoff · context ${fillText}`,
    `threshold ${await thresholdOf($, st)}% (${b === undefined ? 'option' : 'budgets.json'})`,
    `engine compacts at ${await autoCompactText($)}`,
    `surface ${surface}`,
    `armed ${st.isArmed ? 'yes' : 'no'}`,
    `auto-compact ${st.s.autoCompact ? 'on' : 'off'}`,
    `jev ${st.s.jev}${key}`,
    `dir ${st.s.handoffDir}/`,
    `last: ${last ?? '—'}`,
  ].join(' · ')
}

async function readLast($: EngineInterface): Promise<string | undefined> {
  try {
    const v = await $.store.get('lastPath')
    return typeof v === 'string' ? v : undefined
  } catch {
    return undefined
  }
}

async function writeHandoff($: EngineInterface, st: State, trigger: Trigger): Promise<Outcome> {
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
    const why = `handoff: failed — ${messageOf(err)}`
    $.ui.toast(why, { timeoutMs: 6000 })
    return { isWritten: false, text: why }
  } finally {
    st.isRunning = false
  }
}
