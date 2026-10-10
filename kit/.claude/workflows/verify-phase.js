export const meta = {
  name: 'verify-phase',
  description: 'Phase acceptance: per SPEC feature (all, or the F<n> ids in args) a fresh check run, each item by the checker own command, edge cases and a mutation; refuters, a judge and code return VERDICT PASS or NEEDS_WORK',
  whenToUse: 'Acceptance of a two-tier phase; started by bin/verify-phase [F<n> …] from a fresh clone (30 min limit, verdict to docs/evidence/verify-<sha>.txt, a point round to verify-<sha>-F<n>.txt)',
  phases: [
    { title: 'Scope', model: 'claude-sonnet-5-5' },
    { title: 'Verify', model: 'claude-sonnet-5-5' },
    { title: 'Refute', model: 'claude-sonnet-5-5' },
    { title: 'Judge', model: 'claude-opus-5-5' },
  ],
}

// two-tier-dev v3.3 (SPEC-v3.1 F4, SPEC-v3.3 F4.1–F4.3). The script touches no files and reads no clock: the launcher bin/verify-phase
// clones, runs the gate (log in $VERIFY_GATE_LOG), enforces the limit and writes the returned report.
// args — the F<n> ids of a point round (an array, or a string that carries them); absent — every feature (F4.1).
// Code blocks after the judge: a dead verifier, a red check, a surviving mutation (F4.2), an item without the checker own run (F4.3).
const CHECKER = 'claude-sonnet-5-5'
const JUDGE = 'claude-opus-5-5'
const BLOCKING = 'blocking ONLY if: (a) the feature is not proven by its check — no evidence file docs/evidence/<F>-*-result.txt, no marker in it, or the fresh run is red; (b) an invariant of SPEC §3 is broken; (c) a bug on a path the customer runs — observed behaviour contradicts the done clause («готово») or an item of the feature; (d) a security hole — a secret in code or evidence, an irreversible step without a gate, widened permissions; (e) a mutation of the product survived its check; (f) an item is not confirmed by the checker own command and its raw output. Everything else is non_blocking: taste, style, improvements outside the SPEC.'
const str = { type: 'string' }
const FINDING = {
  type: 'object', required: ['severity', 'symptom', 'evidence', 'criterion', 'repro'],
  properties: { severity: { type: 'string', enum: ['blocking', 'non_blocking'] }, symptom: str, evidence: str, criterion: str, repro: str },
}
const ids = (Array.isArray(args) ? args.join(' ') : typeof args === 'string' ? args : '').match(/\bF\d+\b/g)
const ASKED = ids ? [...new Set(ids)] : null

phase('Scope')
const scope = await agent(
  'Scope reader of a phase acceptance. Read the start prompt docs/PROMPT.txt (if it is absent, the older docs/GOAL.txt): the first file of its `Read first:` line is the phase SPEC. In that SPEC, section §2 lists the features as lines that start with `- **F<n>`; the items of a feature are the indented sub-lines under its line that start with a dash and a backticked id F<n>.<k>. Return sha — the output of `git rev-parse --short HEAD`; spec — the SPEC path; gate_log — the output of `printenv VERIFY_GATE_LOG` (empty if unset); features — one entry per feature line: id (`F<n>`), line (the whole line, verbatim) and items — one entry per item sub-line: id (`F<n>.<k>`) and text (the rest of the sub-line after the id, verbatim); a feature without item sub-lines has items []. Read only; change nothing.',
  { label: 'scope', model: CHECKER, effort: 'low', schema: {
    type: 'object', required: ['sha', 'spec', 'gate_log', 'features'],
    properties: { sha: str, spec: str, gate_log: str,
      features: { type: 'array', minItems: 1, items: { type: 'object', required: ['id', 'line', 'items'], properties: { id: str, line: str,
        items: { type: 'array', items: { type: 'object', required: ['id', 'text'], properties: { id: str, text: str } } } } } } },
  } },
)
const feats = ASKED ? scope.features.filter(f => ASKED.includes(f.id)) : scope.features
const absent = ASKED ? ASKED.filter(id => !scope.features.some(f => f.id === id)) : []
log(`${scope.spec} @ ${scope.sha}: features ${feats.length} of ${scope.features.length}${ASKED ? ` (args ${ASKED.join(', ')})` : ''}, gate log ${scope.gate_log ? 'present' : 'absent'}`)

const verifyPrompt = f => `Acceptance of feature ${f.id} of ${scope.spec} at HEAD ${scope.sha}. You work in your own git worktree, a copy of HEAD: edit files only there (scratch files too, or under \`mktemp -d\`), never commit, never push; the gate log and its directory are read-only. The feature line, verbatim:
${f.line}

Do four things and record commands with their observed output.
1. Fresh check run. ${scope.gate_log ? `The launcher ran the phase gate in a fresh clone; its full log is the file ${scope.gate_log} — read the lines for ${f.id} and its marker.` : 'There is no gate log.'} If the log has no line for ${f.id}, or the feature's own check is quick (under two minutes), run the check command of the feature line yourself. Open the feature's evidence file docs/evidence/${f.id}-*-result.txt and confirm the marker is in it.
2. Items. ${f.items.length ? `The items of ${f.id}, verbatim:
${f.items.map(i => `- ${i.id} ${i.text}`).join('\n')}
For each item write and run your own command that exercises the product in your worktree and observes the result the item states — not the feature check, not a read of docs/evidence/ or of the gate log: an evidence line or an item line printed by a check is a claim, not a confirmation. Return items, one entry per item: id, command, rc, raw_output — its stdout and stderr verbatim, at most 600 characters — and holds: true only if that raw output shows the result the item states.` : 'The feature has no items: return items [].'}
3. Edge cases against the done clause («готово») and the items. Read the product code they describe and try inputs and states the check does not cover: boundaries, empty input, whitespace, unusual characters, error paths. Run them. Any gap between the done clause and the observed behaviour is a finding.
4. Mutation. Make one small plausible defect in the product code the done clause covers (not in the check) that changes behaviour the done clause or an item names — a no-op or an equivalent change is not a mutation — run the cheapest check that should catch it, record whether it went red, then restore the file with git checkout. If the check stayed green, run the product to confirm its behaviour really changed; if it did not, the change was equivalent — make another one: outcome green only when the behaviour changed and the check missed it. If only a check longer than five minutes covers it, skip the mutation and say so.

Classify each finding: ${BLOCKING} Every finding needs a reproducible command and its observed output.`

const refutePrompt = (f, x) => `Try to refute a blocking finding of the acceptance of ${f.id} (${scope.spec} @ ${scope.sha}). You work in your own git worktree, a copy of HEAD: never commit, never push. The feature line: ${f.line}
The finding: ${JSON.stringify(x)}
Reproduce it with its repro command. refuted is true if it does not reproduce, if the observed behaviour does not contradict the cited criterion, or if it lies outside the done clause and SPEC §3. refuted is false only when you reproduced it and it contradicts the criterion. ${BLOCKING}`

const results = await pipeline(
  feats,
  f => agent(verifyPrompt(f), { label: `verify:${f.id}`, phase: 'Verify', model: CHECKER, effort: 'high', isolation: 'worktree', schema: {
    type: 'object', required: ['check', 'items', 'mutation', 'findings'],
    properties: {
      check: { type: 'object', required: ['command', 'rc', 'marker_seen', 'source'], properties: { command: str, rc: { type: 'integer' }, marker_seen: { type: 'boolean' }, source: { type: 'string', enum: ['gate_log', 'own_run'] } } },
      items: { type: 'array', items: { type: 'object', required: ['id', 'command', 'rc', 'raw_output', 'holds'], properties: { id: str, command: str, rc: { type: 'integer' }, raw_output: str, holds: { type: 'boolean' } } } },
      mutation: { type: 'object', required: ['file', 'change', 'check_command', 'outcome'], properties: { file: str, change: str, check_command: str, outcome: { type: 'string', enum: ['red', 'green', 'skipped'] } } },
      findings: { type: 'array', items: FINDING },
    },
  } }),
  async (r, f) => {
    if (!r) return { f, r: null, refuted: [] }
    const cands = r.findings.filter(x => x.severity === 'blocking')
    const votes = await parallel(cands.map((x, i) => () => agent(refutePrompt(f, x), { label: `refute:${f.id}:${i + 1}`, phase: 'Refute', model: CHECKER, effort: 'high', isolation: 'worktree', schema: {
      type: 'object', required: ['refuted', 'reason', 'observed'], properties: { refuted: { type: 'boolean' }, reason: str, observed: str },
    } })))
    // ponytail: one refuter per candidate; a dead refuter keeps the finding blocking — silence never turns into PASS
    const refuted = cands.flatMap((x, i) => votes[i] && votes[i].refuted ? [{ ...x, refuted_because: votes[i].reason }] : [])
    return { f, r, refuted }
  },
)

// why an item is not confirmed by the checker own run of its own command; '' — confirmed (F4.3)
const clip = s => s.trim().replace(/\s*\n\s*/g, ' ⏎ ').slice(0, 120)
const unconfirmed = (r, i) => {
  const x = r.items.find(y => y.id === i.id)
  if (!x) return 'пункта нет в ответе проверяющего'
  if (!x.command.trim() || !x.raw_output.trim()) return 'нет своей команды или её сырого вывода'
  if (/docs\/evidence\/|gate\.log|VERIFY_GATE_LOG/.test(x.command)) return `команда читает evidence или лог гейта: \`${clip(x.command)}\``
  if (x.command.trim() === r.check.command.trim()) return `команда — чек фичи, а не своя: \`${clip(x.command)}\``
  return x.holds ? '' : `свой прогон не подтвердил: \`${clip(x.command)}\` rc ${x.rc} → «${clip(x.raw_output)}»`
}
const coded = [
  ...absent.map(id => `- **${id}: нет в ${scope.spec}** · args ${JSON.stringify(args)}`),
  ...results.flatMap(({ f, r }) => r === null ? [`- **${f.id}: проверяющий не вернул результат** · фича не проверена`] : [
    ...(r.check.rc !== 0 || !r.check.marker_seen ? [`- **${f.id}: свежий чек красный или без маркера** · \`${r.check.command}\` rc ${r.check.rc}, маркер ${r.check.marker_seen ? 'есть' : 'нет'} (${r.check.source})`] : []),
    ...(r.mutation.outcome === 'green' ? [`- **${f.id}: мутация выжила — ${r.mutation.file}: ${r.mutation.change}** · чек \`${r.mutation.check_command}\` остался зелёным`] : []),
    ...f.items.flatMap(i => { const why = unconfirmed(r, i); return why ? [`- **${i.id}: не подтверждён своим прогоном** — ${i.text} · ${why}`] : [] }),
  ]),
]

phase('Judge')
const dossier = results.map(({ f, r, refuted }) => r === null
  ? { feature: f.id, line: f.line, verifier: 'FAILED — the verifier agent returned nothing; the feature is not verified' }
  : { feature: f.id, line: f.line, check: r.check, items: r.items, mutation: r.mutation,
      blocking_candidates: r.findings.filter(x => x.severity === 'blocking' && !refuted.some(y => y.symptom === x.symptom)),
      refuted, non_blocking: r.findings.filter(x => x.severity === 'non_blocking') })
const verdict = await agent(
  `Judge of the acceptance of ${scope.spec} at HEAD ${scope.sha}. Below, per feature: the fresh check run, the items as the checker ran them, the mutation, blocking candidates that survived a refuter, refuted findings and non-blocking findings. Code blocks on its own, after you: a feature whose verifier failed, a red or markerless check, a surviving mutation and an item not confirmed by the checker own command and its raw output — leave those out of your blocking. Decide the other blocking findings: ${BLOCKING} Keep at most five, one cause — one finding, merge duplicates. A refuted finding stays out of blocking. Everything else goes to named_not_built, one line each. Write in the language of the SPEC. Summary — two sentences: what convinced you.
${JSON.stringify(dossier, null, 1)}`,
  { label: 'judge', phase: 'Judge', model: JUDGE, effort: 'high', schema: {
    type: 'object', required: ['blocking', 'named_not_built', 'summary'],
    properties: {
      blocking: { type: 'array', maxItems: 5, items: { type: 'object', required: ['feature', 'symptom', 'evidence', 'criterion', 'check'], properties: { feature: str, symptom: str, evidence: str, criterion: str, check: str } } },
      named_not_built: { type: 'array', items: str }, summary: str,
    },
  } },
)

const ok = verdict.blocking.length === 0 && coded.length === 0
const lines = [
  `VERDICT: ${ok ? 'PASS' : 'NEEDS_WORK'}`,
  `FEATURES: ${feats.map(f => f.id).join(', ') || 'нет'}`,
  `/verify-phase · ${scope.spec} · HEAD ${scope.sha} · проверяющие ${CHECKER} (фич ${feats.length} из ${scope.features.length}, опровергателей ${results.reduce((n, x) => n + (x.r ? x.r.findings.filter(y => y.severity === 'blocking').length : 0), 0)}) · судья ${JUDGE}`,
  '', verdict.summary, '', '## Блокирующие',
  ...(ok ? ['Нет.'] : [...coded, ...verdict.blocking.map(b => `- **${b.feature}: ${b.symptom}** · доказательство: ${b.evidence} · критерий: ${b.criterion} · чек приёмки: ${b.check}`)]),
  '', '## Named, not built',
  ...(verdict.named_not_built.length ? verdict.named_not_built.map(x => `- ${x}`) : ['- нет']),
  '', '## По фичам',
  ...results.map(({ f, r, refuted }) => r === null ? `- ${f.id}: проверяющий не вернул результат`
    : `- ${f.id}: чек \`${r.check.command}\` rc ${r.check.rc}, маркер ${r.check.marker_seen ? 'есть' : 'нет'} (${r.check.source}); пунктов своим прогоном ${f.items.filter(i => !unconfirmed(r, i)).length}/${f.items.length}; мутация ${r.mutation.file}: ${r.mutation.change} → ${r.mutation.outcome}; находок ${r.findings.length}, блокирующих-кандидатов ${r.findings.filter(x => x.severity === 'blocking').length}, опровергнуто ${refuted.length}`),
]
return { verdict: ok ? 'PASS' : 'NEEDS_WORK', sha: scope.sha, features: feats.map(f => f.id), report: lines.join('\n') + '\n' }
