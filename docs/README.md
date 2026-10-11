# docs

- `SPEC-v3.3.md` · `PLAN-v3.3.md` · `PROGRESS.md` — the current phase, v3.3 «the judge on the claim»: the team lead's spec
  (features and their items `F<n>.<k>`), the executor's plan (a probe per item with both sides, order, risks, deviations), the
  executor's report.
- `SPEC-v3.2.md` · `PLAN-v3.2.md` · `archive/PROGRESS-v3.2.md` — the phase that built kit v3.2; its evidence is in `archive/evidence-v3.2/`.
- `SPEC-v3.1.md` · `PLAN-v3.1.md` · `archive/PROGRESS-v3.1.md` — the phase that built kit v3.1; its evidence is in `archive/evidence-v3.1/`.
- `SPEC-v3.md` · `PLAN-v3.md` · `archive/PROGRESS-v3.md` — the phase that built kit v3.
- `PROMPT.txt` — the start prompt of the current phase; `Read first:` names its SPEC, the launch line passes it as the argument after `--`.
- `OFFICIAL-SOURCES.md` — the only sources by which the harness, the kit and the skills may change.
- `LAUNCH.md` — the executor's launch line with the window guard, the commit judges, `spec-gate` and the paired control run (a link
  to `kit/docs/LAUNCH.md`).
- `dev-system.ru.md` — the whole system in the operator's language (v3.3).
- `evidence/` — `<F>-<check>-result.txt`, the output of every check of the current phase with a line `F<n>.<k> <raw output>` per
  item; `verify-<sha>.txt` — the verdict of the full acceptance round, `verify-<sha7>-F<n>.txt` — a point verdict after a fix;
  `phase-report.md` — the phase report built by `bin/phase-report`; the logs `commit-judge.jsonl` (the commit judges),
  `spec-gate.jsonl` (the Stop hook) and `jev.jsonl` (the spend of `bin/jev`). Earlier phases: `archive/evidence-v3.2/`,
  `archive/evidence-v3.1/`, `archive/evidence-v3/` (with the v3 `accept-*.txt`).
- `drafts/` — copies of the Cowork skills `team-lead` v6 and `team-lead-brief`, and the INTENT, SPEC and GOAL
  templates as the team lead wrote them (the GOAL template of the kit retired to `archive/GOAL.template-v3.1.txt` in v3.2).
- `STATUS.md` — the operator's map; the team lead writes it at acceptance.
- `SPEC-v2.md` · `two-tier-dev-v2-architecture.md` — the v2 phase, history.
- `archive/` — everything retired, moved and never deleted: v1, the v2 kit (`kit-v2/`, `.claude/` there is `claude-config/`),
  the v3.2 hooks of Abide and Toolgate and the Toolgate policy (`kit-v3.2/claude-config/`), `PROGRESS-v2.md`, `PLAN-v2.md`,
  `evidence-v2/`, `goal-v2.txt`, the `team-lead` cards, `PROGRESS-v3.md`, `PROGRESS-v3.1.md`, `PROGRESS-v3.2.md`, the gates of v3,
  v3.1 and v3.2.
