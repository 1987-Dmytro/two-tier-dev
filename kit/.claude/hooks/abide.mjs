#!/usr/bin/env node
// abide — the kit's wiring of the four Abide hooks (SPEC-v3.2 F3): every edit is judged against the rules of the project's
// CLAUDE.md that the team lead compiled into .abide/rubric.json; the executor neither compiles nor edits the rubric.
//   node .claude/hooks/abide.mjs session-start | turn-start | post-tool-use | stop    (stdin — the hook input of Claude Code)
// Runs the installed Abide (@coldtea/abide, found through `abide` on PATH) with TYPESAFE_AI_API_KEY taken from TYPESAFE_API_KEY
// and ABIDE_HOME_DIR under /tmp/two-tier-v3: its session state never lands in ~/.abide and the operator's global rubric is not
// read. Mode — a note: a fix demand on an edit (PostToolUse) reaches Claude as Abide prints it; a block at Stop becomes a
// message to the operator, so the end of the turn is never held; a request to compile the rubric becomes a message to the
// operator too (the rubric is the team lead's file). No Abide, an error or a timeout — silence and exit 0.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BUDGET = { 'session-start': 9000, 'turn-start': 9000, 'post-tool-use': 19000, stop: 29000 } // ms; Abide's own: 8/8/18/28 s

function hookScript() {
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    try {
      const js = path.join(path.dirname(fs.realpathSync(path.join(dir, 'abide'))), 'abide-hook.js') // …/@coldtea/abide/dist/
      if (fs.existsSync(js)) return js
    } catch {}
  }
  return null
}

function main() {
  const event = process.argv[2]
  const js = BUDGET[event] && hookScript()
  if (!js) return
  let input = ''
  try {
    input = fs.readFileSync(0, 'utf8')
  } catch {}
  const env = { ...process.env, ABIDE_HOME_DIR: process.env.ABIDE_HOME_DIR || '/tmp/two-tier-v3/abide-home' }
  if (!env.TYPESAFE_AI_API_KEY && env.TYPESAFE_API_KEY) env.TYPESAFE_AI_API_KEY = env.TYPESAFE_API_KEY
  fs.mkdirSync(env.ABIDE_HOME_DIR, { recursive: true, mode: 0o700 })
  const r = spawnSync(process.execPath, [js, event], { input, env, encoding: 'utf8', timeout: BUDGET[event], killSignal: 'SIGKILL' })
  const raw = (r.stdout || '').trim()
  let out
  try {
    out = JSON.parse(raw)
  } catch {
    return
  }
  if (event === 'stop' && out.decision === 'block') {
    const note = `Abide (a note; the end of the turn is not held): ${out.reason}`
    process.stdout.write(JSON.stringify({ systemMessage: out.systemMessage ? `${note}\n${out.systemMessage}` : note }) + '\n')
    return
  }
  const ctx = out.hookSpecificOutput?.additionalContext || ''
  if (event === 'session-start' && /rubric is missing or out of date/.test(ctx)) {
    const what = (ctx.match(/^Project rubric: .*?(\([^)]*\))\s*$/m) || [])[1] || ''
    const note = `Abide: .abide/rubric.json is missing or out of date ${what} — the team lead compiles and calibrates it; until then edits are judged by the rules the rubric has.`
    process.stdout.write(JSON.stringify({ systemMessage: out.systemMessage ? `${out.systemMessage}\n${note}` : note }) + '\n')
    return
  }
  process.stdout.write(raw + '\n')
}

try {
  main()
} catch {}
process.exit(0)
