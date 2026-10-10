import { expect, test } from 'claude-code/testing'
import { formatLimits, left } from './format'

const now = Date.UTC(2026, 9, 10, 12, 0)
const at = (min: number) => new Date(now + min * 60000).toISOString()

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
