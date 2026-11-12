// phase-start — a Claude Code mod (two-tier-dev). One command, /phase:
//   /phase         sends docs/PROMPT.txt as the person's own words, on the branch the phase names; another branch: refused with both names;
//   /phase resume  the same check, then sends the Resume line of the open STOP of docs/PROGRESS.md; a line left as a form, with <…> or
//                  | alternatives, is refused: the fork is the operator's to answer, and a timer leaves no moment to correct it;
//   /phase halt    writes AGENT_STOP in the start directory, what the kit's kill switch reads as CLAUDE_PROJECT_DIR; it stops the session
//                  at its next tool call. $.session.root follows a worktree move, that variable does not, and a mod does not see it.
// /resume is a built-in and $.command.register throws for a taken name, so these are arguments, and `halt` rides with them. immediate: a
// halt cannot wait for the turn it stops. The prompts leave on a timer: the engine refuses $.prompt.submit from a command.run hook, and
// the call resolves only when that turn starts.
// Registered everywhere, not under isInteractive: a host like the Code tab starts as the SDK does (false), and in a `claude -p` run the
// command does nothing unless typed.
// The mark of the phase session (SPEC-v3.5 F2): once the prompt or the Resume line went as the person's words, the session's id
// ($.session.id(), the transcript file's name — the hook's session_id) is added to .claude/phase-session.json of the session root
// (outside git); after /clear (classic.SessionStart, source clear) the new id is added when this process marked the one before. A fork
// is never added. spec-gate and steer.sh only read the file. No file written: the hook judges such a session by its first words.

import type { EngineInterface, Register } from 'claude-code'
import { branchOf, resumeOf } from './text'

const refuse = (why: string) => ({ text: `refused: ${why}. Nothing was sent.` })
const reason = (err: unknown) => (err instanceof Error ? err.message : String(err))

async function readOr($: EngineInterface, path: string): Promise<string | undefined> {
  try {
    return await $.fs.read(path)
  } catch {
    return undefined
  }
}

// "" on a detached HEAD, outside a repository, or with no git.
async function currentBranch($: EngineInterface, root: string): Promise<string> {
  try {
    const r = await $.process.run(['git', 'branch', '--show-current'], { cwd: root })
    return r.exitCode === 0 ? r.stdout.trim() : ''
  } catch {
    return ''
  }
}

export const MARK = '.claude/phase-session.json'

// Adds the id to the mark; the file keeps the last 50 ids. A file that is not ours (not JSON) is written anew. true — written.
export async function markSession($: EngineInterface, root: string, id: string): Promise<boolean> {
  const path = `${root}/${MARK}`
  let sessions: string[] = []
  const old = await readOr($, path)
  try {
    const j = JSON.parse(old ?? '{}')
    if (Array.isArray(j?.sessions)) sessions = j.sessions.filter((s: unknown): s is string => typeof s === 'string')
  } catch {
    /* not ours: written anew */
  }
  if (!sessions.includes(id)) sessions.push(id)
  try {
    await $.fs.write(path, `${JSON.stringify({ sessions: sessions.slice(-50), updated: new Date(await $.clock.now()).toISOString() }, null, 2)}\n`)
    return true
  } catch (err) {
    $.ui.toast(`phase mark not written: ${reason(err)}`)
    return false
  }
}

type Marked = { id?: string }

// submit, and the id it marked is the one /clear carries on.
async function send($: EngineInterface, mark: Marked, text: string, root: string): Promise<void> {
  mark.id = (await submit($, text, root)) ?? mark.id
}

// Sends the words as the person's; once they went, the session's id goes into the mark. undefined — not sent or not marked.
async function submit($: EngineInterface, text: string, root: string): Promise<string | undefined> {
  try {
    const r = await $.prompt.submit({ text, asUser: true })
    if (r.drop !== undefined) return void $.ui.toast(`not sent: ${r.drop}`)
  } catch (err) {
    return void $.ui.toast(`not sent: ${reason(err)}`)
  }
  try {
    const id = await $.session.id()
    return (await markSession($, root, id)) ? id : undefined
  } catch (err) {
    return void $.ui.toast(`phase mark not written: ${reason(err)}`)
  }
}

async function halt($: EngineInterface, root: string): Promise<string> {
  try {
    await $.fs.write(`${root}/AGENT_STOP`, '')
    return "AGENT_STOP is in the project root: the kit's kill switch stops the session at its next tool call. To lift it: rm AGENT_STOP"
  } catch (err) {
    return `AGENT_STOP not written: ${reason(err)}. The session is not halted.`
  }
}

export const register: Register = on => {
  let startDir: string | undefined
  const mark: Marked = {} // the id this process marked last: /clear carries the mark to the next id; a reload starts over
  const sent = new Set<string>()  // immediate идёт и посреди хода: повтор той же команды не должен прийти словами оператора второй раз

  on('session.start', async ($, e, next) => {
    startDir = await $.session.root()
    await $.command.register({
      name: 'phase',
      description: 'Send docs/PROMPT.txt as your message on the branch it names; `resume` sends the Resume line of the open STOP; `halt` writes AGENT_STOP.',
      argumentHint: 'resume | halt',
      immediate: true,
    })
    return next(e)
  })

  // /clear gives the session a new id: the phase goes on under it (SPEC-v3.5 F2.4). A fork and a resumed session are not added.
  on('classic.SessionStart', async ($, e, next) => {
    const result = await next(e)
    if (e.source !== 'clear' || mark.id === undefined) return result
    try {
      const id = typeof e.session_id === 'string' && e.session_id ? e.session_id : await $.session.id()
      if (id !== mark.id && (await markSession($, await $.session.root(), id))) mark.id = id
    } catch {
      /* no id: the hook judges the session by its first words */
    }
    return result
  })

  on('command.run', { command: 'phase' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg && arg !== 'resume' && arg !== 'halt') return { text: `unknown argument «${arg}»: /phase, /phase resume or /phase halt. Nothing was sent.` }
    const root = await $.session.root()
    if (arg === 'halt') return { text: await halt($, startDir ?? root) }
    const prompt = await readOr($, `${root}/docs/PROMPT.txt`)
    if (prompt === undefined) return refuse('no docs/PROMPT.txt in the project')
    const wanted = branchOf(prompt)
    if (!wanted) return refuse('docs/PROMPT.txt names no branch (form: «Branch <b> only»)')
    const current = await currentBranch($, root)
    if (current !== wanted) return refuse(`on ${current ? `branch ${current}` : 'no branch (detached HEAD or no repository)'}, docs/PROMPT.txt names ${wanted}`)
    if (arg === 'resume') {
      const line = resumeOf((await readOr($, `${root}/docs/PROGRESS.md`)) ?? '')
      if (!line) return refuse('no open STOP with a Resume line in docs/PROGRESS.md')
      if (/<[^<>]+>|\|/.test(line)) return refuse(`the Resume line has an unfilled <…> or | alternatives; type your answer to it: ${line}`)
      if (sent.has(line)) return refuse(`this Resume line already went in this session; type it if you mean it again: ${line}`)
      sent.add(line)
      $.clock.after(0, () => send($, mark, line, root))
      return { text: `the Resume line goes as your message: ${line}` }
    }
    if (sent.has(prompt)) return refuse('docs/PROMPT.txt already went in this session; type it if you mean it again')
    sent.add(prompt)
    $.clock.after(0, () => send($, mark, prompt, root))
    return { text: `docs/PROMPT.txt goes as your message, on branch ${wanted}.` }
  })
}
