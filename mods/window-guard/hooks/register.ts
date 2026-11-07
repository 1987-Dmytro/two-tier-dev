// window-guard — a Claude Code mod (two-tier-dev) that absorbs limits (docs/archive/mods-limits).
// Pins the windows the session reports as the status line, as limits did. Above window_seven_day_pct of the project's budgets.json a
// tool call is denied with the numbers and the reset (decision 396: only the week is judged; equal passes, as in bin/check-window; no
// budgets.json or no key: nothing is judged, no built-in number). /window shows the numbers; /window override lifts the guard until
// this process ends or the mod reloads, /clear included: the handoff mod clears the context by itself.
// Who is judged: a person's session, main loop only. A subagent's or a workflow agent's call carries agentId. isInteractive is true only
// under the REPL: a host like the Code tab starts as the SDK does (false, no surface) and attaches a surface later, so the surfaces are
// read at the call, and /window is registered everywhere. A plain `claude -p` run has none and is never denied.
// No model and no network on tool.call. No .catch: on its own error the hook is skipped and the call goes through (kit rule).

import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'
import { exact, formatLimits, left } from './format'

const WEEK = 'seven_day'
const KEY = 'window_seven_day_pct'

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

// The rule of bin/check-window: defaults, and project only tightens. No file, bad JSON or no key: nothing to judge against.
async function readLimit($: EngineInterface): Promise<number | undefined> {
  try {
    const { defaults, project } = JSON.parse(await $.fs.read(`${await $.session.root()}/budgets.json`))
    const d = isNumber(defaults?.[KEY]) ? defaults[KEY] : undefined
    return isNumber(project?.[KEY]) && (d === undefined || project[KEY] <= d) ? project[KEY] : d
  } catch {
    return undefined
  }
}

const noteOf = (windows: readonly SessionRateLimit[], limit: number | undefined, isOverridden: boolean): string => {
  if (limit === undefined || !windows.length) return '' // no window at all: off a subscription or before the first reading
  if (isOverridden) return 'guard override'
  return windows.some(r => r.kind === WEEK) ? `guard ${limit}%` : `WINDOW_WARN ${WEEK}=fehlt`
}

const report = (windows: readonly SessionRateLimit[], limit: number | undefined, isOverridden: boolean, now: number): string => {
  const shown = windows.map(r => exact(r, now)).join(' · ') || 'no window reported yet'
  if (limit === undefined) return `${shown} · no ${KEY} in budgets.json: nothing is judged`
  const week = windows.find(r => r.kind === WEEK)
  const state = isOverridden
    ? 'override: the guard is lifted'
    : !windows.length
      ? 'nothing is judged yet'
      : !week
        ? `WINDOW_WARN ${WEEK}=fehlt: nothing is judged`
        : week.percentUsed > limit
          ? 'tool calls are denied'
          : 'tool calls pass'
  return `${shown} · threshold ${WEEK} ${limit}% (budgets.json) · ${state}`
}

export const register: Register = on => {
  let isInteractive = false
  let isOverridden = false
  let limit: number | undefined

  on('session.start', async ($, e, next) => {
    isInteractive = e.isInteractive
    limit = await readLimit($)
    await $.command.register({
      name: 'window',
      description: 'Show the subscription windows against budgets.json; `override` lifts the guard for this session.',
      argumentHint: 'override',
      immediate: true,
    })
    return next(e)
  })

  // ponytail: countdowns refresh on each measurement (every turn, every whole point moved), not every minute;
  //           add a $.clock tick if a live countdown while idle matters.
  on('session.measure', async ($, e, next) => {
    const parts = [formatLimits(e, await $.clock.now()), noteOf(e.rateLimits, limit, isOverridden)]
    $.ui.status(parts.filter(Boolean).join(' · ') || undefined)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId !== undefined || isOverridden || limit === undefined) return next(e)
    const week = (await $.session.usage()).rateLimits.find(r => r.kind === WEEK)
    if (!week || week.percentUsed <= limit) return next(e)
    if (!isInteractive && !(await $.session.surfaces()).length) return next(e)
    const reset = left(week.resetsAt, await $.clock.now())
    return {
      deny: `window-guard: ${WEEK} ${week.percentUsed}% > ${limit}% (budgets.json ${KEY})${reset ? `, resets in ${reset}` : ''}. The call did not run. End the turn and tell the operator; only the operator lifts it, with /window override.`,
    }
  })

  on('command.run', { command: 'window' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg && arg !== 'override') return { text: `unknown argument «${arg}»: /window shows the numbers, /window override lifts the guard for this session. Nothing changed.` }
    const { rateLimits } = await $.session.usage()
    if (arg) isOverridden = true
    const line = report(rateLimits, limit, isOverridden, await $.clock.now())
    return { text: arg ? `override, the guard is lifted for this session · ${line}` : line }
  })
}
