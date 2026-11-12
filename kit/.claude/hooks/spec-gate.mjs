#!/usr/bin/env node
// spec-gate — the kit's Stop hook (SPEC-v3.2 F2, SPEC-v3.3 F1, SPEC-v3.4 F1): the end of a turn is held by the items of the phase SPEC, not by words.
//
// Code only, $0, no network. The phase SPEC (first `Read first:` of the start prompt) has feature lines (`- **F<n>` … `чек: `cmd` →
// `MARKER``) and under each its items (`  - `F<n>.<k>` …`). The set: per feature a file docs/evidence/F<n>-*-result.txt whose first
// line is `spec: SPEC-<n>` of this SPEC (bin/evidence writes it; a file of another SPEC does not count and is only named as a hint
// while the feature's own set is incomplete, SPEC-v3.4 F1.3) with the
// marker on a line of its own and, per item, a line «F<n>.<k> <raw output of its probe>» in one of the feature's evidence files; the
// branch pushed (HEAD = origin/<branch>); the head of docs/PROGRESS.md (its «## Голова» section) names what is done, the operator's
// next step and when, and was rewritten — in this session when the session committed anything beyond evidence, else in this phase
// (since the last commit of the start prompt: a fresh context on a closed phase is not held); a full /verify-phase round of this SPEC —
// the union of its calls (decision 401): every feature of the SPEC named (`FEATURES: F<n>, …`; a verdict without the line names them
// all) by its newest verdict committed at HEAD for HEAD or an ancestor, a PASS or a NEEDS_WORK whose parsed blocking list leaves it
// out; every commit with its id (item ids at the start of the commit message) seen by a verdict that verifies it; a commit naming no
// item that the verdict of some feature did not see holds the turn and names those features (SPEC-v3.3 F4.4, §5). «Seen» is ancestry,
// not the date order of git log: a merged branch brings older dates. An uncovered feature is a missing line by its name.
// The set is judged as pushed: the start prompt, the SPEC, docs/PROGRESS.md, the evidence files of the SPEC's features and the
// verdict files are read from HEAD, and any of them that `git status` shows as changed, untracked or deleted (eol conversion and
// filters as git applies them) holds the turn by its name. Logs that checks and hooks append (docs/evidence/*.jsonl) and the phase
// report are not part of the set.
// A STOP line counts only from the pushed HEAD (SPEC-v3.3 F1.5). The open STOP (SPEC-v3.5 F3) is the one whose Resume line
// /phase resume sends (openStop below, as the phase-start mod finds it): `STOP: <id>` with a reason of SPEC §4 and, within the next
// three lines (LF or CRLF), a question (a ? with no word, =, & or % right after it, so not one inside a URL) and a resume line. It ends
// the turn as often as the turn ends while it stays open: after the commit that opened it (the oldest commit of the unbroken run of
// PROGRESS versions back from HEAD with the same open STOP line — a stop with the text of a past phase's stop is a new stop) there is
// no commit beyond the report files (docs/evidence/, docs/PROGRESS.md, docs/PLAN-*.md) and no Resume word — a user message after
// that commit that is the stop's Resume line as /phase resume sends it, or starts with «Resume:». A Resume word seen once is kept in
// the log (`resumed`: <sha of the stop commit>:<hash of the line>), so the stop stays closed in the next session (handoff, /clear).
// «— снят» at the end of the line closes it too. A STOP line on disk only, or an open STOP without its form, is a missing line.
// The full set → SPEC_GATE_OK and the turn ends; otherwise the end of the turn is blocked and the reason is the list of what is
// missing, built by code. Jev is not asked here: its one cell — an item against the raw output of its probe — is in the phase
// report, in the shadow (SPEC-v3.3 F1.6).
// Guards: the same list blocked `same_list` times in a row turns a block into a pass (`no-progress`), never an OK; the platform itself
// ends the turn after 8 continuations in a row (hooks: «8-consecutive-continuation cap … resets each time Claude calls a tool»; the
// journal carries `platform_cap`), so the hook keeps no cap of blocks and none of hours (SPEC-v3.4 F1.2). AGENT_STOP is stronger than
// the hook. Background work → pass only for what wakes the session: a task of type monitor, workflow or shell (hooks, Stop input
// `background_tasks[].type`) or a session cron; a subagent or anything else leaves the set to be judged (SPEC-v3.4 F1.1). An
// unreadable .claude/spec-gate.json → pass with the reason. Every decision is a line of docs/evidence/spec-gate.jsonl with the types
// of the background tasks; a pass there, with its reason, is a line of the phase report (F1.5).
// Whose turn is judged (SPEC-v3.5 F2): .claude/phase-session.json (outside git, kept by the phase-start mod: /phase, the prompt it
// sends, classic.SessionStart after /clear) names the phase sessions; the hook only reads it. (1) A session it names is judged. (2) A
// fork — the first records of its transcript carry another session's sessionId (a side chat copies the head of its parent) — passes
// as `not the phase session`, with or without the file. (3) A session the file does not name whose records before the first answer
// of the model carry the start prompt, the Resume line of the open STOP as /phase resume sends it, or the handoff mod's continuation
// is judged: closed on refusal for a phase session, whatever the file says. (4) Any other session is a service one: with the file —
// pass `not the phase session`; without it — judged as in v3.4.
// Modes off · shadow · active: SPEC_GATE from the environment, else `mode` of .claude/spec-gate.json (the team lead's file).
// `claude -p` of acceptance and of the control pairs runs with SPEC_GATE=off. The hook never prints a permission decision; on its
// own error it exits 0, and an empty stdin or one that is not a JSON object is its own error too: pass with the reason in the log (decision 401).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULTS = { mode: 'active', caps: { same_list: 3 } }
const STOP_IDS = ['STOP-PAY', 'STOP-SCOPE', 'STOP-INPUT', 'STOP-NP', 'STOP-TL']
const WAKES = ['monitor', 'workflow', 'shell']  // background task types that wake the session; the rest (subagent, teammate, cloud session, MCP task, a raw type) do not hold the judge back
const PLATFORM_CAP = Number(process.env.CLAUDE_CODE_STOP_HOOK_BLOCK_CAP) || 8
const NO_TRANSCRIPT_MS = 3 * 3600e3  // no readable transcript: the session is taken to have started this long ago
const LABELS = [/Сделано|Done/i, /Следующий шаг|Next step/i, /Когда закончим|When/i]  // the template's three labels of the head
const MARK_FILE = path.join('.claude', 'phase-session.json')  // the phase sessions, kept by the phase-start mod (SPEC-v3.5 F2)
const HANDOFF_STARTS = ['Свежий контекст после хендоффа', 'Fresh context after a handoff']  // the first words of the handoff mod's resumePrompt
const HEAD_BYTES = 32 * 1024 * 1024  // the head of a transcript is read up to the first answer of the model, at most this much
const t0 = Date.now()

const read = p => {
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    return null
  }
}

function git(root, ...args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim()
  } catch {
    return null
  }
}

function atHead(root, rel) {  // the file as committed at HEAD, byte for byte; null when HEAD has no such file
  try {
    return execFileSync('git', ['show', `HEAD:${rel}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 })
  } catch {
    return null
  }
}

const headNames = (root, dir) => (git(root, 'ls-tree', '-z', '--name-only', 'HEAD', `${dir}/`) || '').split('\0').filter(Boolean).map(p => p.slice(dir.length + 1))
const isAncestor = (root, a, b) => a === b || git(root, 'merge-base', '--is-ancestor', a, b) !== null

function changed(root, paths) {  // {path: why} for the paths `git status` names: untracked, staged only, deleted or modified
  const out = {}
  let raw = ''
  try {
    raw = execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', ...paths], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024 })
  } catch {}
  const parts = raw.split('\0')
  for (let i = 0; i < parts.length; i++) {
    const xy = parts[i].slice(0, 2), p = parts[i].slice(3)
    if (!p) continue
    if (xy[0] === 'R' || xy[0] === 'C') i++  // the next field is the source of the rename
    out[p] = xy === '??' || xy[0] === 'A' ? 'is not committed' : xy.includes('D') ? 'is deleted on disk' : 'differs from HEAD'
  }
  return out
}

function commits(root, range, ...opts) {  // [{sha, subj, files}] newest first; files without renames: a move names its source too
  const raw = git(root, 'log', '-z', '--no-merges', '--no-renames', '--name-only', '--format=%x01%H %s', ...opts, range) || ''
  return raw.split('\x01').slice(1).map(chunk => {
    const [head, ...names] = chunk.split('\0')
    const i = head.indexOf(' ')
    return { sha: head.slice(0, i), subj: head.slice(i + 1), files: names.map(n => n.replace(/^\n/, '')).filter(Boolean) }
  })
}

function sessionStart(transcript) {
  // ponytail: the first timestamp of the transcript is the session start; `--continue` keeps the old clock (fail-open: caps pass sooner)
  try {
    const fd = fs.openSync(transcript, 'r')
    const buf = Buffer.alloc(65536)
    const n = fs.readSync(fd, buf, 0, buf.length, 0)
    fs.closeSync(fd)
    for (const line of buf.subarray(0, n).toString('utf8').split('\n')) {
      const m = line.match(/"timestamp"\s*:\s*"([^"]+)"/)
      if (m && !Number.isNaN(Date.parse(m[1]))) return Date.parse(m[1])
    }
  } catch {}
  return null
}

function transcriptHead(p) {  // the records before the first answer of the model; null when the transcript is not readable
  let fd
  try {
    fd = fs.openSync(p, 'r')
    const out = []
    let rest = '', pos = 0
    const buf = Buffer.alloc(1024 * 1024)
    while (pos < HEAD_BYTES) {
      const n = fs.readSync(fd, buf, 0, buf.length, pos)
      if (!n) break
      pos += n
      const lines = (rest + buf.subarray(0, n).toString('utf8')).split('\n')
      rest = lines.pop()
      for (const l of lines) {
        let r
        try { r = JSON.parse(l) } catch { continue }
        if (r?.type === 'assistant') return out
        out.push(r)
      }
    }
    try { const r = JSON.parse(rest); if (r?.type !== 'assistant') out.push(r) } catch {}
    return out
  } catch {
    return null
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch {}
  }
}

const userText = r => {  // the text of a user record: a string or its text parts; a tool result is not the person's word
  const c = r?.type === 'user' ? r.message?.content : null
  return typeof c === 'string' ? c : Array.isArray(c) ? c.filter(x => x?.type === 'text').map(x => String(x.text ?? '')).join('\n') : ''
}
const norm = s => String(s).replace(/\s+/g, ' ').trim()

function phaseMark(root) {  // {exists, sessions}: a file that is not JSON names no session, yet it is there
  const raw = read(path.join(root, MARK_FILE))
  if (raw === null) return { exists: false, sessions: [] }
  try {
    const j = JSON.parse(raw)
    const s = Array.isArray(j) ? j : j?.sessions
    return { exists: true, sessions: Array.isArray(s) ? s.filter(x => typeof x === 'string') : [] }
  } catch {
    return { exists: true, sessions: [] }
  }
}

// The open STOP of a PROGRESS as the phase-start mod finds it (resumeOf, mods/phase-start/hooks/text.ts): the last STOP line of
// «## Open stop», else of the first section with a STOP that is not «## Closed…»; its Resume line within the next three lines,
// «Resume: …» before «Продолжай…», never a question. null — no STOP line there.
const STOP_ONE = /^[ \t]*(?:[-*][ \t]*)?STOP:[ \t]*STOP-[A-Z]+\b/m
const LIFTED = /[—–-]+\s*снят\S*\s*$/i
const RESUME_LINE = /^[ \t]*(?:[-*][ \t]*)?\**Resume:\**[ \t]*(\S.*)$/i
const CONTINUE_LINE = /^[ \t]*(?:[-*][ \t]*)?(Продолж[^?]*)$/i
function openStop(progress) {
  const sections = progress.split(/^(?=## )/m)
  const section = sections.find(s => s.startsWith('## Open stop')) ?? sections.find(s => !s.startsWith('## Closed') && STOP_ONE.test(s)) ?? ''
  const lines = section.split(/\r?\n/)
  const i = lines.findLastIndex(l => STOP_ONE.test(l))
  if (i < 0) return null
  const near = lines.slice(i + 1, i + 4)
  let resume
  for (const re of [RESUME_LINE, CONTINUE_LINE]) {
    for (const l of near) {
      const t = (l.match(re) || [])[1]?.trim()
      if (t && !t.endsWith('?')) { resume = t; break }
    }
    if (resume) break
  }
  return { line: lines[i], lifted: LIFTED.test(lines[i]), resume, near: near.join('\n') }
}

// The commit that opened the open STOP: the oldest of the unbroken run of PROGRESS versions back from HEAD whose open STOP has the
// same line; a run broken by a version without it (an answered stop, a fresh PROGRESS of the next phase) starts after the break.
function stopCommit(root, line) {
  const shas = (git(root, 'log', '--format=%H', '-n', '300', 'HEAD', '--', 'docs/PROGRESS.md') || '').split('\n').filter(Boolean)
  let at = null
  for (const s of shas) {
    const o = openStop(git(root, 'show', `${s}:docs/PROGRESS.md`) || '')
    if (!o || o.line !== line) break
    at = s
  }
  return at
}

// A Resume word after `since` (ms) in the transcript's last 16 MB: a user message (not meta, not a tool result) that is the Resume line
// as /phase resume sends it, or starts with «Resume:».
function resumeWord(p, resume, since) {
  let fd
  try {
    fd = fs.openSync(p, 'r')
    const size = fs.fstatSync(fd).size
    const from = Math.max(0, size - 16 * 1024 * 1024)
    const buf = Buffer.alloc(size - from)
    fs.readSync(fd, buf, 0, buf.length, from)
    const want = resume ? norm(resume) : null
    for (const l of buf.toString('utf8').split('\n')) {
      if (!l.includes('"user"')) continue
      let r
      try { r = JSON.parse(l) } catch { continue }
      if (r?.isMeta || !(Date.parse(r?.timestamp) > since)) continue
      const t = norm(userText(r))
      if (t && ((want && t === want) || /^Resume:/i.test(t))) return true
    }
  } catch {} finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch {}
  }
  return false
}

// SPEC-v3.5 F2: null — the session is judged; {reason} — it passes as not the phase session.
function notPhase(input, root, promptText, progress) {
  const id = String(input.session_id || '')
  const mark = phaseMark(root)
  if (id && mark.sessions.includes(id)) return null  // (1)
  const head = transcriptHead(input.transcript_path)
  const first = (head || []).find(r => typeof r?.sessionId === 'string')
  if (first && id && first.sessionId !== id) return { reason: `not the phase session: a fork of ${createHash('sha256').update(first.sessionId).digest('hex').slice(0, 8)}` }  // (2)
  const stop = openStop(progress)
  const resume = stop && !stop.lifted ? stop.resume : null
  const want = norm(promptText).slice(0, 200)
  const own = (head || []).map(userText).map(norm).filter(Boolean)
  const asks = own.some(t => (want && t.includes(want)) || (resume && (t === norm(resume) || t.startsWith(`Resume: ${norm(resume)}`))) || /^Resume:/i.test(t)
    || HANDOFF_STARTS.some(h => t.startsWith(h)))
  if (asks) return null  // (3)
  return mark.exists ? { reason: `not the phase session: ${MARK_FILE} does not name it` } : null  // (4)
}

function features(spec) {  // feature lines and, under each, its item lines `  - `F<n>.<k>` …` and the ids of its «готово:» range
  const out = []
  let open = false
  for (const l of spec.split('\n')) {
    const f = l.match(/^- \*\*(F\d+)\b/)
    if (f) {
      const range = ((l.match(/готово:\s*(.*?)\s*·\s*чек:/) || [])[1] || '').match(/^(F\d+)\.(\d+)\s*[–-]\s*\1\.(\d+)$/)
      const declared = range ? Array.from({ length: Math.max(0, range[3] - range[2] + 1) }, (_, i) => `${range[1]}.${Number(range[2]) + i}`) : []
      out.push({ id: f[1], marker: (l.match(/чек:\s*`[^`]*`\s*→\s*`([A-Z0-9_]+)`/) || [])[1] || null, items: declared.filter(d => d.startsWith(`${f[1]}.`)) })
      open = true
      continue
    }
    if (open && !l.trim()) continue  // a blank line inside the list does not end it
    const it = open && l.match(/^\s+- `(F\d+\.\d+)`/)
    if (it && it[1].startsWith(`${out.at(-1).id}.`)) { if (!out.at(-1).items.includes(it[1])) out.at(-1).items.push(it[1]) }
    else open = false
  }
  return out
}

function stopReasons(spec) {
  const sec = (spec.match(/\n## 4\.[^\n]*\n([\s\S]*?)(?=\n## |$)/) || [])[1] || ''
  const ids = [...new Set([...sec.matchAll(/\*\*(STOP-[A-Z]+)\*\*/g)].map(m => m[1]))]
  return ids.length ? ids : STOP_IDS
}

const STOP_LINE = /^[ \t]*(?:[-*][ \t]*)?STOP:[ \t]*(STOP-[A-Z]+)\b.*$/gm
const sha12 = s => createHash('sha256').update(s).digest('hex').slice(0, 12)
const canon = line => line.slice(line.indexOf('STOP:')).trim()

function head(progress) {
  const m = progress.match(/\n## (?:Голова|Head)[^\n]*\n[\s\S]*?(?=\n## |$)/)
  return (m ? m[0] : progress.split('\n').slice(0, 20).join('\n')).trim().slice(0, 4000)
}

function verdicts(root, sha, specPath) {  // verdict files of this SPEC committed at HEAD for HEAD or an ancestor: {file, sha, pass, scope: null = full round, blocking}
  const out = []
  for (const f of headNames(root, 'docs/evidence')) {
    const m = f.match(/^verify-([0-9a-f]{7,40})(?:-[\w.-]+)?\.txt$/)
    const text = m && atHead(root, `docs/evidence/${f}`)
    const v = text && text.split('\n')[0].trim()
    if (v !== 'VERDICT: PASS' && v !== 'VERDICT: NEEDS_WORK') continue
    if (path.basename((text.match(/^\/verify-phase · (\S+) · /m) || [])[1] || '') !== path.basename(specPath)) continue  // a verdict of another SPEC does not count
    const full = git(root, 'rev-parse', '--verify', '-q', `${m[1]}^{commit}`)
    if (!full || !isAncestor(root, full, sha)) continue
    const scope = (text.match(/^FEATURES:\s*(.+)$/m) || [])[1]
    const sec = (text.match(/\n## (?:Блокирующие|Blocking)[^\n]*\n([\s\S]*?)(?=\n## |$)/) || [])[1] || ''
    out.push({ file: f, sha: full, pass: v === 'VERDICT: PASS', scope: scope ? [...new Set(scope.match(/F\d+/g) || [])] : null,
      blocking: [...new Set([...sec.matchAll(/^- \*\*(F\d+)/gm)].map(x => x[1]))] })
  }
  return out
}

function coverage(root, sha, ids, specPath) {  // what the verdicts leave uncovered — [] when HEAD is covered (SPEC-v3.3 F4.4, decision 401)
  const all = verdicts(root, sha, specPath)
  const unseen = new Map(all.map(v => [v, new Set((git(root, 'rev-list', `${v.sha}..${sha}`) || '').split('\n').filter(Boolean))]))  // what a verdict did not see
  const saw = (v, c) => !unseen.get(v).has(c.sha)
  const names = (v, f) => !v.scope || v.scope.includes(f)  // no FEATURES line — a round of every feature: one file with all is the special case
  // v verifies f when it names it and does not block it; a NEEDS_WORK verdict without a parsed blocking list blocks all it names
  const verifies = (v, f) => names(v, f) && (v.pass || (v.blocking.length > 0 && !v.blocking.includes(f)))
  // the verdict of a feature: its newest naming one (fewest commits it did not see); at the same commit one that verifies it comes first
  const newest = f => all.filter(v => names(v, f)).sort((a, b) => unseen.get(a).size - unseen.get(b).size || verifies(b, f) - verifies(a, f))[0]
  const of = Object.fromEntries(ids.map(f => [f, newest(f)]))
  const s7 = x => x.slice(0, 7)
  const missing = ids.filter(f => !of[f]).map(f => `${f}: no /verify-phase verdict in HEAD names ${f} for HEAD ${s7(sha)} or an ancestor (docs/evidence/verify-<sha>[-F…].txt) — the full round is the union of the calls: every feature named by a PASS, or by a NEEDS_WORK that does not block it`)
  const used = [...new Set(Object.values(of).filter(Boolean))]
  if (!used.length) return { missing }
  const own = p => p.startsWith('docs/evidence/') || p === 'docs/PROGRESS.md' || /^docs\/PLAN-[^/]+\.md$/.test(p)  // the executor's report files
  const skip = c => c.subj.startsWith('Тимлид:') || c.files.every(own)
  // the commits some used verdict did not see: one range on a line of history, the union of the ranges after a merge (git log orders by date)
  const late = new Map()
  for (const v of used) if (unseen.get(v).size) for (const c of commits(root, `${v.sha}..${sha}`)) if (!late.has(c.sha) && !skip(c)) late.set(c.sha, c)
  const changes = {}  // feature → its commits that some used verdict did not see
  for (const c of late.values()) {
    const fs_ = [...new Set(((c.subj.match(/^((?:F\d+\.\d+[,;\s]*)+)/) || [])[1] || '').match(/F\d+(?=\.)/g) || [])]
    for (const f of fs_) (changes[f] ||= []).push(c)
    if (fs_.length) continue
    const owed = ids.filter(f => of[f] && !saw(of[f], c)).map(f => `${f} (${of[f].file})`)  // covered once each of them has a verdict at or after it
    missing.push(`commit ${s7(c.sha)} «${c.subj.slice(0, 60)}» after the /verify-phase round of ${owed.join(', ')} changes ${c.files.slice(0, 3).join(', ')} and names no item: it is covered when each of these features has a verdict at or after it`)
  }
  for (const f of [...ids, ...Object.keys(changes).filter(f => !ids.includes(f))]) {
    const v = of[f] ?? (of[f] = newest(f))
    if (!v) { if (!ids.includes(f)) missing.push(`${f}: commit ${s7(changes[f][0].sha)} names ${f}, and no /verify-phase verdict in HEAD names it`); continue }
    if (!verifies(v, f)) { missing.push(`${f}: blocking in the /verify-phase round ${s7(v.sha)} (${v.file}) — no point VERDICT: PASS that names ${f} after it`); continue }
    // every change of f its verdict did not see needs a verdict that verifies f and saw it — not only the first one git log lists
    const open = (changes[f] || []).find(c => !saw(v, c) && !all.some(w => verifies(w, f) && saw(w, c)))
    if (open) missing.push(`${f}: changed after its /verify-phase verdict ${s7(v.sha)} (${v.file}, commit ${s7(open.sha)}) — no point VERDICT: PASS that names ${f} at or after it`)
  }
  return { missing, used: used.map(v => v.file).join(', ') }
}

const bgTypes = input => (Array.isArray(input.background_tasks) ? input.background_tasks : []).map(t => String(t?.type ?? 'no type')).sort()

function decide(input, root, cfg, log) {
  const prior = log.filter(l => l.session === input.session)
  const stopFile = process.env.AGENT_STOP_FILE || path.join(root, 'AGENT_STOP')
  if (fs.existsSync(stopFile)) return { decision: 'pass', reason: 'agent-stop' }
  const promptFile = ['docs/PROMPT.txt', 'docs/GOAL.txt'].find(p => atHead(root, p) !== null || fs.existsSync(path.join(root, p)))
  if (!promptFile) return null // no phase is open
  const rf = ((atHead(root, promptFile) ?? read(path.join(root, promptFile)) ?? '').match(/^Read first:(.*)$/m) || [])[1] || ''
  const specPath = rf.split(',').map(s => s.trim()).find(s => /(^|\/)SPEC-[^/]+\.md$/.test(s))
  const spec = specPath && (atHead(root, specPath) ?? read(path.join(root, specPath)))
  if (!spec) return { decision: 'pass', reason: `no SPEC in Read first of ${promptFile}` }
  const other = notPhase(input, root, atHead(root, promptFile) ?? read(path.join(root, promptFile)) ?? '', atHead(root, 'docs/PROGRESS.md') || '')
  if (other) return { decision: 'pass', reason: other.reason }
  const wakes = [...new Set(bgTypes(input).filter(t => WAKES.includes(t)))]
  if ((input.session_crons || []).length) wakes.push('cron')
  if (wakes.length) return { decision: 'pass', reason: `background:${wakes.join(',')}` }
  const start = sessionStart(input.transcript_path) ?? t0 - NO_TRANSCRIPT_MS

  const feats = features(spec)
  const specName = path.basename(specPath).replace(/\.md$/, '')  // the first line of an evidence file of this SPEC: `spec: SPEC-<n>`
  const missing = []
  const isEvidence = n => !n.includes('/') && (/^verify-[0-9a-f]{7,40}(?:-[\w.-]+)?\.txt$/.test(n) || feats.some(f => n.startsWith(`${f.id}-`) && n.endsWith('-result.txt')))
  const loose = Object.entries(changed(root, [promptFile, specPath, 'docs/PROGRESS.md', 'docs/evidence']))
    .filter(([p]) => [promptFile, specPath, 'docs/PROGRESS.md'].includes(p) || (p.startsWith('docs/evidence/') && isEvidence(p.slice('docs/evidence/'.length))))
  for (const [p, why] of loose) missing.push(`${p} ${why} — the set is judged as pushed: commit and push it`)
  const evDir = path.join(root, 'docs', 'evidence')
  const evHead = headNames(root, 'docs/evidence')
  const evDisk = fs.existsSync(evDir) ? fs.readdirSync(evDir) : []
  const items = feats.reduce((n, f) => n + f.items.length, 0)
  for (const f of feats) {
    if (!f.marker) { missing.push(`${f.id}: the SPEC line names no check marker (\`чек: \`…\` → \`MARKER\`\`)`); continue }
    const mine = n => n.startsWith(`${f.id}-`) && n.endsWith('-result.txt')
    const lines = text => (text || '').split('\n').map(l => l.trim())
    const ofSpec = ([, ls]) => ls[0] === `spec: ${specName}`
    const atH = evHead.filter(mine).map(n => [n, lines(atHead(root, `docs/evidence/${n}`))]).filter(ofSpec)
    const onD = evDisk.filter(mine).map(n => [n, lines(read(path.join(evDir, n)))]).filter(ofSpec)
    const names = [...new Set([...evHead, ...evDisk].filter(mine))]
    const where = test => [atH.find(([, ls]) => ls.some(test))?.[0], onD.find(([, ls]) => ls.some(test))?.[0]]
    const [hit, disk] = where(l => [f.marker, `${f.id} ${f.marker}`].includes(l))
    if (!names.length) { missing.push(`${f.id}: no docs/evidence/${f.id}-*-result.txt${f.items.length ? ` — items ${f.items.join(', ')} without a probe line` : ''}`); continue }
    const gaps = []
    if (!hit) gaps.push(disk ? `${f.id}: the line ${f.marker} is in docs/evidence/${disk} on disk only, not in HEAD` : `${f.id}: no line ${f.marker} in docs/evidence/${names.join(', docs/evidence/')}`)
    for (const id of f.items) {  // the probe line of an item: its id, a space and the raw output of its probe
      const [h, d] = where(l => l.startsWith(`${id} `) && l.length > id.length + 1)
      if (!h) gaps.push(d ? `${id}: its probe line is in docs/evidence/${d} on disk only, not in HEAD` : `${id}: no probe line «${id} <raw output>» in docs/evidence/${names.join(', docs/evidence/')} at HEAD`)
    }
    // a file of another SPEC holds nothing by itself: next to a complete own set it is not named at all
    if (gaps.length) for (const n of names.filter(n => !atH.some(x => x[0] === n) && !onD.some(x => x[0] === n))) missing.push(`${f.id}: docs/evidence/${n} is not of ${specName} — its first line is not «spec: ${specName}», its lines do not count`)
    missing.push(...gaps)
  }
  if (!feats.length) missing.push(`${specPath}: no feature lines «- **F<n> …»`)
  const sha = git(root, 'rev-parse', 'HEAD')
  const branch = git(root, 'branch', '--show-current')
  const remote = branch && git(root, 'rev-parse', '-q', '--verify', `refs/remotes/origin/${branch}`)
  const pushed = !!sha && !!branch && remote === sha
  if (!pushed) missing.push(`branch ${branch || '(detached)'} is not pushed: HEAD ${(sha || '?').slice(0, 7)}, origin/${branch} ${(remote || 'none').slice(0, 7)}`)
  const disk = read(path.join(root, 'docs', 'PROGRESS.md')) || ''
  const progress = atHead(root, 'docs/PROGRESS.md') || ''  // its head and its STOP lines count as pushed
  const baseSha = git(root, 'log', '-1', '--format=%H', `--before=${new Date(start).toISOString()}`)
  const base = (baseSha && git(root, 'show', `${baseSha}:docs/PROGRESS.md`)) || ''
  const worked = commits(root, 'HEAD', `--since=${new Date(start).toISOString()}`).some(c => c.files.some(p => !p.startsWith('docs/evidence/')))
  const phaseSha = git(root, 'log', '-1', '--format=%H', '--', promptFile)
  const ref = worked ? base : (phaseSha && git(root, 'show', `${phaseSha}:docs/PROGRESS.md`)) || ''
  const hd = head(progress)
  if (!loose.some(([p]) => p === 'docs/PROGRESS.md')) {
    if (!hd || (ref && hd === head(ref))) missing.push(`the head of docs/PROGRESS.md was not updated in this ${worked ? 'session' : 'phase'}`)
    else if (!LABELS.every(r => r.test(hd))) missing.push('the head of docs/PROGRESS.md does not say what is done («Сделано»), the operator\'s next step («Следующий шаг оператора») and when («Когда закончим»)')
  }
  const cov = sha ? coverage(root, sha, feats.map(f => f.id), specPath) : { missing: ['no HEAD'] }
  missing.push(...cov.missing)

  const reasons = stopReasons(spec)
  const atHeadLines = new Set([...progress.matchAll(STOP_LINE)].map(m => canon(m[0])))
  for (const m of [...disk.matchAll(STOP_LINE)].filter(m => !atHeadLines.has(canon(m[0])))) {
    missing.push(`«${canon(m[0]).slice(0, 60)}» is in docs/PROGRESS.md on disk only: a STOP counts from the pushed HEAD — commit and push it`)
  }
  const open = openStop(progress)  // SPEC-v3.5 F3: the STOP /phase resume answers, as long as it stays open
  const resumed = []
  if (open && !open.lifted) {
    const id = (open.line.match(/STOP:[ \t]*(STOP-[A-Z]+)/) || [])[1]
    if (!reasons.includes(id)) missing.push(`«STOP: ${id}» is not a stop of SPEC §4 (${reasons.join(', ')})`)
    else if (!(/\?(?![\w=&%])/.test(open.near) && /resume|продолж/i.test(open.near))) missing.push(`«STOP: ${id}» has no question (?) and resume line within the next three lines`)
    else {
      const at = stopCommit(root, open.line)
      const mark = at && `${at.slice(0, 12)}:${sha12(canon(open.line))}`
      const own = p => p.startsWith('docs/evidence/') || p === 'docs/PROGRESS.md' || /^docs\/PLAN-[^/]+\.md$/.test(p)
      const code = at ? commits(root, `${at}..HEAD`).find(c => c.files.some(p => !own(p))) : null
      const when = at ? Number(git(root, 'log', '-1', '--format=%ct', at)) * 1000 : Infinity
      const word = !!mark && (log.some(l => (l.resumed || []).includes(mark)) || resumeWord(input.transcript_path, open.resume, when))
      if (word) resumed.push(mark)
      if (mark && !code && !word && pushed) return { decision: 'stop', reason: id, stops: [mark] }
    }
  }
  if (!missing.length) return { decision: 'ok', reason: `SPEC_GATE_OK: features ${feats.length}, items ${items}, pushed ${sha.slice(0, 7)}, ${cov.used}`, resumed }
  // the guard only turns a block into a pass: the set is evaluated first, so a full set or a new STOP is never lost to it
  const last = prior.slice(-cfg.caps.same_list)
  const same = l => JSON.stringify(l || [])
  if (last.length === cfg.caps.same_list && last.every(l => l.decision === 'block' && same(l.missing) === same(missing))) {
    return { decision: 'pass', reason: `no-progress: the same list blocked ${cfg.caps.same_list} times in a row`, missing, resumed }
  }
  return { decision: 'block', reason: `${missing.length} missing`, missing, resumed }
}

function main() {
  let raw = ''
  try {
    raw = fs.readFileSync(0, 'utf8')
  } catch {}
  let input = null
  try {
    input = JSON.parse(raw)
  } catch {}
  // the hook's own error: no Stop input to judge — the turn passes, the reason goes to the log (decision 401)
  const mute = input && typeof input === 'object' && !Array.isArray(input) ? null
    : raw.trim() ? `stdin: not a JSON object (${Buffer.byteLength(raw)} bytes) — the gate passes` : 'stdin: empty — the gate passes'
  if (mute) input = {}
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
  let cfg = DEFAULTS
  let broken = null
  try {
    const c = JSON.parse(read(path.join(root, '.claude', 'spec-gate.json')) || '{}')
    cfg = { ...DEFAULTS, ...c, caps: { ...DEFAULTS.caps, ...c.caps } }
  } catch (e) {
    broken = `config: .claude/spec-gate.json is not readable JSON (${e.name}) — the gate passes`
  }
  const mode = String(process.env.SPEC_GATE || (broken ? 'shadow' : cfg.mode)).trim().toLowerCase()  // OFF and Active mean what they say
  if (mode === 'off') return
  input.session = createHash('sha256').update(String(input.session_id || '')).digest('hex').slice(0, 8)
  const logPath = path.join(root, 'docs', 'evidence', 'spec-gate.jsonl')
  const log = (read(logPath) || '').split('\n').filter(Boolean).flatMap(l => { try { return [JSON.parse(l)] } catch { return [] } })
  let d
  try {
    d = broken || mute ? { decision: 'pass', reason: broken || mute } : decide(input, root, cfg, log)
  } catch (e) {
    d = { decision: 'pass', reason: `error: ${e.name}: ${String(e.message).slice(0, 120)}` }
  }
  if (!d) return
  const line = { ts: new Date().toISOString(), session: input.session, mode, decision: d.decision, reason: d.reason, missing: d.missing || [], stops: d.stops || [], resumed: d.resumed || [],
    bg: bgTypes(input), platform_cap: PLATFORM_CAP, stop_hook_active: !!input.stop_hook_active, ms: Date.now() - t0 }
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.appendFileSync(logPath, JSON.stringify(line) + '\n')
  } catch {}
  if (d.decision === 'block' && mode === 'active') {
    const reason = `spec-gate: the phase is not done — the end of the turn is held. Missing:\n${d.missing.map(m => `- ${m}`).join('\n')}\nClose what is missing, or commit and push a new line \`STOP: <id>\` for a stop of SPEC §4 with the question and a resume line.`
    process.stdout.write(JSON.stringify({ decision: 'block', reason }) + '\n')
  } else if (d.decision === 'ok' || d.decision === 'stop' || (d.decision === 'pass' && !d.reason.startsWith('background') && !d.reason.startsWith('not the phase session'))) {  // a side chat is not told at every turn
    const msg = d.decision === 'ok' ? d.reason : `spec-gate (${mode}): ${d.decision} — ${d.reason}`
    process.stdout.write(JSON.stringify({ systemMessage: msg }) + '\n')
  }
}

try {
  main()
} catch {}
process.exit(0)
