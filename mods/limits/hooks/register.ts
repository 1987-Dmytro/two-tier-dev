// limits — pins the rate-limit windows (5h, 7d), context fill and session cost as this mod's status line.
import type { Register } from 'claude-code'
import { formatLimits } from './format'

export const register: Register = on => {
  // ponytail: countdowns refresh on each measurement (every turn, every whole point moved), not every minute;
  //           add a $.clock tick if a live countdown while idle matters.
  on('session.measure', async ($, e, next) => {
    $.ui.status(formatLimits(e, await $.clock.now()) || undefined)
    return next(e)
  })
}
