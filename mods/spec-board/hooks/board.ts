// The board from the files spec-gate judges (kit/.claude/hooks/spec-gate.mjs): the SPEC of the start prompt's `Read first:`, its feature
// lines with the check marker and the items under each, the evidence files docs/evidence/F<n>-*-result.txt whose first line is
// `spec: <SPEC name>` (a file of another SPEC does not count), docs/evidence/spec-gate.jsonl, docs/evidence/verify-*.txt and
// docs/PROGRESS.md. The probe line of an item is the gate's own: its id, a space and the raw output. The board adds the colour the gate
// does not judge: a line that says FAIL, BAD or offen is red. Text in, text out: no model, no network, no clock.

import type { Board, FeatureRow, Mark } from '../types'

export const EMPTY: Board = { spec: '', features: [], counts: [0, 0, 0], gate: '—', verdict: '—', stop: '—' }

export type Files = {
  prompt: string | undefined
  spec: string | undefined
  evidence: ReadonlyArray<{ name: string; text: string; mtimeMs: number }>
  gateLog: string | undefined
  progress: string | undefined
}

export function specPathOf(prompt: string): string | undefined {
  const rf = (prompt.match(/^Read first:(.*)$/m) || [])[1] || ''
  return rf.split(',').map(s => s.trim()).find(s => /(^|\/)SPEC-[^/]+\.md$/.test(s))
}

const baseName = (p: string) => p.slice(p.lastIndexOf('/') + 1)

export function featuresOf(spec: string): Array<{ id: string; marker: string | null; items: string[] }> {
  const out: Array<{ id: string; marker: string | null; items: string[] }> = []
  let open = false
  for (const l of spec.split('\n')) {
    const id = (l.match(/^- \*\*(F\d+)\b/) || [])[1]
    if (id) {
      const range = ((l.match(/готово:\s*(.*?)\s*·\s*чек:/) || [])[1] || '').match(/^(F\d+)\.(\d+)\s*[–-]\s*\1\.(\d+)$/)
      const declared = range ? Array.from({ length: Math.max(0, Number(range[3]) - Number(range[2]) + 1) }, (_, i) => `${range[1]}.${Number(range[2]) + i}`) : []
      out.push({ id, marker: (l.match(/чек:\s*`[^`]*`\s*→\s*`([A-Z0-9_]+)`/) || [])[1] || null, items: declared.filter(d => d.startsWith(`${id}.`)) })
      open = true
      continue
    }
    if (open && !l.trim()) continue
    const item = open ? (l.match(/^\s+- `(F\d+\.\d+)`/) || [])[1] : undefined
    const last = out[out.length - 1]
    if (item && last && item.startsWith(`${last.id}.`)) {
      if (!last.items.includes(item)) last.items.push(item)
    } else open = false
  }
  return out
}

export function markOf(id: string, files: ReadonlyArray<readonly string[]>): { mark: Mark; line: string } {
  for (const lines of files) {
    const line = lines.find(l => l.startsWith(`${id} `) && l.length > id.length + 1)
    if (line) return { mark: /^\S+ (?:FAIL|BAD|offen)\b/.test(line) ? 'red' : 'green', line }
  }
  return { mark: 'none', line: '' }
}

function gateOf(log: string | undefined): string {
  const last = (log || '').split('\n').map(l => l.trim()).filter(Boolean).pop()
  if (!last) return 'нет решений'
  try {
    const r = JSON.parse(last)
    return [r.decision, r.reason].filter(x => typeof x === 'string' && x).join(' ').slice(0, 60) || 'нет решений'
  } catch {
    return 'журнал не JSON'
  }
}

function verdictOf(files: Files['evidence'], specPath: string): string {
  const own = files
    .filter(f => /^verify-[0-9a-f]{7,40}(?:-[\w.-]+)?\.txt$/.test(f.name))
    .filter(f => baseName((f.text.match(/^\/verify-phase · (\S+) · /m) || [])[1] || '') === baseName(specPath))
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0]
  if (!own) return 'вердикта нет'
  const verdict = (own.text.match(/^VERDICT: (\S+)/m) || [])[1] || '?'
  const scope = (own.text.match(/^FEATURES:\s*(.+)$/m) || [])[1]
  return `${verdict}${scope ? ` ${scope.replace(/\s+/g, '')}` : ''}`
}

function stopOf(progress: string | undefined): string {
  const line = (progress || '').split('\n').find(l => /^[ \t]*(?:[-*][ \t]*)?STOP:[ \t]*STOP-[A-Z]+\b/.test(l))
  if (!line) return 'стопа нет'
  return (line.slice(line.indexOf('STOP:') + 5).trim().split(' — ')[0] ?? '').slice(0, 60)
}

export function boardOf(files: Files): Board {
  const specPath = files.prompt ? specPathOf(files.prompt) : undefined
  if (!specPath || files.spec === undefined) return { ...EMPTY, gate: gateOf(files.gateLog), stop: stopOf(files.progress) }
  const specName = baseName(specPath).replace(/\.md$/, '')
  const features: FeatureRow[] = featuresOf(files.spec).map(f => {
    const own = files.evidence
      .filter(e => e.name.startsWith(`${f.id}-`) && e.name.endsWith('-result.txt'))
      .map(e => e.text.split('\n').map(l => l.trim()))
      .filter(ls => ls[0] === `spec: ${specName}`)
    return {
      id: f.id,
      marker: f.marker,
      hasMarker: !!f.marker && own.some(ls => ls.includes(f.marker as string) || ls.includes(`${f.id} ${f.marker}`)),
      items: f.items.map(id => ({ id, ...markOf(id, own) })),
    }
  })
  const marks = features.flatMap(f => f.items.map(i => i.mark))
  const count = (m: Mark) => marks.filter(x => x === m).length
  return {
    spec: specPath,
    features,
    counts: [count('green'), count('red'), count('none')],
    gate: gateOf(files.gateLog),
    verdict: verdictOf(files.evidence, specPath),
    stop: stopOf(files.progress),
  }
}

export function statusOf(b: Board): string {
  if (!b.spec) return `board: нет фазы (docs/PROMPT.txt без SPEC в Read first) · gate ${b.gate} · ${b.stop}`
  const markers = b.features.filter(f => f.hasMarker).length
  return `board ${b.counts.join('/')} · маркеров ${markers}/${b.features.length} · gate ${b.gate} · ${b.verdict} · ${b.stop}`
}
