import { expect, mock, test } from 'claude-code/testing'
import { formatLimits, left } from './format'

const now = Date.UTC(2026, 9, 10, 12, 0)
const at = (min: number) => new Date(now + min * 60000).toISOString()
const BUDGETS = JSON.stringify({ defaults: { window_seven_day_pct: 85 }, project: {} })
const CMD = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 120 } }
const usage = (rateLimits: Array<{ kind: string; percentUsed: number; resetsAt?: string }>) => ({
  value: { startedAt: 0, context: { window: 1000 }, rateLimits },
})
const week = (percentUsed: number) => ({ kind: 'seven_day', percentUsed, resetsAt: at(1500) })

// The engine beneath the mod: the tool stub runs when the guard lets the call through. `surfaces` is what the session draws on, attach and
// detach move it; `root` and `repo` the session's directories, budgets.json exists only at /repo; `windows` what the session reports
// (default: the week at `percent`), `noUsage` makes $.session.usage reject.
type Seat = { percent?: number; budgets?: string | null; root?: string; repo?: string | null; surfaces?: string[]; windows?: Array<{ kind: string; percentUsed: number; resetsAt?: string }>; noUsage?: boolean }
const seat = (on: any, { percent = 90, budgets = BUDGETS, root = '/repo', repo = '/repo', surfaces = [], windows, noUsage = false }: Seat) => {
  let roster = surfaces
  const seen = { registered: [] as Array<{ name: string; argumentHint?: string; immediate?: true }>, statuses: [] as unknown[] }
  mock.clock(on, { now })
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => {
    seen.registered.push(e)
    return { value: { command: e.name } }
  })
  on('session.root', () => ({ value: root }))
  on('session.repo', () => ({ value: repo === null ? null : { root: repo, remote: null, internal: false } }))
  on('fs.read', ($: any, e: any) => (budgets !== null && e.path === '/repo/budgets.json' ? { value: budgets } : { deny: 'no such file' }))
  on('session.usage', () => (noUsage ? { deny: 'no figures' } : usage(windows ?? [week(percent)])))
  on('session.surfaces', () => ({ value: roster }))
  on('session.attach', ($: any, e: any) => {
    roster = [...roster, e.surface]
    return { clientId: e.clientId }
  })
  on('session.detach', ($: any, e: any) => {
    roster = roster.filter(s => s !== e.surface)
    return { clientId: e.clientId }
  })
  on('session.measure', ($: any, e: any) => ({ changed: e.changed }))
  on('ui.status', ($: any, e: any) => {
    seen.statuses.push(e.text)
    return { value: undefined }
  })
  on('tool.call', () => ({ result: 'ran' }))
  return seen
}
const start = ($: any, isInteractive = true) => $.session.start({ cwd: '/repo', surface: isInteractive ? 'terminal' : null, isInteractive })
const call = ($: any, extra: Record<string, unknown> = {}) => $.tool.call({ tool: 'Bash', command: 'ls', ...extra })

// Ported from limits.

test('left formats hours and days, empty when past', () => {
  expect(left(at(133), now)).toBe('2h13m')
  expect(left(at(3 * 1440 + 8 * 60), now)).toBe('3d08h')
  expect(left(at(-5), now)).toBe('')
  expect(left(undefined, now)).toBe('')
})

test('formatLimits shows both windows, context and cost', () => {
  const s = formatLimits({
    rateLimits: [
      { kind: 'five_hour', percentUsed: 12.5, resetsAt: at(60) },
      { kind: 'seven_day', percentUsed: 40, resetsAt: at(1500) },
    ],
    context: { window: 1000000, tokens: 340000, percent: 34 },
    cost: { usd: 1.268 },
  }, now)
  expect(s).toBe('5h 13% ↻1h00m · 7d 40% ↻1d01h · ctx 34% · $1.27')
})

test('formatLimits is empty off a subscription before any figure', () => {
  expect(formatLimits({ rateLimits: [], context: { window: 200000 } }, now)).toBe('')
})

// The guard.

test('above the threshold: deny with the numbers, the reset and the way out; the tool does not run', async ($, on) => {
  seat(on, { percent: 86 })
  await start($)
  const r = await call($)
  expect(r.result).toBeUndefined()
  expect(r.deny).toContain('seven_day 86% > 85%')
  expect(r.deny).toContain('resets in 1d01h')
  expect(r.deny).toContain('/window override')
})

test('a fraction above the threshold is denied and reads unrounded', async ($, on) => {
  seat(on, { percent: 85.4 })
  await start($)
  expect((await call($)).deny).toContain('seven_day 85.4% > 85%')
})

test('equal to the threshold passes, as bin/check-window', async ($, on) => {
  seat(on, { percent: 85 })
  await start($)
  expect((await call($)).result).toBe('ran')
})

test('below the threshold passes', async ($, on) => {
  seat(on, { percent: 40 })
  await start($)
  expect((await call($)).result).toBe('ran')
})

test('only the week is judged: another window past the threshold passes (decision 396)', async ($, on) => {
  seat(on, { windows: [{ kind: 'five_hour', percentUsed: 99 }, week(40)] })
  await start($)
  expect((await call($)).result).toBe('ran')
})

test('/window override lifts the guard and says so; /window then shows it', async ($, on) => {
  seat(on, { percent: 90 })
  await start($)
  expect((await call($)).deny).toBeDefined()
  const { text } = await $.command.run({ command: 'window', args: 'override', ...CMD })
  expect(text).toContain('override, the guard is lifted for this session')
  expect(text).toContain('seven_day 90%')
  expect((await call($)).result).toBe('ran')
  expect((await $.command.run({ command: 'window', args: '', ...CMD })).text).toContain('override: the guard is lifted')
})

test('/window shows the numbers and the threshold, and lifts nothing', async ($, on) => {
  seat(on, { windows: [{ kind: 'five_hour', percentUsed: 12, resetsAt: at(60) }, week(90)] })
  await start($)
  const { text } = await $.command.run({ command: 'window', args: '', ...CMD })
  expect(text).toBe('five_hour 12% ↻1h00m · seven_day 90% ↻1d01h · threshold seven_day 85% (budgets.json) · tool calls are denied')
  expect((await call($)).deny).toBeDefined()
})

test('/window under the threshold says tool calls pass', async ($, on) => {
  seat(on, { percent: 40 })
  await start($)
  expect((await $.command.run({ command: 'window', args: '', ...CMD })).text).toContain('tool calls pass')
})

test('the argument of /window takes any case', async ($, on) => {
  seat(on, { percent: 90 })
  await start($)
  expect((await $.command.run({ command: 'window', args: ' OVERRIDE ', ...CMD })).text).toContain('override, the guard is lifted for this session')
  expect((await call($)).result).toBe('ran')
})

test('another argument lifts nothing', async ($, on) => {
  seat(on, { percent: 90 })
  await start($)
  expect((await $.command.run({ command: 'window', args: 'overrid', ...CMD })).text).toContain('Nothing changed')
  expect((await call($)).deny).toBeDefined()
})

test('/window shows the figure it judges unrounded', async ($, on) => {
  seat(on, { percent: 85.4 })
  await start($)
  const { text } = await $.command.run({ command: 'window', args: '', ...CMD })
  expect(text).toContain('seven_day 85.4% ↻1d01h')
  expect(text).toContain('tool calls are denied')
})

test('no budgets.json: passes, and /window says nothing is judged', async ($, on) => {
  seat(on, { percent: 99, budgets: null })
  await start($)
  expect((await call($)).result).toBe('ran')
  expect((await $.command.run({ command: 'window', args: '', ...CMD })).text).toContain('nothing is judged')
})

test('budgets.json without the key: passes', async ($, on) => {
  seat(on, { percent: 99, budgets: '{"defaults":{}}' })
  await start($)
  expect((await call($)).result).toBe('ran')
})

test('a budgets.json that does not parse passes', async ($, on) => {
  seat(on, { percent: 99, budgets: '{' })
  await start($)
  expect((await call($)).result).toBe('ran')
})

test('the threshold is the number of budgets.json, no built-in one: defaults 70 at 75 % is denied', async ($, on) => {
  seat(on, { percent: 75, budgets: JSON.stringify({ defaults: { window_seven_day_pct: 70 }, project: {} }) })
  await start($)
  expect((await call($)).deny).toContain('seven_day 75% > 70%')
})

test('budgets.json is read at the repo root, also from a session started in a subfolder', async ($, on) => {
  seat(on, { percent: 90, root: '/repo/docs' })
  await start($)
  expect((await call($)).deny).toContain('seven_day 90% > 85%')
})

test('outside a repository budgets.json is read at the session root', async ($, on) => {
  seat(on, { percent: 90, repo: null })
  await start($)
  expect((await call($)).deny).toContain('seven_day 90% > 85%')
})

test('project tightens the threshold', async ($, on) => {
  seat(on, { percent: 82, budgets: JSON.stringify({ defaults: { window_seven_day_pct: 85 }, project: { window_seven_day_pct: 80 } }) })
  await start($)
  expect((await call($)).deny).toContain('seven_day 82% > 80%')
})

test('project does not loosen it', async ($, on) => {
  seat(on, { percent: 90, budgets: JSON.stringify({ defaults: { window_seven_day_pct: 85 }, project: { window_seven_day_pct: 95 } }) })
  await start($)
  expect((await call($)).deny).toContain('seven_day 90% > 85%')
})

// Who is judged.

test('a subagent is never denied', async ($, on) => {
  seat(on, { percent: 90 })
  await start($)
  expect((await call($, { agentId: 'a1' })).result).toBe('ran')
})

test('a plain claude -p run is never denied: not interactive, no surface', async ($, on) => {
  seat(on, { percent: 90, surfaces: [] })
  await start($, false)
  expect((await call($)).result).toBe('ran')
})

test('a plain claude -p run: /window does not claim a denial', async ($, on) => {
  seat(on, { percent: 90, surfaces: [] })
  await start($, false)
  const { text } = await $.command.run({ command: 'window', args: '', ...CMD })
  expect(text).toBe('seven_day 90% ↻1d01h · threshold seven_day 85% (budgets.json) · no surface in this run: nothing is judged')
})

test('a hosted session with a surface attached, as the Code tab, is denied', async ($, on) => {
  seat(on, { percent: 90, surfaces: ['desktop'] })
  await start($, false)
  expect((await call($)).deny).toContain('seven_day 90% > 85%')
})

test('a hosted session stays judged after its page is gone: attached, then detached', async ($, on) => {
  seat(on, { percent: 90 })
  await start($, false)
  await $.session.attach({ surface: 'desktop', clientId: 'c1' })
  expect((await call($)).deny).toContain('seven_day 90% > 85%')
  await $.session.detach({ surface: 'desktop', clientId: 'c1', reason: 'detach' })
  expect((await call($)).deny).toContain('seven_day 90% > 85%')
  expect((await $.command.run({ command: 'window', args: '', ...CMD })).text).toContain('tool calls are denied')
})

test('attached and gone before any tool call: still judged', async ($, on) => {
  seat(on, { percent: 90 })
  await start($, false)
  await $.session.attach({ surface: 'desktop', clientId: 'c1' })
  await $.session.detach({ surface: 'desktop', clientId: 'c1', reason: 'detach' })
  expect((await call($)).deny).toBeDefined()
})

test('attached before session.start and gone: still judged', async ($, on) => {
  seat(on, { percent: 90 })
  await $.session.attach({ surface: 'desktop', clientId: 'c1' })
  await start($, false)
  await $.session.detach({ surface: 'desktop', clientId: 'c1', reason: 'detach' })
  expect((await call($)).deny).toBeDefined()
})

test('the REPL is denied before it reports a surface', async ($, on) => {
  seat(on, { percent: 90, surfaces: [] })
  await start($, true)
  expect((await call($)).deny).toBeDefined()
})

test('/window is registered in a hosted session too: its surface attaches after session.start', async ($, on) => {
  const seen = seat(on, {})
  await start($, false)
  expect(seen.registered.length).toBe(1)
  expect(seen.registered[0]!.name).toBe('window')
  expect(seen.registered[0]!.argumentHint).toBe('override')
  expect(seen.registered[0]!.immediate).toBe(true)
})

// Its own error.

test('its own error lets the call through', async ($, on) => {
  seat(on, { noUsage: true })
  await start($)
  expect((await call($)).result).toBe('ran')
})

test('before the first reading: passes, no warning, /window says nothing is judged yet', async ($, on) => {
  const seen = seat(on, { windows: [] })
  await start($)
  expect((await call($)).result).toBe('ran')
  const { text } = await $.command.run({ command: 'window', args: '', ...CMD })
  expect(text).toContain('no window reported yet')
  expect(text).toContain('nothing is judged yet')
  expect(text).not.toContain('WINDOW_WARN')
  await measure($, [])
  expect(seen.statuses).toEqual(['ctx 34% · $1.27'])
})

test('a window without the key is not judged: no week in the event passes', async ($, on) => {
  seat(on, { windows: [{ kind: 'five_hour', percentUsed: 99 }] })
  await start($)
  expect((await call($)).result).toBe('ran')
  expect((await $.command.run({ command: 'window', args: '', ...CMD })).text).toContain('WINDOW_WARN seven_day=fehlt')
})

// The status line.

const measure = ($: any, rateLimits: unknown[]) => $.session.measure({ context: { window: 1000, tokens: 340, percent: 34 }, rateLimits, cost: { usd: 1.268 }, changed: ['rateLimits'] })

test('the status line shows every window the session reports and the threshold', async ($, on) => {
  const seen = seat(on, {})
  await start($)
  await measure($, [{ kind: 'five_hour', percentUsed: 12.5, resetsAt: at(60) }, week(40)])
  expect(seen.statuses).toEqual(['5h 13% ↻1h00m · 7d 40% ↻1d01h · ctx 34% · $1.27 · guard 85%'])
})

test('the status line warns when the week is missing and marks the override', async ($, on) => {
  const seen = seat(on, {})
  await start($)
  await measure($, [{ kind: 'five_hour', percentUsed: 12.5, resetsAt: at(60) }])
  await $.command.run({ command: 'window', args: 'override', ...CMD })
  await measure($, [week(90)])
  expect(seen.statuses).toEqual(['5h 13% ↻1h00m · ctx 34% · $1.27 · WINDOW_WARN seven_day=fehlt', '7d 90% ↻1d01h · ctx 34% · $1.27 · guard override'])
})
