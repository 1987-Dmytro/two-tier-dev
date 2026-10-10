#!/usr/bin/env node
// spec-gate — the kit's Stop hook (SPEC-v3.2 F2, SPEC-v3.3 F1): the end of a turn is held by the items of the phase SPEC, not by words.
//
// Code only, $0, no network. The phase SPEC (first `Read first:` of the start prompt) has feature lines (`- **F<n>` … `чек: `cmd` →
// `MARKER``) and under each its items (`  - `F<n>.<k>` …`). The set: per feature a file docs/evidence/F<n>-*-result.txt with the
// marker on a line of its own and, per item, a line «F<n>.<k> <raw output of its probe>» in one of the feature's evidence files; the
// branch pushed (HEAD = origin/<branch>); the head of docs/PROGRESS.md (its «## Голова» section) names what is done, the operator's
// next step and when, and was rewritten — in this session when the session committed anything beyond evidence, else in this phase
// (since the last commit of the start prompt: a fresh context on a closed phase is not held); a VERDICT: PASS of a full
// /verify-phase round for HEAD or an ancestor, and for every feature changed after it (item ids at the start of the commit
// message) a point VERDICT: PASS that names it (`FEATURES: F<n>, …`), at or after its last change (SPEC-v3.3 F4.4).
// The set is judged as pushed: the start prompt, the SPEC, docs/PROGRESS.md, the evidence files of the SPEC's features and the
// verdict files are read from HEAD, and any of them that `git status` shows as changed, untracked or deleted (eol conversion and
// filters as git applies them) holds the turn by its name. Logs that checks and hooks append (docs/evidence/*.jsonl) and the phase
// report are not part of the set.
// A STOP line counts only from the pushed HEAD (SPEC-v3.3 F1.5): a new line `STOP: <id>` with a reason of SPEC §4 and, within
// the next three lines, a question (?) and a resume line ends the turn once. It is new when its text from «STOP:» on starts neither
// like a STOP line of the PROGRESS committed before the session nor like a stop already honored (the log keeps their marks): its
// first 60 characters, or all of a shorter line — an edited tail, «— снят» at the end or a bullet in front keep a line old.
// The full set → SPEC_GATE_OK and the turn ends; otherwise the end of the turn is blocked and the reason is the list of what is
// missing, built by code. Jev is not asked here: its one cell — an item against the raw output of its probe — is in the phase
// report, in the shadow (SPEC-v3.3 F1.6).
// Guards: a cap of blocks and of hours per session and the same list blocked `same_list` times in a row turn a block into a pass
// (`cap-…`, `no-progress`), never an OK; AGENT_STOP is stronger than the hook; background tasks or session crons → pass (the
// session waits to be woken up); an unreadable .claude/spec-gate.json → pass with the reason. Every decision is a line of
// docs/evidence/spec-gate.jsonl; a pass there, with its reason, is a line of the phase report (F1.5).
// Modes off · shadow · active: SPEC_GATE from the environment, else `mode` of .claude/spec-gate.json (the team lead's file).
// `claude -p` of acceptance and of the control pairs runs with SPEC_GATE=off. The hook never prints a permission decision; on its
// own error it exits 0.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULTS = { mode: 'active', caps: { blocks: 12, hours: 3, same_list: 3 } }
const STOP_IDS = ['STOP-PAY', 'STOP-SCOPE', 'STOP-INPUT', 'STOP-NP']
const LABELS = [/Сделано|Done/i, /Следующий шаг|Next step/i, /Когда закончим|When/i]  // the template's three labels of the head
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
const stopMark = line => { const c = canon(line).slice(0, 60); return `${c.length}:${sha12(c)}` }  // «n:hash» of its first n ≤ 60 characters
const marked = (line, marks) => marks.some(k => {  // the first n characters match; a mark shorter than 40 also needs the same line or «— снят» after it
  const [n, h] = k.includes(':') ? k.split(':').map((x, i) => (i ? x : Number(x))) : [60, k]
  const c = canon(line)
  return sha12(c.slice(0, n)) === h && (n >= 40 || !c.slice(n).trim() || /^\s*[—–-]+\s*снят/i.test(c.slice(n)))
})

function head(progress) {
  const m = progress.match(/\n## (?:Голова|Head)[^\n]*\n[\s\S]*?(?=\n## |$)/)
  return (m ? m[0] : progress.split('\n').slice(0, 20).join('\n')).trim().slice(0, 4000)
}

function verdicts(root, sha) {  // verdict files committed at HEAD for HEAD or an ancestor: {file, sha, pass, scope: null = full round, blocking}
  const out = []
  for (const f of headNames(root, 'docs/evidence')) {
    const m = f.match(/^verify-([0-9a-f]{7,40})(?:-[\w.-]+)?\.txt$/)
    const text = m && atHead(root, `docs/evidence/${f}`)
    const v = text && text.split('\n')[0].trim()
    if (v !== 'VERDICT: PASS' && v !== 'VERDICT: NEEDS_WORK') continue
    const full = git(root, 'rev-parse', '--verify', '-q', `${m[1]}^{commit}`)
    if (!full || !isAncestor(root, full, sha)) continue
    const scope = (text.match(/^FEATURES:\s*(.+)$/m) || [])[1]
    const sec = (text.match(/\n## (?:Блокирующие|Blocking)[^\n]*\n([\s\S]*?)(?=\n## |$)/) || [])[1] || ''
    out.push({ file: f, sha: full, pass: v === 'VERDICT: PASS', scope: scope ? [...new Set(scope.match(/F\d+/g) || [])] : null,
      blocking: [...new Set([...sec.matchAll(/^- \*\*(F\d+)/gm)].map(x => x[1]))] })
  }
  return out
}

function coverage(root, sha, ids) {  // what the verdicts leave uncovered — [] when HEAD is covered (SPEC-v3.3 F4.4)
  const all = verdicts(root, sha)
  const isFull = v => !v.scope || ids.every(i => v.scope.includes(i))
  const dist = v => Number(git(root, 'rev-list', '--count', `${v.sha}..${sha}`) ?? 1e9)
  const full = all.filter(isFull).sort((a, b) => dist(a) - dist(b) || b.pass - a.pass)[0]  // the newest full round, PASS or NEEDS_WORK
  const vs = all.filter(v => v.pass)
  if (!full) return { missing: [`no full /verify-phase round for HEAD ${sha.slice(0, 7)} or an ancestor in HEAD (docs/evidence/verify-<sha>.txt)`] }
  const missing = [], last = {}
  // SPEC-v3.3 §5: the blocking findings of the one full round are fixed, then only the touched features are verified again
  const failed = full.pass ? [] : full.blocking.length ? full.blocking : ids
  for (const f of failed) last[f] = full.sha
  const own = p => p.startsWith('docs/evidence/') || p === 'docs/PROGRESS.md' || /^docs\/PLAN-[^/]+\.md$/.test(p)  // the executor's report files
  for (const c of commits(root, `${full.sha}..${sha}`)) {
    if (c.subj.startsWith('Тимлид:') || c.files.every(own)) continue
    const fs_ = [...new Set(((c.subj.match(/^((?:F\d+\.\d+[,;\s]*)+)/) || [])[1] || '').match(/F\d+(?=\.)/g) || [])]
    if (!fs_.length) missing.push(`commit ${c.sha.slice(0, 7)} «${c.subj.slice(0, 60)}» after the full /verify-phase round ${full.sha.slice(0, 7)} changes ${c.files.slice(0, 3).join(', ')} and names no item: no point verdict can cover it`)
    for (const f of fs_) if (!last[f] || last[f] === full.sha) last[f] = c.sha  // newest first: the first seen is the last change of the feature
  }
  for (const [f, c] of Object.entries(last)) {
    if (!vs.some(v => v.scope?.includes(f) && isAncestor(root, c, v.sha) && (v !== full))) {
      missing.push(c === full.sha ? `${f}: blocking in the full /verify-phase round ${full.sha.slice(0, 7)} (${full.file}) — no point VERDICT: PASS that names ${f} after it`
        : `${f}: changed after the full /verify-phase round ${full.sha.slice(0, 7)} (commit ${c.slice(0, 7)}) — no point VERDICT: PASS that names ${f} at or after it`)
    }
  }
  const point = vs.filter(v => v !== full && v.scope && !isFull(v) && Object.keys(last).some(f => v.scope.includes(f)))
  return { missing, used: [full.file, ...point.map(v => v.file)].join(', ') }
}

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
  if ((input.background_tasks || []).length || (input.session_crons || []).length) {
    return { decision: 'pass', reason: `background: tasks ${(input.background_tasks || []).length}, crons ${(input.session_crons || []).length}` }
  }
  const start = sessionStart(input.transcript_path) ?? t0 - cfg.caps.hours * 3600e3

  const feats = features(spec)
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
    const atH = evHead.filter(mine).map(n => [n, lines(atHead(root, `docs/evidence/${n}`))])
    const onD = evDisk.filter(mine).map(n => [n, lines(read(path.join(evDir, n)))])
    const names = [...new Set([...evHead, ...evDisk].filter(mine))]
    const where = test => [atH.find(([, ls]) => ls.some(test))?.[0], onD.find(([, ls]) => ls.some(test))?.[0]]
    const [hit, disk] = where(l => [f.marker, `${f.id} ${f.marker}`].includes(l))
    if (!names.length) { missing.push(`${f.id}: no docs/evidence/${f.id}-*-result.txt${f.items.length ? ` — items ${f.items.join(', ')} without a probe line` : ''}`); continue }
    if (!hit) missing.push(disk ? `${f.id}: the line ${f.marker} is in docs/evidence/${disk} on disk only, not in HEAD` : `${f.id}: no line ${f.marker} in docs/evidence/${names.join(', docs/evidence/')}`)
    for (const id of f.items) {  // the probe line of an item: its id, a space and the raw output of its probe
      const [h, d] = where(l => l.startsWith(`${id} `) && l.length > id.length + 1)
      if (!h) missing.push(d ? `${id}: its probe line is in docs/evidence/${d} on disk only, not in HEAD` : `${id}: no probe line «${id} <raw output>» in docs/evidence/${names.join(', docs/evidence/')} at HEAD`)
    }
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
  const cov = sha ? coverage(root, sha, feats.map(f => f.id)) : { missing: ['no HEAD'] }
  missing.push(...cov.missing)

  const reasons = stopReasons(spec)
  const seen = [...base.matchAll(STOP_LINE)].map(m => stopMark(m[0]))
  for (const l of log) seen.push(...(l.stops || []))  // a stop is honored once, in any session
  const fresh = text => [...text.matchAll(STOP_LINE)].filter(m => !marked(m[0], seen))
  const atHeadStops = fresh(progress)
  for (const m of fresh(disk).filter(m => !atHeadStops.some(h => canon(h[0]) === canon(m[0])))) {
    missing.push(`«${canon(m[0]).slice(0, 60)}» is in docs/PROGRESS.md on disk only: a STOP counts from the pushed HEAD — commit and push it`)
  }
  const plines = progress.split('\n')
  const formed = m => { const i = plines.indexOf(m[0]); const near = plines.slice(i, i + 4).join('\n'); return i >= 0 && near.includes('?') && /resume|продолж/i.test(near) }
  for (const m of atHeadStops.filter(m => !reasons.includes(m[1]))) missing.push(`«STOP: ${m[1]}» is not a stop of SPEC §4 (${reasons.join(', ')})`)
  for (const m of atHeadStops.filter(m => reasons.includes(m[1]) && !formed(m))) missing.push(`«STOP: ${m[1]}» has no question (?) and resume line within the next three lines`)
  const valid = atHeadStops.filter(m => reasons.includes(m[1]) && formed(m))

  if (valid.length && pushed) return { decision: 'stop', reason: valid.map(m => m[1]).join(', '), stops: valid.map(m => stopMark(m[0])) }
  if (!missing.length) return { decision: 'ok', reason: `SPEC_GATE_OK: features ${feats.length}, items ${items}, pushed ${sha.slice(0, 7)}, ${cov.used}` }
  // the guards only turn a block into a pass: the set is evaluated first, so a full set or a new STOP is never lost to a cap
  const blocks = prior.filter(l => l.decision === 'block').length
  if (blocks >= cfg.caps.blocks) return { decision: 'pass', reason: `cap-blocks: ${blocks} blocks in this session`, missing }
  if (t0 - start > cfg.caps.hours * 3600e3) return { decision: 'pass', reason: `cap-time: the session is older than ${cfg.caps.hours} h`, missing }
  const last = prior.slice(-cfg.caps.same_list)
  const same = l => JSON.stringify(l || [])
  if (last.length === cfg.caps.same_list && last.every(l => l.decision === 'block' && same(l.missing) === same(missing))) {
    return { decision: 'pass', reason: `no-progress: the same list blocked ${cfg.caps.same_list} times in a row`, missing }
  }
  return { decision: 'block', reason: `${missing.length} missing`, missing }
}

function main() {
  let raw = ''
  try {
    raw = fs.readFileSync(0, 'utf8')
  } catch {}
  let input = {}
  try {
    input = JSON.parse(raw)
  } catch {}
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
    d = broken ? { decision: 'pass', reason: broken } : decide(input, root, cfg, log)
  } catch (e) {
    d = { decision: 'pass', reason: `error: ${e.name}: ${String(e.message).slice(0, 120)}` }
  }
  if (!d) return
  const line = { ts: new Date().toISOString(), session: input.session, mode, decision: d.decision, reason: d.reason, missing: d.missing || [], stops: d.stops || [],
    stop_hook_active: !!input.stop_hook_active, ms: Date.now() - t0 }
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.appendFileSync(logPath, JSON.stringify(line) + '\n')
  } catch {}
  if (d.decision === 'block' && mode === 'active') {
    const reason = `spec-gate: the phase is not done — the end of the turn is held. Missing:\n${d.missing.map(m => `- ${m}`).join('\n')}\nClose what is missing, or commit and push a new line \`STOP: <id>\` for a stop of SPEC §4 with the question and a resume line.`
    process.stdout.write(JSON.stringify({ decision: 'block', reason }) + '\n')
  } else if (d.decision === 'ok' || d.decision === 'stop' || (d.decision === 'pass' && !d.reason.startsWith('background'))) {
    const msg = d.decision === 'ok' ? d.reason : `spec-gate (${mode}): ${d.decision} — ${d.reason}`
    process.stdout.write(JSON.stringify({ systemMessage: msg }) + '\n')
  }
}

try {
  main()
} catch {}
process.exit(0)
