import type { RenderElement } from 'claude-code'
import { expect, test } from 'claude-code/testing'
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

test('the band stays empty before the first figure and shows two buttons after a turn', { options: { threshold: 70 } }, async ($, on) => {
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
    expect(await ui.find({ type: 'Text', text: /42%/ })).toBeDefined()
  }
})
