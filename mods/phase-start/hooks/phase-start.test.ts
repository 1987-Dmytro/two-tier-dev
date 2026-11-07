import { expect, mock, test } from 'claude-code/testing'
import { branchOf, resumeOf } from './text'

const PROMPT = 'Phase v3.4 of two-tier-dev.\nConstraints:\n- Branch v3.4 only; never push to main.\n'
const PROGRESS = '# PROGRESS\n\n## Open stop — STOP-TL «Leg 1»\nSTOP: STOP-TL «Leg 1» — плечо построено.\nВопрос тимлиду: читать сейчас?\nResume: Продолжай по SPEC-v3.4 с F5\n\n## Notes\n- x\n'
const CMD = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 120 } }

type Seat = { branch?: string; prompt?: string | null; progress?: string | null; gitCode?: number; noGit?: boolean; drop?: string; submitRefused?: boolean; writeRefused?: boolean }
type Seen = {
  sent: Array<{ text: string; origin?: { asUser?: boolean } }>
  written: Array<{ path: string; text: string }>
  toasts: string[]
  registered: Array<{ name: string; argumentHint?: string; immediate?: true }>
  clock: { settle: () => Promise<void> }
  root: string // what $.session.root answers now: a worktree move changes it
}

// The engine beneath the mod. `null`: the file does not exist.
const seat = (on: any, { branch = 'v3.4', prompt = PROMPT, progress = PROGRESS, gitCode = 0, noGit = false, drop, submitRefused = false, writeRefused = false }: Seat): Seen => {
  const seen: Seen = { sent: [], written: [], toasts: [], registered: [], clock: mock.clock(on), root: '/repo' }
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => {
    seen.registered.push(e)
    return { value: { command: e.name } }
  })
  on('ui.toast', ($: any, e: any) => {
    seen.toasts.push(e.text)
    return { value: undefined }
  })
  on('session.root', () => ({ value: seen.root }))
  on('fs.read', ($: any, e: any) => {
    const text = e.path === '/repo/docs/PROMPT.txt' ? prompt : e.path === '/repo/docs/PROGRESS.md' ? progress : null
    return text === null ? { deny: 'no such file' } : { value: text }
  })
  on('process.run', ($: any, e: any) => {
    expect(e.argv).toEqual(['git', 'branch', '--show-current'])
    expect(e.init.cwd).toBe('/repo')
    return noGit ? { deny: 'no git' } : { value: { exitCode: gitCode, stdout: `${branch}\n`, stderr: '' } }
  })
  on('prompt.submit', ($: any, e: any) => {
    if (submitRefused) throw new Error('refused')
    seen.sent.push(e)
    return drop ? { drop } : { text: e.text }
  })
  on('fs.write', ($: any, e: any) => {
    if (writeRefused) return { deny: 'read-only' }
    seen.written.push(e)
    return { value: undefined }
  })
  return seen
}
// The prompt leaves on a timer after the command's hook returned: settle before reading what was sent.
const phase = async ($: any, seen: Seen, args = '') => {
  const answer = await $.command.run({ command: 'phase', args, ...CMD })
  await seen.clock.settle()
  return answer
}

test('branchOf reads the forms a PROMPT has', () => {
  expect(branchOf(PROMPT)).toBe('v3.4')
  expect(branchOf('Constraints: branch v3.4 only; `git add` with exact paths')).toBe('v3.4')
  expect(branchOf('Phase "Linie fixieren" on branch linie-1 from bo-1 7a46080')).toBe('linie-1')
  expect(branchOf('Phase v3.4 of two-tier-dev, branch v3.4 from tl/kit-v3.4 42b0562.')).toBe('v3.4')
  expect(branchOf('- Branch feature/x-1 only')).toBe('feature/x-1')
})

test('branchOf finds none in the template or in passing mentions', () => {
  expect(branchOf('- Branch <b> only; never push to main')).toBeUndefined()
  expect(branchOf('branch v3.4 is pushed; pushing branch v3.4')).toBeUndefined()
  expect(branchOf('')).toBeUndefined()
})

test('resumeOf takes the Resume line of the open stop', () => {
  expect(resumeOf(PROGRESS)).toBe('Продолжай по SPEC-v3.4 с F5')
  expect(resumeOf('## Head\nSTOP: STOP-TL «Linie fixiert»\nЧитать ли итог?\nResume: Lesen: ja\n\n## Done\n')).toBe('Lesen: ja')
  expect(resumeOf('## Open stop\n- STOP: STOP-INPUT — x\nВопрос?\nПродолжай по SPEC-12 с F3; развилка решена так: a\n')).toBe('Продолжай по SPEC-12 с F3; развилка решена так: a')
})

test('resumeOf takes the last stop of the section', () => {
  expect(resumeOf('## Open stop\nSTOP: STOP-NP a\nВопрос?\nResume: old\nSTOP: STOP-TL b\nВопрос?\nResume: new\n')).toBe('new')
})

test('resumeOf prefers the Resume line and never takes a question', () => {
  expect(resumeOf('## Open stop\nSTOP: STOP-TL «Leg 2» — плечо построено.\nПродолжать сейчас или ждать чтения?\nResume: Продолжай по SPEC-v3.4 с F8\n')).toBe('Продолжай по SPEC-v3.4 с F8')
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nВопрос?\nПродолжай с F3\nResume: Продолжай с F5\n')).toBe('Продолжай с F5')
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nПродолжать сейчас или ждать чтения?\n')).toBeUndefined()
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nПродолжать сейчас? Или ждать чтения.\n')).toBeUndefined()
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nResume: читать сейчас?\n')).toBeUndefined()
})

test('resumeOf reads the bold form spec-gate honours', () => {
  expect(resumeOf('## Open stop\nSTOP: STOP-INPUT — вход\n- **Вопрос:** какой вариант?\n- **Resume:** «Продолжай по SPEC-12 с F3»\n')).toBe('«Продолжай по SPEC-12 с F3»')
})

test('resumeOf reads a CRLF file', () => {
  expect(resumeOf('## Open stop\r\nSTOP: STOP-TL a\r\nВопрос?\r\nResume: Продолжай с F5\r\n\r\n## Notes\r\n')).toBe('Продолжай с F5')
  expect(resumeOf('## Голова\r\nSTOP: STOP-TL a — снят\r\nВопрос?\r\nResume: old\r\n')).toBeUndefined()
})

test('resumeOf takes the words of the line in any case', () => {
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nВопрос?\nresume: Да\n')).toBe('Да')
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nВопрос?\nпродолжай с F3\n')).toBe('продолжай с F3')
})

test('without an Open stop section: the first section with a STOP, not the whole file', () => {
  expect(resumeOf('## Голова\nSTOP: STOP-TL «Linie fixiert»\nЧитать ли итог?\nResume: Lesen: ja\n\n## Done\n- STOP: STOP-NP старая серия\nДаёте серию?\nResume: Serie: ja\n')).toBe('Lesen: ja')
  expect(resumeOf('# PROGRESS\nSTOP: STOP-TL a\nЧитать?\nResume: Lesen: ja\n\n## Done\n- STOP: STOP-NP b\nСерию?\nResume: Serie: ja\n')).toBe('Lesen: ja')
  expect(resumeOf('# PROGRESS\n\n## Next\n- x\n\n## Голова\nSTOP: STOP-TL a\nЧитать?\nResume: Lesen: ja\n')).toBe('Lesen: ja')
})

test('a closed stop is not open', () => {
  expect(resumeOf('# PROGRESS\n\n## Closed stop — STOP-TL «Leg 1»\nSTOP: STOP-TL «Leg 1» — закрыт словом оператора\nЧитать?\nResume: Продолжай с F5\n\n## Notes\n')).toBeUndefined()
  expect(resumeOf('## Closed stop\nSTOP: STOP-TL old\nЧитать?\nResume: old\n\n## Голова\nSTOP: STOP-TL new\nЧитать?\nResume: new\n')).toBe('new')
})

test('only an Open stop heading opens the section: the words further down a line do not', () => {
  expect(resumeOf('## Notes\nсм. ## Open stop\nSTOP: STOP-NP old\nВопрос?\nResume: old\n\n## Open stop — NONE\n')).toBeUndefined()
})

test('снят lifts a stop only at the end of its line', () => {
  expect(resumeOf('## Open stop\nSTOP: STOP-INPUT — снятие блокировки нужно от оператора\nСнимешь?\nResume: Продолжай с F3\n')).toBe('Продолжай с F3')
  expect(resumeOf('## Open stop\nSTOP: STOP-INPUT — ключ снят с ротации, нужен новый\nДашь новый?\nResume: Продолжай с F3\n')).toBe('Продолжай с F3')
})

test('resumeOf finds no open stop', () => {
  expect(resumeOf('')).toBeUndefined()
  expect(resumeOf('# PROGRESS\n\n## Notes\n- no stop here\n')).toBeUndefined()
  expect(resumeOf('## Open stop — NONE\n<!-- Стоп — новой строкой `STOP: <id>`; resume-строка -->\n\n## Notes\nSTOP: STOP-NP old\nВопрос?\nResume: old\n')).toBeUndefined()
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a — снят\nВопрос?\nResume: old\n')).toBeUndefined()
})

test('resumeOf reads the resume line within three lines only', () => {
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nВопрос?\nx\ny\nResume: far\n')).toBeUndefined()
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nВопрос?\nx\nResume: near\n')).toBe('near')
  expect(resumeOf('## Open stop\nSTOP: STOP-TL a\nВопрос: продолжать ли?\nResume:\n')).toBeUndefined()
})

test('git that cannot start: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { noGit: true })
  expect((await phase($, seen)).text).toContain('no branch (detached HEAD or no repository)')
  expect(seen.sent).toEqual([])
})

test('/phase is registered in a hosted session too, immediate, with both arguments', async ($, on) => {
  const seen = seat(on, {})
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  expect(seen.registered.length).toBe(1)
  expect(seen.registered[0]!.name).toBe('phase')
  expect(seen.registered[0]!.argumentHint).toBe('resume | halt')
  expect(seen.registered[0]!.immediate).toBe(true)
})

test('right branch: exactly one submit, the whole PROMPT, as the user', async ($, on) => {
  const seen = seat(on, {})
  const { text } = await phase($, seen)
  expect(seen.toasts).toEqual([])
  expect(seen.sent.length).toBe(1)
  expect(seen.sent[0]!.text).toBe(PROMPT)
  expect(seen.sent[0]!.origin?.asUser).toBe(true)
  expect(text).toContain('on branch v3.4')
  expect(seen.written).toEqual([])
})

test('foreign branch: refused with both names, nothing sent', async ($, on) => {
  const seen = seat(on, { branch: 'main' })
  const { text } = await phase($, seen)
  expect(seen.sent).toEqual([])
  expect(text).toContain('refused')
  expect(text).toContain('branch main')
  expect(text).toContain('names v3.4')
})

test('a branch that merely starts like the named one is foreign', async ($, on) => {
  const seen = seat(on, { branch: 'v3.4-fix' })
  expect((await phase($, seen)).text).toContain('branch v3.4-fix')
  expect(seen.sent).toEqual([])
})

test('detached HEAD: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { branch: '' })
  expect((await phase($, seen)).text).toContain('no branch (detached HEAD or no repository)')
  expect(seen.sent).toEqual([])
})

test('git fails: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { branch: 'v3.4', gitCode: 128 })
  expect((await phase($, seen)).text).toContain('refused')
  expect(seen.sent).toEqual([])
})

test('no PROMPT: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { prompt: null })
  expect((await phase($, seen)).text).toContain('no docs/PROMPT.txt')
  expect(seen.sent).toEqual([])
})

test('a PROMPT that names no branch: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { prompt: '- Branch <b> only\n' })
  expect((await phase($, seen)).text).toContain('names no branch')
  expect(seen.sent).toEqual([])
})

test('a dropped prompt says so in a toast', async ($, on) => {
  const seen = seat(on, { drop: 'the session was stopped' })
  await phase($, seen)
  expect(seen.toasts).toEqual(['not sent: the session was stopped'])
})

test('a prompt the engine refuses says so in a toast', async ($, on) => {
  const seen = seat(on, { submitRefused: true })
  await phase($, seen)
  expect(seen.toasts.length).toBe(1)
  expect(seen.toasts[0]).toContain('not sent')
})

test('/phase resume with an open stop: the Resume line goes as the user', async ($, on) => {
  const seen = seat(on, {})
  const { text } = await phase($, seen, 'resume')
  expect(seen.sent.length).toBe(1)
  expect(seen.sent[0]!.text).toBe('Продолжай по SPEC-v3.4 с F5')
  expect(seen.sent[0]!.origin?.asUser).toBe(true)
  expect(text).toContain('Продолжай по SPEC-v3.4 с F5')
})

test('/phase resume with an unfilled <…>: refused, the operator types the answer, nothing sent', async ($, on) => {
  const line = 'Продолжай по SPEC-12 с F3; <развилка> решена так: <…>'
  const seen = seat(on, { progress: `## Open stop\nSTOP: STOP-INPUT — развилка\nКакой вариант?\nResume: ${line}\n` })
  const { text } = await phase($, seen, 'resume')
  expect(text).toContain('refused')
  expect(text).toContain('type your answer')
  expect(text).toContain(line)
  expect(seen.sent).toEqual([])
})

for (const line of ['Deploy: ja | Deploy: nein', 'ход a|b|c']) {
  test(`/phase resume with | alternatives: refused, the operator types the answer, nothing sent: ${line}`, async ($, on) => {
    const seen = seat(on, { progress: `## Голова\nSTOP: STOP-NP серия\nКакой вариант?\nResume: ${line}\n` })
    const { text } = await phase($, seen, 'resume')
    expect(text).toContain('refused')
    expect(text).toContain('type your answer')
    expect(text).toContain(line)
    expect(seen.sent).toEqual([])
  })
}

test('/phase resume without an open stop: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { progress: '## Open stop — NONE\n\n## Notes\n' })
  expect((await phase($, seen, 'resume')).text).toContain('no open STOP')
  expect(seen.sent).toEqual([])
})

test('/phase resume without PROGRESS: refused, nothing sent', async ($, on) => {
  const seen = seat(on, { progress: null })
  expect((await phase($, seen, 'resume')).text).toContain('no open STOP')
  expect(seen.sent).toEqual([])
})

test('/phase resume on a foreign branch: refused with both names, nothing sent', async ($, on) => {
  const seen = seat(on, { branch: 'main' })
  const { text } = await phase($, seen, 'resume')
  expect(text).toContain('branch main')
  expect(text).toContain('names v3.4')
  expect(seen.sent).toEqual([])
})

test('/phase halt writes AGENT_STOP in the project and nowhere else, sends nothing, says how to lift it', async ($, on) => {
  const seen = seat(on, { branch: 'main', prompt: null, progress: null })
  const { text } = await phase($, seen, 'halt')
  expect(seen.written.length).toBe(1)
  expect(seen.written[0]!.path).toBe('/repo/AGENT_STOP')
  expect(seen.written[0]!.text).toBe('')
  expect(seen.sent).toEqual([])
  expect(text).toContain('rm AGENT_STOP')
})

test('/phase halt after a worktree move writes in the start directory, where the kill switch reads', async ($, on) => {
  const seen = seat(on, {})
  await $.session.start({ cwd: '/repo', surface: null, isInteractive: false })
  seen.root = '/repo/.claude/worktrees/w1'
  await phase($, seen, 'halt')
  expect(seen.written.map(w => w.path)).toEqual(['/repo/AGENT_STOP'])
})

test('/phase halt that cannot write says the session is not halted', async ($, on) => {
  const seen = seat(on, { writeRefused: true })
  const { text } = await phase($, seen, 'halt')
  expect(text).toContain('not written')
  expect(text).toContain('not halted')
})

test('another argument does nothing', async ($, on) => {
  const seen = seat(on, {})
  expect((await phase($, seen, 'stop')).text).toContain('unknown argument')
  expect(seen.sent).toEqual([])
  expect(seen.written).toEqual([])
})
