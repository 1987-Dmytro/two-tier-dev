import { expect, mock, test } from 'claude-code/testing'
import { branchOf, resumeOf } from './text'

const PROMPT = 'Phase v3.4 of two-tier-dev.\nConstraints:\n- Branch v3.4 only; never push to main.\n'
const PROGRESS = '# PROGRESS\n\n## Open stop — STOP-TL «Leg 1»\nSTOP: STOP-TL «Leg 1» — плечо построено.\nВопрос тимлиду: читать сейчас?\nResume: Продолжай по SPEC-v3.4 с F5\n\n## Notes\n- x\n'
const CMD = { origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 120 } }

type Seat = { branch?: string; prompt?: string | null; progress?: string | null; gitCode?: number; drop?: string; writeRefused?: boolean }
type Seen = {
  sent: Array<{ text: string; origin?: { asUser?: boolean } }>
  written: Array<{ path: string; text: string }>
  toasts: string[]
  registered: Array<{ name: string; argumentHint?: string; immediate?: true }>
  clock: { settle: () => Promise<void> }
}

// The engine beneath the mod. `null`: the file does not exist.
const seat = (on: any, { branch = 'v3.4', prompt = PROMPT, progress = PROGRESS, gitCode = 0, drop, writeRefused = false }: Seat): Seen => {
  const seen: Seen = { sent: [], written: [], toasts: [], registered: [], clock: mock.clock(on) }
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => {
    seen.registered.push(e)
    return { value: { command: e.name } }
  })
  on('ui.toast', ($: any, e: any) => {
    seen.toasts.push(e.text)
    return { value: undefined }
  })
  on('session.root', () => ({ value: '/repo' }))
  on('fs.read', ($: any, e: any) => {
    const text = e.path === '/repo/docs/PROMPT.txt' ? prompt : e.path === '/repo/docs/PROGRESS.md' ? progress : null
    return text === null ? { deny: 'no such file' } : { value: text }
  })
  on('process.run', ($: any, e: any) => {
    expect(e.argv).toEqual(['git', 'branch', '--show-current'])
    expect(e.init.cwd).toBe('/repo')
    return { value: { exitCode: gitCode, stdout: `${branch}\n`, stderr: '' } }
  })
  on('prompt.submit', ($: any, e: any) => {
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

test('/phase resume with an open stop: the Resume line goes as the user', async ($, on) => {
  const seen = seat(on, {})
  const { text } = await phase($, seen, 'resume')
  expect(seen.sent.length).toBe(1)
  expect(seen.sent[0]!.text).toBe('Продолжай по SPEC-v3.4 с F5')
  expect(seen.sent[0]!.origin?.asUser).toBe(true)
  expect(text).toContain('Продолжай по SPEC-v3.4 с F5')
})

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
  expect(seen.sent).toEqual([])
  expect(text).toContain('rm AGENT_STOP')
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
