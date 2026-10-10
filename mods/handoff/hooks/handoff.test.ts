import type { RenderElement } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import { floorFor, parseJudgment, score, scrub, stateOf } from './jev'
import { handoffPrompt, parseHandoff, resumePrompt, slugify, stampOf } from './text'

test('parseHandoff takes the slug line off the top and keeps the document', () => {
  const { slug, body } = parseHandoff('\nslug: Kit v3.2 / Jev\n# Хендофф\n\n## 1. Что сделано\n- факт')
  expect(slug).toBe('kit-v3-2-jev')
  expect(body.startsWith('# Хендофф')).toBe(true)
  expect(body.endsWith('\n')).toBe(true)
})

test('parseHandoff without a slug line keeps everything', () => {
  const { slug, body } = parseHandoff('# Handoff\ntext')
  expect(slug).toBe('')
  expect(body).toBe('# Handoff\ntext\n')
})

test('slugify yields a file-safe name', () => {
  expect(slugify('  Telefon: STOP-5 / F1 red!! ')).toBe('telefon-stop-5-f1-red')
  expect(slugify('x'.repeat(60)).length).toBeLessThanOrEqual(40)
})

test('stampOf is YYYY-MM-DD-HHMM', () => {
  expect(stampOf(Date.UTC(2026, 9, 9, 12, 5))).toMatch(/^\d{4}-\d{2}-\d{2}-\d{4}$/)
})

test('prompts name the directory, the stamp and the sections', () => {
  const p = handoffPrompt('ru', '2026-10-09-0942', 'claude')
  expect(p).toContain('claude/handoff-2026-10-09-0942-<slug>.md')
  expect(p).toContain('## 5.')
  expect(resumePrompt('en', 'handoffs/handoff-x.md')).toContain('handoffs/handoff-x.md')
})

test('session.start registers /handoff only for an interactive session', async ($, on) => {
  const registered: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => {
    registered.push(e.name)
    return { value: { command: e.name } }
  })
  await $.session.start({ cwd: '/tmp/p', surface: null, isInteractive: false })
  expect(registered).toEqual([])
  await $.session.start({ cwd: '/tmp/p', surface: 'terminal', isInteractive: true })
  expect(registered).toEqual(['handoff'])
})

test('/handoff write forks the transcript and writes the file under handoffDir', { options: { handoffDir: 'claude', autoClear: false, language: 'ru' } }, async ($, on) => {
  const written: Array<{ path: string; text: string }> = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('clock.now', () => ({ value: Date.UTC(2026, 9, 9, 7, 42) }))
  on('session.root', () => ({ value: '/repo' }))
  on('model.fork', () => ({ value: { isAnswered: true as const, text: 'slug: Kit v3.2\n# Хендофф\n\n## 3. Следующее\n- шаг', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }))
  on('fs.write', ($, e) => {
    written.push({ path: e.path, text: e.text })
    return { value: undefined }
  })
  on('store.set', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  const { text } = await $.command.run({ command: 'handoff', args: 'write', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })
  expect(written.length).toBe(1)
  expect(written[0]!.path).toMatch(/^\/repo\/claude\/handoff-\d{4}-\d{2}-\d{2}-\d{4}-kit-v3-2\.md$/)
  expect(written[0]!.text.startsWith('# Хендофф')).toBe(true)
  expect(text ?? '').toContain('handoff written: claude/handoff-')
  expect(text ?? '').toContain('Прочитай claude/handoff-')
})

const BAND = { hasSurvey: false, isWorking: false, maxRows: 3, bodyColumns: 100, scroll: { offset: 0, bodyRows: 1 }, view: {} }

test('the band stays empty before the first figure and shows its buttons after a turn', { options: { threshold: 70, jev: 'off' } }, async ($, on) => {
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => ({ value: { command: e.name } }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: 84000, window: 200000, percent: 42 }, rateLimits: [] } }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return h(Box, {}) as RenderElement // the engine's own band: empty
  })
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  const first = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await first.findAll({ type: 'Button' })).toHaveLength(0)
  await $.turn.complete({ answer: 'ok', durationMs: 10, isAborted: false, turnId: 't1', reason: 'answer' })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'handoff', surface, component: 'AbovePrompt', props: BAND })
    expect(await ui.findAll({ type: 'Button' })).toHaveLength(4)
    expect(await ui.find({ key: 'now' })).toBeDefined()
    expect(await ui.find({ key: 'compact' })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /42%/ })).toBeDefined()
  }
})

// ---------- Jev boundary (absorbed from compact-adviser) ----------

const KEY = 'tsk_' + 'k'.repeat(40)
const reply = (finished: number, handsOn: number, model = 'jev-1.13.0') =>
  JSON.stringify({
    model,
    answers: {
      done: { type: 'choice', choice: 'finished', probabilities: { finished, not_finished: 1 - finished, unclear: 0 }, confidence: 0.9 },
      shape: { type: 'choice', choice: 'hands_on', probabilities: { hands_on: handsOn, coordinating: 1 - handsOn, unclear: 0 }, confidence: 0.9 },
    },
    usage: { input_tokens: 900, output_tokens: 0 },
  })

type Calls = { bodies: string[]; journal: string[]; files: string[]; toasts: string[]; submitted: string[]; commands: string[] }

/** Stubs for one session at `percent` fill whose Jev answers `jevText` (undefined: no key in the environment). */
function session(on: any, percent: number, jevText: string | undefined): Calls {
  const c: Calls = { bodies: [], journal: [], files: [], toasts: [], submitted: [], commands: [] }
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: percent * 2000, window: 200000, percent }, rateLimits: [] } }))
  on('session.turns', () => ({ value: 5 }))
  on('session.root', () => ({ value: '/repo' }))
  on('session.messages', () => ({
    value: [
      { role: 'user', text: 'сделай F1: секретный промпт', toolUses: [] },
      { role: 'assistant', text: '', toolUses: [{ tool_use_id: 'a', tool: 'Edit', input: {} }, { tool_use_id: 'b', tool: 'Bash', input: {} }] },
      { role: 'user', text: '', toolUses: [], toolResults: [{ tool_use_id: 'a', text: 'ok' }] },
    ],
  }))
  on('env.get', ($: any, e: any) => ({ value: e.name === 'TYPESAFE_API_KEY' && jevText !== undefined ? KEY : undefined }))
  on('http.fetch', ($: any, e: any) => {
    c.bodies.push(e.init?.body ?? '')
    return { value: { status: 200, ok: true, headers: {}, text: jevText ?? '' } }
  })
  on('fs.read', () => ({ deny: 'no such file' }))
  on('fs.write', ($: any, e: any) => {
    if (e.path.endsWith('/jev.jsonl')) c.journal.push(e.text)
    else c.files.push(e.path)
    return { value: undefined }
  })
  on('model.fork', () => ({ value: { isAnswered: true as const, text: 'slug: jev\n# Хендофф\n## 3. Следующее\n- шаг', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }))
  on('command.run', ($: any, e: any) => {
    c.commands.push(e.command)
    return {}
  })
  on('prompt.submit', ($: any, e: any) => {
    c.submitted.push(e.text)
    return { text: e.text }
  })
  on('turn.start', ($: any, e: any) => ({ turnId: e.turnId }))
  on('turn.complete', ($: any, e: any) => ({ text: e.answer }))
  on('store.set', () => ({ value: undefined }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.log', () => ({ value: undefined }))
  on('ui.toast', ($: any, e: any) => {
    c.toasts.push(e.text)
    return { value: undefined }
  })
  on('ui.render', ($: any, e: any) => h($.ui.resolve(e).Box, {}) as RenderElement)
  return c
}

async function settledTurn($: any, clock: any, turnId = 't1') {
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.turn.start({ text: 'сделай F1: секретный промпт', turnId })
  await $.turn.complete({ answer: `F1 готово, ${KEY} в выводе`, durationMs: 10, isAborted: false, turnId, reason: 'answer' })
  await clock.settle()
}

test('floor, score, scrub and state: the pure half', () => {
  expect(floorFor(5, 70)).toBe(0.9)
  expect(floorFor(10, 70)).toBe(0.9)
  expect(floorFor(40, 70)).toBe(0.7)
  expect(floorFor(70, 70)).toBe(0.5)
  expect(score({ finished: 1, handsOn: 1, model: 'm', inputTokens: 0, outputTokens: 0 })).toBe(1)
  expect(score({ finished: 1, handsOn: 0, model: 'm', inputTokens: 0, outputTokens: 0 })).toBe(0.5)
  expect(scrub(`x ${KEY} y sk-ant-${'a'.repeat(24)} z`, KEY)).toBe('x [key] y [key] z')
  expect(typeof parseJudgment(reply(0.9, 0.9, 'jev-latest'))).toBe('string')
  expect(stateOf('p', 'a', ['Edit', 'Edit', 'Bash'], KEY).tool_calls).toEqual({ Edit: 2, Bash: 1 })
  expect(stateOf('p'.repeat(5000), 'a', [], KEY).prompt.length).toBeLessThan(2100)
})

test('jev: hint — a finished hands-on answer lights the band; the key and the prompt stay home', { options: { threshold: 70, jev: 'hint' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.bodies).toHaveLength(1)
  const body = JSON.parse(c.bodies[0]!)
  expect(body.model).toBe('jev-1.13.0')
  expect(body.state.tool_calls).toEqual({ Edit: 1, Bash: 1 })
  expect(c.bodies[0]).not.toContain(KEY)
  const ui = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /Jev: задача на границе 0\.9\d ≥ 0\.70/ })).toBeDefined()
  expect(c.journal).toHaveLength(1)
  expect(c.journal[0]).toContain('"decision":"hint"')
  expect(c.journal[0]).not.toContain('секретный')
  expect(c.files).toHaveLength(0) // hint only: no handoff written
  // the next turn starts: the hint is gone
  await $.turn.start({ text: 'дальше', turnId: 't2' })
  const after = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await after.find({ type: 'Text', text: /Jev:/ })).toBeUndefined()
})

test('jev: auto — at the boundary the handoff is written, /clear runs and the resume prompt goes', { options: { threshold: 70, jev: 'auto', autoClear: true } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.files.some(p => /^\/repo\/handoffs\/handoff-.*-jev\.md$/.test(p))).toBe(true)
  expect(c.commands).toContain('clear')
  expect(c.submitted.some(t => t.includes('Прочитай handoffs/handoff-'))).toBe(true)
  expect(c.journal[0]).toContain('"decision":"auto"')
})

test('jev: below the floor — no advice, nothing written', { options: { threshold: 70, jev: 'auto' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.5, 0.2)) // 0.30 < 0.70
  await settledTurn($, clock)
  expect(c.files).toHaveLength(0)
  expect(c.journal[0]).toContain('"decision":"below"')
})

test('jev: a reply from another model is an error, not advice', { options: { threshold: 70, jev: 'auto' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.99, 0.99, 'jev-latest'))
  await settledTurn($, clock)
  expect(c.files).toHaveLength(0)
  expect(c.journal[0]).toContain('"decision":"error"')
})

test('jev: no key in the environment — Jev is never called', { options: { threshold: 70, jev: 'hint' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, undefined)
  await settledTurn($, clock)
  expect(c.bodies).toHaveLength(0)
  expect(c.journal).toHaveLength(0)
})

test('jev: a judgment that returns after the next turn began is dropped', { options: { threshold: 70, jev: 'auto' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.turn.start({ text: 'p', turnId: 't1' })
  await $.turn.complete({ answer: 'готово', durationMs: 10, isAborted: false, turnId: 't1', reason: 'answer' })
  await $.turn.start({ text: 'новый промпт', turnId: 't2' }) // the person typed on before Jev answered
  await clock.settle()
  expect(c.files).toHaveLength(0)
  expect(c.commands).not.toContain('clear')
  expect(c.journal[0]).toContain('"decision":"stale"')
})

test('jev: off — Jev is never asked', { options: { threshold: 70, jev: 'off' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.bodies).toHaveLength(0)
})

test('jev: under 10 % fill — not asked: a fresh context has nothing to hand off', { options: { threshold: 70, jev: 'hint' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 9, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.bodies).toHaveLength(0)
})

test('after /clear the band comes back at once, and Compact runs the host compaction', { options: { threshold: 70, jev: 'off' } }, async ($, on) => {
  mock.clock(on)
  session(on, 3, undefined)
  let compacted = 0
  on('classic.SessionStart', () => ({}))
  on('session.compact', () => {
    compacted++
    return { skip: 'nothing to compact' }
  })
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.classic.SessionStart({ source: 'clear' })
  const ui = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /3%/ })).toBeDefined()
  await ui.press({ key: 'compact' })
  expect(compacted).toBe(1)
  const after = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await after.find({ type: 'Text', text: /compact: nothing to compact/ })).toBeDefined()
})
