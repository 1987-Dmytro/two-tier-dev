#!/usr/bin/env node
// spec-gate — the kit's Stop hook (SPEC-v3.2 F2): the end of a turn is held by evidence files, not by words.
//
// Code, $0: per feature line of the phase SPEC (`- **F<n>` … `чек: `cmd` → `MARKER``) a file docs/evidence/F<n>-*-result.txt
// with the marker on a line of its own; the branch pushed (HEAD = origin/<branch>); the head of docs/PROGRESS.md (its «## Голова»
// section) differs from the one committed before this session; VERDICT: PASS of /verify-phase for HEAD (docs/evidence/verify-<sha>.txt,
// after it only evidence and PROGRESS). The set is judged as pushed: the start prompt, the phase SPEC it names, docs/PROGRESS.md,
// the evidence files of the SPEC's features and the verdict files are read from HEAD, and any of them that `git status` shows as
// changed, untracked or deleted (eol conversion and filters as git applies them) holds the turn by its name. The logs that checks
// and this hook append (docs/evidence/jev.jsonl, spec-gate.jsonl) are not part of the set; STOP lines count on disk, before a commit. A STOP line ends a turn once: it is new when its text from «STOP:» on starts neither like
// a STOP line of the PROGRESS committed before the session nor like a stop already honored (the log keeps their marks): its first
// 60 characters, or all of a shorter line — an edited tail, «— снят» at the end or a bullet in front keep a line old.
// The full set → SPEC_GATE_OK and the turn ends; a new line `STOP: <id>` with a reason of SPEC §4 → the turn ends; otherwise
// the end of the turn is blocked and the reason is the list of what is missing, built by code.
// Jev — only on the fuzzy part, one call of bin/jev: does the new STOP line carry a question and a resume line; does the
// PROGRESS head say what is done, the operator's next step and when; does a feature's evidence contradict its done clause.
// Jev error or timeout → code decides alone.
// Guards: a cap of blocks and of hours per session and the same list blocked `same_list` times in a row turn a block into a pass
// (`cap-…`, `no-progress`), never an OK; AGENT_STOP is stronger than the hook; background tasks or session crons → pass (the
// session waits to be woken up); an unreadable .claude/spec-gate.json → pass with the reason.
// Modes off · shadow · active: SPEC_GATE from the environment, else `mode` of .claude/spec-gate.json (questions and thresholds
// — the team lead's file). `claude -p` of acceptance and of the control pairs runs with SPEC_GATE=off. Every decision is a
// line of docs/evidence/spec-gate.jsonl. The hook never prints a permission decision; on its own error it exits 0.
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const DEFAULTS = { mode: 'active', caps: { blocks: 12, hours: 3, same_list: 3 }, jev: { timeout_ms: 10000, threshold: 0.75 }, questions: {} }
const STOP_IDS = ['STOP-PAY', 'STOP-SCOPE', 'STOP-INPUT', 'STOP-NP']
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
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
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

function features(spec) {
  return spec.split('\n').filter(l => /^- \*\*F\d+\b/.test(l)).map(l => ({
    id: l.match(/^- \*\*(F\d+)/)[1],
    marker: (l.match(/чек:\s*`[^`]*`\s*→\s*`([A-Z0-9_]+)`/) || [])[1] || null,
    done: ((l.match(/готово:\s*(.*?)\s*·\s*чек:/) || [])[1] || '').slice(0, 1500),
  }))
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
const marked = (line, marks) => marks.some(k => { const [n, h] = k.includes(':') ? k.split(':') : [60, k]; return sha12(canon(line).slice(0, Number(n))) === h })

function head(progress) {
  const m = progress.match(/\n## (?:Голова|Head)[^\n]*\n[\s\S]*?(?=\n## |$)/)
  return (m ? m[0] : progress.split('\n').slice(0, 20).join('\n')).trim().slice(0, 4000)
}

function verdict(root, sha) {  // a verdict file committed at HEAD
  const allowed = p => p.startsWith('docs/evidence/') || p === 'docs/PROGRESS.md'
  for (const f of headNames(root, 'docs/evidence')) {
    const m = f.match(/^verify-([0-9a-f]{7,40})\.txt$/)
    if (!m || (atHead(root, `docs/evidence/${f}`) || '').split('\n')[0].trim() !== 'VERDICT: PASS') continue
    const full = git(root, 'rev-parse', '--verify', '-q', `${m[1]}^{commit}`)
    if (!full || (full !== sha && git(root, 'merge-base', '--is-ancestor', full, sha) === null)) continue
    const after = (git(root, 'diff', '--name-only', '-z', '--no-renames', full, sha) || '').split('\0').filter(Boolean)  // a move into evidence names its source too
    if (after.every(allowed)) return f
  }
  return null
}

function askJev(root, cfg, state, wanted) {
  const qs = {}
  for (const [k, n] of Object.entries(wanted)) {
    const q = cfg.questions[k]
    if (!q) continue
    if (n === null) qs[k] = q
    else for (let i = 0; i < n; i++) qs[`${k}:${i}`] = JSON.parse(JSON.stringify(q).replaceAll('{i}', String(i)))
  }
  if (!Object.keys(qs).length) return { error: 'no questions in .claude/spec-gate.json' }
  const t = Date.now()
  let dir
  try {
    fs.mkdirSync('/tmp/two-tier-v3', { recursive: true })
    dir = fs.mkdtempSync('/tmp/two-tier-v3/spec-gate-')
    fs.writeFileSync(path.join(dir, 'q.json'), JSON.stringify(qs))
    const r = spawnSync(path.join(root, 'bin', 'jev'), [path.join(dir, 'q.json')], {
      input: JSON.stringify(state), encoding: 'utf8', timeout: cfg.jev.timeout_ms + 3000, cwd: root,
      env: { ...process.env, JEV_CALLER: 'spec-gate', JEV_TIMEOUT_MS: String(cfg.jev.timeout_ms) },
    })
    if (r.status !== 0) return { error: `bin/jev rc ${r.status ?? r.signal ?? r.error?.code}: ${(r.stderr || '').trim().split('\n')[0].slice(0, 160)}`, ms: Date.now() - t }
    const out = JSON.parse(r.stdout)
    const p = {}
    for (const [k, a] of Object.entries(out.answers || {})) p[k] = a.noul
    return { p, model: out.model, tokens: out.usage?.input_tokens, ms: Date.now() - t }
  } catch (e) {
    return { error: e.name, ms: Date.now() - t }
  } finally {
    if (dir) fs.rmSync(dir, { recursive: true, force: true })
  }
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
  const isEvidence = n => !n.includes('/') && (/^verify-[0-9a-f]{7,40}\.txt$/.test(n) || feats.some(f => n.startsWith(`${f.id}-`) && n.endsWith('-result.txt')))
  const loose = Object.entries(changed(root, [promptFile, specPath, 'docs/PROGRESS.md', 'docs/evidence']))
    .filter(([p]) => [promptFile, specPath, 'docs/PROGRESS.md'].includes(p) || (p.startsWith('docs/evidence/') && isEvidence(p.slice('docs/evidence/'.length))))
  for (const [p, why] of loose) missing.push(`${p} ${why} — the set is judged as pushed: commit and push it`)
  const evDir = path.join(root, 'docs', 'evidence')
  const evHead = headNames(root, 'docs/evidence')
  const evDisk = fs.existsSync(evDir) ? fs.readdirSync(evDir) : []
  for (const f of feats) {
    if (!f.marker) { missing.push(`${f.id}: the SPEC line names no check marker (\`чек: \`…\` → \`MARKER\`\`)`); continue }
    const mine = n => n.startsWith(`${f.id}-`) && n.endsWith('-result.txt')
    const has = text => (text || '').split('\n').some(l => [f.marker, `${f.id} ${f.marker}`].includes(l.trim()))
    const hit = evHead.filter(mine).find(n => has(atHead(root, `docs/evidence/${n}`)))
    const onDisk = !hit && evDisk.filter(mine).find(n => has(read(path.join(evDir, n))))
    const names = [...new Set([...evHead, ...evDisk].filter(mine))]
    if (hit) f.evidence = hit
    else if (onDisk) missing.push(`${f.id}: the line ${f.marker} is in docs/evidence/${onDisk} on disk only, not in HEAD`)
    else if (!names.length) missing.push(`${f.id}: no docs/evidence/${f.id}-*-result.txt`)
    else missing.push(`${f.id}: no line ${f.marker} in docs/evidence/${names.join(', docs/evidence/')}`)
  }
  if (!feats.length) missing.push(`${specPath}: no feature lines «- **F<n> …»`)
  const sha = git(root, 'rev-parse', 'HEAD')
  const branch = git(root, 'branch', '--show-current')
  const remote = branch && git(root, 'rev-parse', '-q', '--verify', `refs/remotes/origin/${branch}`)
  if (!sha || !branch || remote !== sha) missing.push(`branch ${branch || '(detached)'} is not pushed: HEAD ${(sha || '?').slice(0, 7)}, origin/${branch} ${(remote || 'none').slice(0, 7)}`)
  const disk = read(path.join(root, 'docs', 'PROGRESS.md')) || ''  // its STOP lines count before a commit
  const progress = atHead(root, 'docs/PROGRESS.md') || ''  // its head counts as pushed
  const baseSha = git(root, 'log', '-1', '--format=%H', `--before=${new Date(start).toISOString()}`)
  const base = (baseSha && git(root, 'show', `${baseSha}:docs/PROGRESS.md`)) || ''
  if (!loose.some(([p]) => p === 'docs/PROGRESS.md') && (!head(progress) || (base && head(progress) === head(base)))) missing.push('the head of docs/PROGRESS.md was not updated in this session')
  const pass = sha && verdict(root, sha)
  if (!pass) missing.push(`no VERDICT: PASS of /verify-phase for HEAD ${(sha || '?').slice(0, 7)} in HEAD (docs/evidence/verify-<sha>.txt; after it only evidence and PROGRESS change)`)

  const reasons = stopReasons(spec)
  const seen = [...base.matchAll(STOP_LINE)].map(m => stopMark(m[0]))
  for (const l of log) seen.push(...(l.stops || []))  // a stop is honored once, in any session
  const fresh = [...disk.matchAll(STOP_LINE)].filter(m => !marked(m[0], seen))
  const valid = fresh.filter(m => reasons.includes(m[1]))
  for (const m of fresh.filter(m => !reasons.includes(m[1]))) missing.push(`«STOP: ${m[1]}» is not a stop of SPEC §4 (${reasons.join(', ')})`)

  const complete = !missing.length
  let jev = null
  const problems = []
  if (valid.length || complete) {
    const lines = disk.split('\n')
    const state = {
      final_message: String(input.last_assistant_message || '').slice(0, 4000),
      progress_head: head(disk),
      stop_lines: valid.map(m => { const i = lines.indexOf(m[0]); return lines.slice(i, i + 4).join('\n') }).join('\n\n').slice(0, 2000),
      stop_reasons: reasons,
      features: complete ? feats.map(f => ({ id: f.id, done: f.done, marker: f.marker, evidence_file: `docs/evidence/${f.evidence}`,
        evidence_tail: (atHead(root, `docs/evidence/${f.evidence}`) || '').trimEnd().split('\n').slice(-40).join('\n').slice(-3000) })) : [],
    }
    const wanted = valid.length ? { stop_unfounded: null } : {}
    if (complete) Object.assign(wanted, { head_incomplete: null, evidence_contradicts: feats.length })
    jev = askJev(root, cfg, state, wanted)
    const thr = cfg.jev.threshold
    if (jev.p) {
      if (valid.length && jev.p.stop_unfounded >= thr) problems.push(`the new STOP line lacks a §4 reason, a question for the operator or a resume line (Jev ${jev.p.stop_unfounded.toFixed(2)})`)
      if (complete && !valid.length && jev.p.head_incomplete >= thr) problems.push(`the head of docs/PROGRESS.md does not say what is done, the operator's next step and when (Jev ${jev.p.head_incomplete.toFixed(2)})`)
      if (complete && !valid.length) feats.forEach((f, i) => jev.p[`evidence_contradicts:${i}`] >= thr && problems.push(`${f.id}: docs/evidence/${f.evidence} contradicts the done clause (Jev ${jev.p[`evidence_contradicts:${i}`].toFixed(2)})`))
    }
  }
  if (valid.length && !problems.length) return { decision: 'stop', reason: valid.map(m => m[1]).join(', '), stops: valid.map(m => stopMark(m[0])), jev }
  if (complete && !problems.length) return { decision: 'ok', reason: `SPEC_GATE_OK: features ${feats.length}, pushed ${sha.slice(0, 7)}, ${pass}`, jev }
  const list = valid.length ? problems : complete ? problems : missing
  // the guards only turn a block into a pass: the set is evaluated first, so a full set or a new STOP is never lost to a cap
  const blocks = prior.filter(l => l.decision === 'block').length
  if (blocks >= cfg.caps.blocks) return { decision: 'pass', reason: `cap-blocks: ${blocks} blocks in this session`, missing: list, jev }
  if (t0 - start > cfg.caps.hours * 3600e3) return { decision: 'pass', reason: `cap-time: the session is older than ${cfg.caps.hours} h`, missing: list, jev }
  const last = prior.slice(-cfg.caps.same_list)
  const same = l => JSON.stringify((l || []).map(s => s.replace(/ \(Jev [0-9.]+\)$/, '')))  // Jev's figure wobbles; the list is the same
  if (last.length === cfg.caps.same_list && last.every(l => l.decision === 'block' && same(l.missing) === same(list))) {
    return { decision: 'pass', reason: `no-progress: the same list blocked ${cfg.caps.same_list} times in a row`, missing: list, jev }
  }
  return { decision: 'block', reason: `${list.length} missing`, missing: list, jev }
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
    cfg = { ...DEFAULTS, ...c, caps: { ...DEFAULTS.caps, ...c.caps }, jev: { ...DEFAULTS.jev, ...c.jev }, questions: c.questions || {} }
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
    stop_hook_active: !!input.stop_hook_active, jev: d.jev ? { model: d.jev.model, tokens: d.jev.tokens, ms: d.jev.ms, error: d.jev.error } : null, ms: Date.now() - t0 }
  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true })
    fs.appendFileSync(logPath, JSON.stringify(line) + '\n')
  } catch {}
  if (d.decision === 'block' && mode === 'active') {
    const reason = `spec-gate: the phase is not done — the end of the turn is held. Missing:\n${d.missing.map(m => `- ${m}`).join('\n')}\nClose what is missing, or write a new line \`STOP: <id>\` for a stop of SPEC §4 with the question and a resume line.`
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
