#!/usr/bin/env node
// permission-denied — the kit's PermissionDenied hook (SPEC-v3.4 F6.4): an audit of auto-mode denials as counters, instead of reading the transcript.
//
// The event fires only on auto-mode denials (hooks, PermissionDenied): not on a manual denial, a PreToolUse block or a deny rule.
// One line per denial in docs/evidence/denials.jsonl: ts, session (hash), tool, rule (the class of `reason`), n (this rule's denials in
// this session). Never tool_input, cwd, transcript_path or the text of `reason`: evidence is public. Nothing on stdout: no `retry`, no
// decision. A broken input or an error of its own — no line, exit 0. No network, no model.
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

function ruleOf(reason) {
  const text = String(reason ?? '')
  const bracket = text.match(/^\[([^\]\n]+)\]/)
  if (bracket) return bracket[1]
  if (text.startsWith('Auto mode could not evaluate this action')) return 'no-verdict'
  return text === 'Classifier unavailable' ? 'unavailable' : 'other'
}

function main() {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'))
  if (input?.hook_event_name !== 'PermissionDenied' || typeof input.tool_name !== 'string') return
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
  const logPath = path.join(root, 'docs', 'evidence', 'denials.jsonl')
  const session = createHash('sha256').update(String(input.session_id || '')).digest('hex').slice(0, 8)
  const rule = ruleOf(input.reason)
  const old = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean).flatMap(l => { try { return [JSON.parse(l)] } catch { return [] } }) : []
  const n = old.filter(l => l.session === session && l.rule === rule).length + 1
  fs.mkdirSync(path.dirname(logPath), { recursive: true })
  fs.appendFileSync(logPath, JSON.stringify({ ts: new Date().toISOString(), session, tool: input.tool_name, rule, n }) + '\n')
}

try {
  main()
} catch {}
process.exit(0)
