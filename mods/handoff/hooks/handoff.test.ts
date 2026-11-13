import type { RenderElement } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import { floorFor, parseJudgment, score, scrub, stateOf } from './jev'
import { compactDoc, compactInstructions, handoffPrompt, parseHandoff, resumePrompt, slugify, stampOf, summaryOf, withInstructions } from './text'

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

test('compaction helpers: the summary is what is new, the person speaks first, the file names the trigger and sizes', () => {
  expect(summaryOf([{ text: 'a' }, { text: 'b' }], [{ text: 'S' }, { text: 'b' }, { text: ' ' }])).toBe('S')
  expect(withInstructions(undefined, 'ours')).toBe('ours')
  expect(withInstructions('  mine ', 'ours')).toBe('mine\n\nours')
  const doc = compactDoc('ru', '2026-11-13-1810', 'auto', 'СВОДКА', 427568, 41000)
  expect(doc.startsWith('# Хендофф 2026-11-13-1810 — сжатие (auto)')).toBe(true)
  expect(doc).toContain('428k → 41k')
  expect(doc).toContain('СВОДКА')
  expect(compactDoc('en', 's', 'jev', '')).toContain('no summary text')
  expect(compactInstructions('en')).toContain('background')
})

test('session.start registers /handoff everywhere: a hosted session (the Code tab) too', async ($, on) => {
  const registered: string[] = []
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('command.register', ($, e) => {
    registered.push(e.name)
    return { value: { command: e.name } }
  })
  await $.session.start({ cwd: '/tmp/p', surface: null, isInteractive: false })
  expect(registered).toEqual(['handoff'])
})

test('/handoff write forks the transcript and writes the file under handoffDir', { options: { handoffDir: 'claude', language: 'ru' } }, async ($, on) => {
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

const BAND = { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 3, bodyColumns: 100, scroll: { offset: 0, bodyRows: 1 }, view: {} }

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
    expect(await ui.findAll({ type: 'Button' })).toHaveLength(3)
    expect(await ui.find({ key: 'now' })).toBeDefined()
    expect(await ui.find({ key: 'file' })).toBeDefined()
    expect(await ui.find({ key: 'compact' })).toBeUndefined()
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

type Compaction = { trigger: string; instructions?: string; agentId?: string }
type Calls = { bodies: string[]; journal: string[]; files: string[]; docs: Record<string, string>; toasts: string[]; submitted: string[]; commands: string[]; compactions: Compaction[] }

const KEPT = { role: 'user' as const, text: 'последний промпт', toolUses: [] }
const SUMMARY = { role: 'user' as const, text: 'СВОДКА: F1 сделан, дальше F2', toolUses: [] }
/** What core answers a compaction with: the summary and one kept message, `after` tokens afterwards (null: core recorded none). */
const compacted = (after: number | null = 40000): any => ({ messages: [SUMMARY, KEPT], tokensBefore: 400000, ...(after === null ? {} : { tokensAfter: after }) })

/** Stubs for one session at `percent` fill whose Jev answers `jevText` (undefined: no key in the environment); core answers a compaction with `core()`. */
function session(on: any, percent: number, jevText: string | undefined, core: () => any = () => compacted(), fetchError?: string): Calls {
  const c: Calls = { bodies: [], journal: [], files: [], docs: {}, toasts: [], submitted: [], commands: [], compactions: [] }
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { tokens: percent * 2000, window: 200000, percent }, rateLimits: [] } }))
  on('session.turns', () => ({ value: 5 }))
  on('session.root', () => ({ value: '/repo' }))
  on('session.messages', () => ({
    value: [
      KEPT,
      { role: 'user', text: 'сделай F1: секретный промпт', toolUses: [] },
      { role: 'assistant', text: '', toolUses: [{ tool_use_id: 'a', tool: 'Edit', input: {} }, { tool_use_id: 'b', tool: 'Bash', input: {} }] },
      { role: 'user', text: '', toolUses: [], toolResults: [{ tool_use_id: 'a', text: 'ok' }] },
    ],
  }))
  on('env.get', ($: any, e: any) => ({ value: e.name === 'TYPESAFE_API_KEY' && jevText !== undefined ? KEY : undefined }))
  on('http.fetch', ($: any, e: any) => {
    c.bodies.push(e.init?.body ?? '')
    if (fetchError !== undefined) return { deny: fetchError }
    return { value: { status: 200, ok: true, headers: {}, text: jevText ?? '' } }
  })
  on('fs.read', () => ({ deny: 'no such file' }))
  on('fs.write', ($: any, e: any) => {
    if (e.path.endsWith('.jsonl')) c.journal.push(e.text)
    else {
      c.files.push(e.path)
      c.docs[e.path] = e.text
    }
    return { value: undefined }
  })
  on('model.fork', () => ({ value: { isAnswered: true as const, text: 'slug: jev\n# Хендофф\n## 3. Следующее\n- шаг', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }))
  on('session.compact', ($: any, e: any) => {
    c.compactions.push({ trigger: e.trigger, instructions: e.instructions, agentId: e.agentId })
    return core()
  })
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
  expect(c.journal[0]).not.toContain(KEY)
  expect(c.journal[0]).not.toContain('F1 готово')
  expect(c.files).toHaveLength(0) // hint only: no handoff written
  // the next turn starts: the hint is gone
  await $.turn.start({ text: 'дальше', turnId: 't2' })
  const after = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await after.find({ type: 'Text', text: /Jev:/ })).toBeUndefined()
})

test('jev: auto — at the boundary the session is compacted in place: no /clear, no resume prompt, the summary saved', { options: { threshold: 70, jev: 'auto' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.compactions).toHaveLength(1)
  expect(c.compactions[0]!.instructions).toContain('Сжимай как хендофф')
  expect(c.commands).not.toContain('clear')
  expect(c.submitted).toHaveLength(0)
  const file = c.files.find(p => /^\/repo\/handoffs\/handoff-\d{4}-\d{2}-\d{2}-\d{6}-compact-jev\.md$/.test(p))
  expect(file).toBeDefined()
  expect(c.docs[file!]).toContain('СВОДКА: F1 сделан')
  expect(c.docs[file!]).not.toContain('последний промпт')
  expect(c.journal[0]).toContain('"decision":"auto"')
  expect(c.journal.some(l => l.includes('"trigger":"jev"') && l.includes('"after":40000'))).toBe(true)
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
  expect(c.compactions).toHaveLength(0)
  expect(c.journal[0]).toContain('"decision":"stale"')
})

test('jev: off — Jev is never asked', { options: { threshold: 70, jev: 'off' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.bodies).toHaveLength(0)
})

test("jev: a subagent's or teammate's run neither replaces the person's prompt nor makes the judgment stale", { options: { threshold: 70, jev: 'auto' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.turn.start({ text: 'USER PROMPT', turnId: 't1' })
  await $.turn.start({ text: 'AGENT PROMPT', turnId: 's1', agentId: 'a1' } as any) // the Agent tool inside the main turn
  await $.turn.complete({ answer: 'готово', durationMs: 10, isAborted: false, turnId: 't1', reason: 'answer' })
  await $.turn.start({ text: 'BACKGROUND', turnId: 's2', agentId: 'a2' } as any) // a background agent starts while Jev answers
  await clock.settle()
  expect(JSON.parse(c.bodies[0]!).state.prompt).toBe('USER PROMPT')
  expect(c.journal[0]).toContain('"decision":"auto"')
  expect(c.compactions).toHaveLength(1)
})

test('jev: a network error is journalled with the key blanked', { options: { threshold: 70, jev: 'hint' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 40, reply(0.96, 0.9), () => compacted(), `refused for ${KEY}`)
  await settledTurn($, clock)
  expect(c.journal[0]).toContain('"decision":"error"')
  expect(c.journal[0]).toContain('[key]')
  expect(c.journal[0]).not.toContain(KEY)
})

test('jev: under 10 % fill — not asked: a fresh context has nothing to hand off', { options: { threshold: 70, jev: 'hint' } }, async ($, on) => {
  const clock = mock.clock(on)
  const c = session(on, 9, reply(0.96, 0.9))
  await settledTurn($, clock)
  expect(c.bodies).toHaveLength(0)
})

test("after a person's /clear the band comes back at once, and the main button compacts in place", { options: { threshold: 70, jev: 'off' } }, async ($, on) => {
  mock.clock(on)
  const c = session(on, 3, undefined, () => ({ skip: 'nothing to compact' }))
  on('classic.SessionStart', () => ({}))
  await $.session.start({ cwd: '/repo', surface: 'terminal', isInteractive: true })
  await $.classic.SessionStart({ source: 'clear' })
  const ui = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await ui.find({ type: 'Text', text: /3%/ })).toBeDefined()
  await ui.press({ key: 'now' })
  expect(c.compactions).toHaveLength(1)
  expect(c.commands).not.toContain('clear')
  const after = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(await after.find({ type: 'Text', text: /compact: nothing to compact/ })).toBeDefined()
})

// SPEC-v3.5 F1: a person's session (the REPL or an attached surface), the threshold of budgets.json, the surface in the status.
type Host = { fills: Array<number | null>; budgets?: string; surfaces: string[]; written: string[]; commands: string[]; submitted: string[]; compactions: Compaction[]; after: number | null; refuse: number; skip: number; toasts: string[]; statuses: string[]; docs: Record<string, string>; breakdown?: unknown; tokens?: number; key?: string }

/** A hosted session (isInteractive false): each turn reads the next fill of `fills`; budgets.json is `budgets` (undefined: no file). */
function hosted(on: any, h: Host) {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('session.usage', ($: any, e: any) => ({
    value: {
      startedAt: 0,
      context: {
        ...(h.fills[0] === null ? {} : { tokens: h.tokens ?? 1000, percent: h.fills[0] ?? 0 }),
        window: 1000000,
        ...(e.breakdown && h.breakdown ? { breakdown: h.breakdown } : {}),
      },
      rateLimits: [],
    },
  }))
  on('session.turns', () => ({ value: 5 }))
  on('session.root', () => ({ value: '/repo' }))
  on('session.repo', () => ({ value: { root: '/repo' } }))
  on('session.surfaces', () => ({ value: h.surfaces }))
  on('env.get', ($: any, e: any) => ({ value: e.name === 'TYPESAFE_API_KEY' ? h.key : undefined }))
  on('fs.read', ($: any, e: any) => (e.path === '/repo/budgets.json' && h.budgets !== undefined ? { value: h.budgets } : { deny: 'no such file' }))
  on('fs.write', ($: any, e: any) => {
    h.written.push(e.path)
    h.docs[e.path] = e.text
    return { value: undefined }
  })
  on('model.fork', () => ({ value: { isAnswered: true as const, text: 'slug: x\n# Хендофф\n## 3. Следующее\n- шаг', usage: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } }))
  on('command.run', ($: any, e: any) => {
    h.commands.push(e.command)
    return {}
  })
  on('prompt.submit', ($: any, e: any) => {
    h.submitted.push(e.text)
    return { text: e.text }
  })
  on('session.messages', () => ({ value: [KEPT] }))
  on('session.compact', ($: any, e: any) => {
    h.compactions.push({ trigger: e.trigger, instructions: e.instructions, agentId: e.agentId })
    if (h.refuse > 0) {
      h.refuse--
      throw new Error('a turn is running')
    }
    if (h.skip > 0) {
      h.skip--
      return { skip: 'blocked by a PreCompact hook' }
    }
    return compacted(h.after)
  })
  on('turn.start', ($: any, e: any) => ({ turnId: e.turnId }))
  on('turn.complete', ($: any, e: any) => ({ text: e.answer }))
  on('store.set', () => ({ value: undefined }))
  on('store.get', () => ({ value: undefined }))
  on('ui.status', ($: any, e: any) => {
    h.statuses.push(e.text ?? '')
    return { value: undefined }
  })
  on('ui.log', () => ({ value: undefined }))
  on('ui.toast', ($: any, e: any) => {
    h.toasts.push(e.text)
    return { value: undefined }
  })
  on('session.attach', ($: any, e: any) => ({ clientId: e.clientId }))
}
const hostOf = (fills: Array<number | null>, extra: Partial<Host> = {}): Host => ({ fills, surfaces: [], written: [], commands: [], submitted: [], compactions: [], after: 50000, refuse: 0, skip: 0, toasts: [], statuses: [], docs: {}, ...extra })
const BUDGETS = (d: number, p?: number) => JSON.stringify({ defaults: { handoff_threshold_pct: d }, project: p === undefined ? {} : { handoff_threshold_pct: p } })
const handoffs = (h: Host) => h.written.filter(p => /\/handoff-[^/]+\.md$/.test(p)).length

async function turns($: any, clock: any, h: Host, n: number, agentId?: string) {
  for (let i = 0; i < n; i++) {
    await $.turn.start({ text: 'шаг', turnId: `t${i}` })
    await $.turn.complete({ answer: 'ok', durationMs: 10, isAborted: false, turnId: `t${i}`, reason: 'answer', ...(agentId ? { agentId } : {}) })
    await clock.advance(1000) // the handoff leaves on a 250 ms timer
    h.fills.shift()
  }
}

test('threshold: handoff_threshold_pct of budgets.json, project only tightens; no file — the option', { options: { threshold: 70, jev: 'off' } }, async ($, on) => {
  const h = hostOf([5], { budgets: BUDGETS(40) })
  hosted(on, h)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  const status = async () => (await $.command.run({ command: 'handoff', args: 'status', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)).text
  expect(await status()).toContain('threshold 40% (budgets.json)')
  h.budgets = BUDGETS(40, 10)
  expect(await status()).toContain('threshold 10% (budgets.json)')
  h.budgets = BUDGETS(40, 60) // project never loosens
  expect(await status()).toContain('threshold 40% (budgets.json)')
  h.budgets = undefined
  expect(await status()).toContain('threshold 70% (option)')
})

test('status names the surface: none in a hosted session without one, desktop once attached', { options: { jev: 'off' } }, async ($, on) => {
  const h = hostOf([5], { budgets: BUDGETS(40) })
  hosted(on, h)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  const status = async () => (await $.command.run({ command: 'handoff', args: 'status', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)).text
  expect(await status()).toContain('surface none')
  h.surfaces = ['desktop']
  await $.session.attach({ surface: 'desktop', clientId: 'probe' } as any)
  expect(await status()).toContain('surface desktop')
})

test('no REPL and no surface: past the threshold the mod writes no handoff by itself', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  const h = hostOf([50, 50], { budgets: BUDGETS(40) })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 2)
  expect(handoffs(h)).toBe(0)
})

test('a surface attached: past the budgets.json threshold the session is compacted in place — never /clear, no resume prompt', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  const h = hostOf([50], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await $.session.attach({ surface: 'desktop', clientId: 'probe' } as any)
  await turns($, clock, h, 1)
  expect(h.compactions).toHaveLength(1)
  expect(h.compactions[0]!.instructions).toContain('Что идёт в фоне')
  expect(h.written.some(p => /\/repo\/handoffs\/handoff-[^/]+-compact-threshold\.md$/.test(p))).toBe(true)
  expect(h.written.some(p => p.endsWith('/handoffs/compact.jsonl'))).toBe(true)
  expect(h.commands).not.toContain('clear')
  expect(h.submitted).toHaveLength(0)
})

test('autoCompact off: past the threshold the handoff file only — no compaction, no /clear', { options: { jev: 'off', minTurns: 0, autoCompact: false } }, async ($, on) => {
  const h = hostOf([50], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 1)
  expect(handoffs(h)).toBe(1)
  expect(h.compactions).toHaveLength(0)
  expect(h.commands).not.toContain('clear')
})

test('re-armed from the size after the compaction: the next crossing compacts again before any fresh figure', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  // the usage stub still reads 50 % after the first compaction: only tokensAfter (50k of 1M = 5 %) can re-arm
  const h = hostOf([50, 50], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 2)
  expect(h.compactions).toHaveLength(2)
  expect(h.statuses).toContain('ctx 5% · 50k/1000k · handoff @40% · compacted')
})

test('no tokensAfter from core: not re-armed until a turn reads the fill below threshold − 20', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  const h = hostOf([50, 50], { budgets: BUDGETS(40), surfaces: ['desktop'], after: null })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 2)
  expect(h.compactions).toHaveLength(1)
})

test('a compaction refused (a turn runs): nothing cleared, a toast, re-armed — the next turn end compacts', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  const h = hostOf([50, 50], { budgets: BUDGETS(40), surfaces: ['desktop'], refuse: 1 })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 2)
  expect(h.compactions).toHaveLength(2)
  expect(h.toasts.some(t => t.includes('nothing was cleared'))).toBe(true)
  expect(h.written.filter(p => /-compact-threshold\.md$/.test(p))).toHaveLength(1)
  expect(h.commands).not.toContain('clear')
})

test('a vetoed compaction ({ skip }) from the threshold re-arms: the next turn end tries again', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  const h = hostOf([50, 50], { budgets: BUDGETS(40), surfaces: ['desktop'], skip: 1 })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 2)
  expect(h.compactions).toHaveLength(2)
  expect(h.written.filter(p => /-compact-threshold\.md$/.test(p))).toHaveLength(1)
})

test('a refused /handoff now never held the arm: no second handoff above threshold − 20 (F1.4)', { options: { jev: 'off', minTurns: 0, autoCompact: false } }, async ($, on) => {
  const h = hostOf([50, 50, 50], { budgets: BUDGETS(40), surfaces: ['desktop'], refuse: 1 })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 1) // the handoff file; disarmed
  await $.command.run({ command: 'handoff', args: 'now', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)
  await clock.advance(1000) // refused: a turn runs
  await turns($, clock, h, 1)
  expect(handoffs(h)).toBe(1)
})

test('no figure yet (no response in this window): no decision, the status says unknown', { options: { jev: 'off', minTurns: 0 } }, async ($, on) => {
  const h = hostOf([null], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 1)
  expect(h.compactions).toHaveLength(0)
  expect(h.statuses).toContain('ctx unknown · handoff @40%')
  h.fills = [null]
  const { text } = await $.command.run({ command: 'handoff', args: 'status', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)
  expect(text ?? '').toContain('context unknown of 1000000 tokens')
})

test('/handoff now compacts in place once the session is idle; no /clear, no prompt', { options: { jev: 'off' } }, async ($, on) => {
  const h = hostOf([5], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  const { text } = await $.command.run({ command: 'handoff', args: 'now', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)
  expect(text ?? '').toContain('compacting in place')
  await clock.advance(1000)
  expect(h.compactions).toHaveLength(1)
  expect(h.written.some(p => /-compact-command\.md$/.test(p))).toBe(true)
  expect(h.commands).not.toContain('clear')
  expect(h.submitted).toHaveLength(0)
})

// The engine's own compactions: its threshold mid-turn (auto), a person's /compact (manual), a precompute.
const MSGS = [{ role: 'user' as const, text: 'шаг 1', toolUses: [], handle: 'h1' }, KEPT]

test("the engine's own compaction in a person's session: the handoff sections ride its instructions, its summary becomes the file", { options: { jev: 'off' } }, async ($, on) => {
  const h = hostOf([30], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  const r: any = await $.session.compact({ trigger: 'auto', messages: MSGS } as any)
  expect(r.messages).toHaveLength(2)
  expect(h.compactions).toEqual([{ trigger: 'auto', instructions: compactInstructions('ru'), agentId: undefined }])
  const file = h.written.find(p => /\/repo\/handoffs\/handoff-\d{4}-\d{2}-\d{2}-\d{6}-compact-auto\.md$/.test(p))
  expect(file).toBeDefined()
  expect(h.docs[file!]).toContain('СВОДКА: F1 сделан')
  expect(h.docs[file!]).not.toContain('последний промпт')
  const line = h.docs['/repo/handoffs/compact.jsonl'] ?? ''
  expect(line).toContain('"trigger":"auto"')
  expect(line).not.toContain('СВОДКА')
})

test("a person's /compact <text>: their text first, the handoff sections after it", { options: { jev: 'off' } }, async ($, on) => {
  const h = hostOf([30], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await $.session.compact({ trigger: 'manual', instructions: 'фокус на F2', messages: MSGS } as any)
  expect(h.compactions[0]!.instructions!.startsWith('фокус на F2\n\n')).toBe(true)
  expect(h.compactions[0]!.instructions).toContain('Сжимай как хендофф')
  expect(h.written.some(p => /-compact-manual\.md$/.test(p))).toBe(true)
})

test('precompute: the instructions ride, no file (nothing is installed yet)', { options: { jev: 'off' } }, async ($, on) => {
  const h = hostOf([30], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await $.session.compact({ trigger: 'precompute', messages: MSGS } as any)
  expect(h.compactions[0]!.instructions).toContain('Сжимай как хендофф')
  expect(h.written.filter(p => p.endsWith('.md'))).toHaveLength(0)
})

test("a subagent's compaction and a session with no person are left as they are", { options: { jev: 'off' } }, async ($, on) => {
  const h = hostOf([30], { budgets: BUDGETS(40), surfaces: [] })
  hosted(on, h)
  mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await $.session.compact({ trigger: 'auto', messages: MSGS } as any) // claude -p: no REPL, no surface
  h.surfaces = ['desktop']
  await $.session.compact({ trigger: 'auto', agentId: 'a1', messages: MSGS } as any)
  expect(h.compactions.map(c => c.instructions)).toEqual([undefined, undefined])
  expect(h.written).toHaveLength(0)
})

test("status names the engine's compaction point, armed and the Jev key's presence", { options: { jev: 'hint' } }, async ($, on) => {
  const h = hostOf([43], {
    budgets: BUDGETS(40),
    surfaces: ['desktop'],
    tokens: 427000,
    breakdown: { autoCompactThreshold: 580000, isAutoCompactEnabled: true, autocompactSource: 'settings' },
  })
  hosted(on, h)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  const { text } = await $.command.run({ command: 'handoff', args: 'status', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)
  expect(text ?? '').toContain('43% of 1000000 tokens (427k)')
  expect(text ?? '').toContain('engine compacts at 580k (settings)')
  expect(text ?? '').toContain('armed yes')
  expect(text ?? '').toContain('jev hint (key absent; last —)')
  h.key = KEY
  const again = (await $.command.run({ command: 'handoff', args: 'status', origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } } as any)).text ?? ''
  expect(again).toContain('jev hint (key present; last —)')
  expect(again).not.toContain(KEY)
})

test('F1.4 above the threshold − 20: no second handoff', { options: { jev: 'off', minTurns: 0, autoCompact: false } }, async ($, on) => {
  // 25 and 20 — not below 40 − 20: no re-arm (a margin of 10 or `<=` would re-arm and hand off twice)
  const h = hostOf([50, 45, 25, 20, 50], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 5)
  expect(handoffs(h)).toBe(1)
})

test('F1.4 after the fill drops below the threshold − 20: the next crossing hands off again', { options: { jev: 'off', minTurns: 0, autoCompact: false } }, async ($, on) => {
  const h = hostOf([50, 10, 50], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 3)
  expect(handoffs(h)).toBe(2)
})

test('F1.4 a subagent turn never hands off', { options: { jev: 'off', minTurns: 0, autoCompact: false } }, async ($, on) => {
  const h = hostOf([50, 50], { budgets: BUDGETS(40), surfaces: ['desktop'] })
  hosted(on, h)
  const clock = mock.clock(on)
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  await turns($, clock, h, 2, 'agent-1')
  expect(handoffs(h)).toBe(0)
})
