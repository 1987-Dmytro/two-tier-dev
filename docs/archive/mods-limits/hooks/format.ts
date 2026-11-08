import type { SessionMeasureInput } from 'claude-code'

const LABEL: Record<string, string> = { five_hour: '5h', seven_day: '7d', spend_limit: 'spend' }

// "2h13m" / "3d08h" until `iso`; "" when past or absent.
export const left = (iso: string | undefined, now: number): string => {
  const ms = iso ? Date.parse(iso) - now : NaN
  if (!(ms > 0)) return ''
  const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60)
  return d > 0 ? `${d}d${String(h).padStart(2, '0')}h` : `${h}h${String(m % 60).padStart(2, '0')}m`
}

// "5h 12% ↻1h00m · 7d 40% ↻1d01h · ctx 34% · $1.27"
export const formatLimits = (u: Pick<SessionMeasureInput, 'rateLimits' | 'context' | 'cost'>, now: number): string => {
  const parts = u.rateLimits.map(r => {
    const t = left(r.resetsAt, now)
    return `${LABEL[r.kind] ?? r.kind} ${Math.round(r.percentUsed)}%${t ? ` ↻${t}` : ''}`
  })
  if (u.context.percent !== undefined) parts.push(`ctx ${u.context.percent}%`)
  if (u.cost) parts.push(`$${u.cost.usd.toFixed(2)}`)
  return parts.join(' · ')
}
