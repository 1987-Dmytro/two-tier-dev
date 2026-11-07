import { expect, mock, test } from 'claude-code/testing'
import { featuresOf, markOf } from './board'

// The fixture of SPEC-v3.4 F9.1: two features, four items; F1.1 and F2.1 green, F1.2 red, F2.2 without a probe line → 2/1/1.
const PROMPT = 'Phase 1.\nRead first: docs/SPEC-1.md, docs/PROGRESS.md\n'
const SPEC = [
  '# SPEC-1',
  '## 2. Фичи',
  '- **F1 Eins** · x · готово: F1.1–F1.2 · чек: `bin/a` → `A_OK` · служит: S1 · after: —',
  '  - `F1.1` a — `F1.1 ok` в `F1-a-result.txt`',
  '  - `F1.2` b — `F1.2 ok` там же',
  '- **F2 Zwei** · y · risk: low · готово: F2.1–F2.2 · чек: `bin/b` → `B_OK` · служит: S1 · after: F1',
  '  - `F2.1` c',
  '',
  '  - `F2.2` d',
  '## 3. Инварианты',
].join('\n')
const F1 = 'spec: SPEC-1\n$ bin/a\nF1.1 ok=1 · сырой вывод\nF1.2 FAIL: b=нет · сырой вывод\nA_OK\n'
const F2 = 'spec: SPEC-1\n$ bin/b\nF2.1 ok=1 · сырой вывод\nB_OK\n'
const FOREIGN = 'spec: SPEC-9\nF2.2 ok · чужая SPEC\nB_OK\n'
const GATE = '{"decision":"pass","reason":"background:shell"}\n{"decision":"block","reason":"3 missing"}\n'
const VERDICT_OLD = 'VERDICT: NEEDS_WORK\nКЛАССЫ: x\nFEATURES: F1\n/verify-phase · docs/SPEC-1.md · HEAD aaaaaaa\n'
const VERDICT_NEW = 'VERDICT: PASS\nКЛАССЫ: x\nFEATURES: F1, F2\n/verify-phase · docs/SPEC-1.md · HEAD bbbbbbb\n'
const VERDICT_OTHER = 'VERDICT: NEEDS_WORK\nFEATURES: F1\n/verify-phase · docs/SPEC-9.md · HEAD ccccccc\n'
const PROGRESS = '# PROGRESS\n\n## Open stop — STOP-TL «Leg 3»\nSTOP: STOP-TL «Leg 3» — плечо построено.\nВопрос тимлиду: читать?\nResume: Продолжай.\n'
const CMD = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 120 } }
const PANE = { plugin: 'spec-board', component: 'Pane', requestId: 'spec-board', props: { title: 'Spec board', isFocused: false, bodyColumns: 100, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} } } as const

type Files = Record<string, string>
const fixture = (): Files => ({
  'docs/PROMPT.txt': PROMPT,
  'docs/SPEC-1.md': SPEC,
  'docs/evidence/F1-a-result.txt': F1,
  'docs/evidence/F2-b-result.txt': F2,
  'docs/evidence/F2-old-result.txt': FOREIGN,
  'docs/evidence/spec-gate.jsonl': GATE,
  'docs/evidence/verify-aaaaaaa-F1.txt': VERDICT_OLD,
  'docs/evidence/verify-bbbbbbb.txt': VERDICT_NEW,
  'docs/evidence/verify-ccccccc.txt': VERDICT_OTHER,
  'docs/PROGRESS.md': PROGRESS,
})
const MTIME: Record<string, number> = { 'verify-aaaaaaa-F1.txt': 1, 'verify-bbbbbbb.txt': 3, 'verify-ccccccc.txt': 9 }

// The engine beneath the mod: files under /repo (mutable between calls), what the session draws on, and what the mod asked of it.
const seat = (on: any, { files = fixture(), surfaces = [] as string[] } = {}) => {
  const seen = { files, surfaces, statuses: [] as unknown[], opened: [] as string[], registered: [] as string[], reads: 0, clock: mock.clock(on, { now: 0 }) }
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('session.attach', () => ({}))
  on('command.register', ($: any, e: any) => {
    seen.registered.push(e.name)
    return { value: { command: e.name } }
  })
  on('session.root', () => ({ value: '/repo' }))
  on('session.repo', () => ({ value: { root: '/repo', remote: null, internal: false } }))
  on('session.surfaces', () => ({ value: seen.surfaces }))
  on('fs.read', ($: any, e: any) => {
    seen.reads += 1
    const rel = String(e.path).replace(/^\/repo\//, '')
    return rel in seen.files ? { value: seen.files[rel] } : { deny: 'no such file' }
  })
  on('fs.list', ($: any, e: any) => {
    if (e.path !== '/repo/docs/evidence') return { deny: 'no such directory' }
    const names = Object.keys(seen.files).filter(p => p.startsWith('docs/evidence/')).map(p => p.slice('docs/evidence/'.length))
    return { value: names.map(name => ({ name, kind: 'file', size: 1, mtimeMs: MTIME[name] ?? 2, isLink: false })) }
  })
  on('ui.status', ($: any, e: any) => {
    seen.statuses.push(e.text)
    return { value: undefined }
  })
  on('ui.open', ($: any, e: any) => {
    seen.opened.push(e.id)
    return { value: { isPlaced: true } }
  })
  on('tool.call', () => ({ result: {} }))
  return seen
}
const start = ($: any, isInteractive = true) => $.session.start({ cwd: '/repo', surface: isInteractive ? 'terminal' : null, isInteractive })
const last = (seen: { statuses: unknown[] }) => String(seen.statuses[seen.statuses.length - 1] ?? '')

test('featuresOf reads the feature lines, the marker and the items as spec-gate does', () => {
  expect(featuresOf(SPEC)).toEqual([
    { id: 'F1', marker: 'A_OK', items: ['F1.1', 'F1.2'] },
    { id: 'F2', marker: 'B_OK', items: ['F2.1', 'F2.2'] },
  ])
})

test('markOf: a probe line is green, FAIL, BAD or offen is red, an id alone or another id is no line', () => {
  expect(markOf('F1.1', [['F1.1 ok']]).mark).toBe('green')
  expect(markOf('F1.1', [['F1.1 FAIL: x']]).mark).toBe('red')
  expect(markOf('F1.1', [['F1.1 BAD x']]).mark).toBe('red')
  expect(markOf('F1.1', [['F1.1 offen · claude нет']]).mark).toBe('red')
  expect(markOf('F1.1', [['F1.1 ok=FAIL-free']]).mark).toBe('green')
  expect(markOf('F1.1', [['F1.1'], ['F1.10 ok'], ['xF1.1 ok']]).mark).toBe('none')
})

test('fixture: board=2/1/1 in the status line and the pane, on every surface', async ($, on) => {
  const seen = seat(on)
  await start($)
  expect(last(seen)).toBe('board 2/1/1 · маркеров 2/2 · gate block 3 missing · PASS F1,F2 · STOP-TL «Leg 3»')
  const answer = await $.command.run({ command: 'board', args: '', ...CMD })
  expect(answer.text).toBe(last(seen))
  expect(seen.opened).toEqual(['spec-board'])
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ ...PANE, surface })
    expect((await ui.find({ type: 'Text', text: /^board / }))?.text).toBe(last(seen))
    expect((await ui.find({ type: 'Text', text: /F1\.2/ }))?.text).toBe('  F1.2 red · FAIL: b=нет · сырой вывод')
    expect((await ui.find({ type: 'Text', text: /F2\.2/ }))?.text).toBe('  F2.2 нет строки')
    expect((await ui.find({ type: 'Text', text: /^F2 / }))?.text).toBe('F2 B_OK есть')
    await ui.unmount()
  }
})

test('a probe line removed: board=1/1/2 after the next tool call', async ($, on) => {
  const seen = seat(on)
  await start($)
  seen.files['docs/evidence/F2-b-result.txt'] = F2.replace('F2.1 ok=1 · сырой вывод\n', '')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(last(seen)).toBe('board 1/1/2 · маркеров 2/2 · gate block 3 missing · PASS F1,F2 · STOP-TL «Leg 3»')
})

test('a marker line removed: the feature has no marker', async ($, on) => {
  const seen = seat(on)
  await start($)
  seen.files['docs/evidence/F1-a-result.txt'] = F1.replace('A_OK\n', '')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(last(seen)).toContain('маркеров 1/2')
})

test('an evidence file of another SPEC does not count: its F2.2 line stays no line', async ($, on) => {
  const seen = seat(on)
  seen.files['docs/evidence/F2-b-result.txt'] = F2.replace('spec: SPEC-1', 'spec: SPEC-9')
  await start($)
  expect(last(seen)).toBe('board 1/1/2 · маркеров 1/2 · gate block 3 missing · PASS F1,F2 · STOP-TL «Leg 3»')
})

test('the verdict is the newest verify file of this SPEC; another SPEC newer does not count', async ($, on) => {
  const seen = seat(on)
  delete seen.files['docs/evidence/verify-bbbbbbb.txt']
  await start($)
  expect(last(seen)).toContain('NEEDS_WORK F1')
  delete seen.files['docs/evidence/verify-aaaaaaa-F1.txt']
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(last(seen)).toContain('вердикта нет')
})

test('the gate is the last decision of spec-gate.jsonl; no STOP line is said so', async ($, on) => {
  const seen = seat(on)
  seen.files['docs/evidence/spec-gate.jsonl'] = GATE + '{"decision":"stop","reason":"STOP-TL"}\n'
  seen.files['docs/PROGRESS.md'] = '# PROGRESS\n'
  await start($)
  expect(last(seen)).toBe('board 2/1/1 · маркеров 2/2 · gate stop STOP-TL · PASS F1,F2 · стопа нет')
})

test('no SPEC in Read first: the board says so and counts nothing', async ($, on) => {
  const seen = seat(on)
  seen.files['docs/PROMPT.txt'] = 'Phase without a spec.\n'
  await start($)
  expect(last(seen)).toBe('board: нет фазы (docs/PROMPT.txt без SPEC в Read first) · gate block 3 missing · STOP-TL «Leg 3»')
})

test('redrawn by the clock: a minute later the board reads the files again', async ($, on) => {
  const seen = seat(on)
  await start($)
  seen.files['docs/evidence/F2-b-result.txt'] = F2 + 'F2.2 ok · новая строка\n'
  await seen.clock.advance(60_000)
  expect(last(seen)).toBe('board 3/1/0 · маркеров 2/2 · gate block 3 missing · PASS F1,F2 · STOP-TL «Leg 3»')
})

test('claude -p draws nothing: no status line, no pane, /board answers its line', async ($, on) => {
  const seen = seat(on)
  await start($, false)
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  await seen.clock.advance(60_000)
  expect(seen.statuses).toEqual([])
  const answer = await $.command.run({ command: 'board', args: '', ...CMD })
  expect(answer.text).toBe('board 2/1/1 · маркеров 2/2 · gate block 3 missing · PASS F1,F2 · STOP-TL «Leg 3»')
  expect(seen.opened).toEqual([])
})

test('a host that attaches a surface later draws from then on', async ($, on) => {
  const seen = seat(on)
  await start($, false)
  expect(seen.statuses).toEqual([])
  seen.surfaces.push('desktop')
  await $.tool.call({ tool: 'Bash', command: 'ls' })
  expect(last(seen)).toContain('board 2/1/1')
})

test('a subagent tool call does not redraw', async ($, on) => {
  const seen = seat(on)
  await start($)
  const before = seen.statuses.length
  seen.files['docs/evidence/F2-b-result.txt'] = F2.replace('F2.1 ok=1 · сырой вывод\n', '')
  await $.tool.call({ tool: 'Bash', command: 'ls', agentId: 'a1' })
  expect(seen.statuses.length).toBe(before)
})

test('a value an earlier version stored is declined: the pane draws the empty board', async ($, on) => {
  on('state.get', () => ({ value: { value: { counts: 'old' }, version: 1 } }))
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect((await ui.find({ type: 'Text' }))?.text).toBe('board: нет фазы (docs/PROMPT.txt без SPEC в Read first) · gate — · —')
  await ui.unmount()
})
