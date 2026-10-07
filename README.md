# two-tier-dev — a development cycle for one operator and two AI tiers (kit v3.1)

**Operator · Team lead (Cowork, skills `team-lead` v6, `team-lead-brief`, `grilling`) · Executor (Claude Code,
`claude-opus-5-5`, auto mode, ultracode) · `/verify-phase` (a saved workflow that renders the acceptance verdict).** The operator decides three
times per phase: the spec yes or no · one letter at a stop · the gate, where they run the product themselves. The
team lead sets the result, the check, the limits and the stops; the executor builds the path. Everything passes
through files in the repository, and every handoff is written for a fresh session.

v3 (06.10.2026) answers v2 growing back: the `team-lead` skill grew ×7, an executor had to read about 0.6 M
characters before starting, acceptance took longer than the leg it accepted. v3 is **budgets enforced by code**,
**the result instead of the path**, **a harness built from the official docs**, and **a living intent pinned in
the SPEC**. v3.1 (07.10.2026) makes **ultracode the executor's standard mode**: Claude plans a workflow of agents for
every substantive task; the executor's environment equals the Environment table of `docs/PROCESS.md` and is proven from
`system/init`; the hooks hold on workflow agents too; the acceptance verdict is the saved workflow `/verify-phase`, run
from a fresh clone in at most 30 minutes. Why: [`intent/INTENT.md`](intent/INTENT.md). The phase that built v3.1: [`docs/SPEC-v3.1.md`](docs/SPEC-v3.1.md),
[`docs/PLAN-v3.1.md`](docs/PLAN-v3.1.md), [`docs/PROGRESS.md`](docs/PROGRESS.md); v3: [`docs/SPEC-v3.md`](docs/SPEC-v3.md), [`docs/PLAN-v3.md`](docs/PLAN-v3.md). History: [`CHANGELOG.md`](CHANGELOG.md).
The whole system in the operator's language: [`docs/dev-system.ru.md`](docs/dev-system.ru.md).

## The loop

```
INTENT   intent/INTENT.md — one living file: problem · result · success signals S1… · limits · non-goals · decisions · change log
SPEC     docs/SPEC-<n>.md pins the intent (intent/INTENT.md @ <first 12 chars of git hash-object>); a feature line ≤600 chars names its signal
GOAL     docs/GOAL.txt — ≤4000 chars; Read first: ≤3 files, ≤50k chars together with CLAUDE.md; one end state, the gate command, constraints, a turn limit
PLAN     step 0 inside the /goal (or /plan-phase first, for phases with paid or irreversible steps): files · order · risks · proof · deviations; ≤150 lines
WORK     one commit per feature; each check → docs/evidence/<F>-<check>-result.txt; the head of docs/PROGRESS.md (≤60 lines) is the report
STOP     four reasons only: paid or irreversible above the threshold · a real scope change · input only the operator has · no progress
ACCEPT   CI on push (check-budget + make ci) · /verify-phase from a fresh clone (bin/verify-phase, ≤30 min), verdict in docs/evidence/verify-<sha>.txt · a review has ≤5 blocking findings
GATE     the operator runs the product and judges it by the success signals of the intent
```

## The mechanics — every rule has a command

| command | what it proves | marker |
|---|---|---|
| `bin/check-budget` | the budgets: skills, CLAUDE.md, intent, SPEC lines, pin, open-question markers, PROGRESS, PLAN, GOAL, reviews, ownership of team-lead files | `BUDGET_OK` |
| `bin/check-budget --self-test [group…]` | a green and a red fixture for every rule | `SELFTEST_OK` |
| `bin/check-budget --templates` | every template, instantiated as an example, passes the budgets | `BUDGET_OK` |
| `bin/check-ci <branch>` | the `two-tier` workflow run of HEAD is green; a run of an older commit does not count | `CI_OK` |
| `bin/check-harness` | settings and control runs with the PROCESS launch line (`--effort ultracode`): the steer note lands, `AGENT_STOP` stops at the first call, the allow rules hold, `claude doctor` clean · `system/init` equals the Environment table · deny, sweeping-command refusal, kill switch and steer note on the main session and on a workflow agent | `HARNESS_OK` · `ENV_OK` · `HOOKS_OK` |
| `bin/verify-phase` | the saved workflow `/verify-phase` from a fresh clone of the pushed HEAD: per feature a fresh check run, edge cases against «done», a mutation; refuters; a judge | `VERDICT: PASS` |
| `bin/check-verify` | `/verify-phase` finds a planted edge defect, stays silent on a clean fixture, and a run past its limit ends in `VERIFY_TIMEOUT` | `VERIFY_OK` |
| `bin/check-kit` | the kit's skills `plan-phase` and `accept` (verdict by `/verify-phase`), the workflow and its launcher, an evaluator without Write and Edit | `KIT_OK` |
| `bin/two-tier-upgrade <path>` | a live project moves to v3 on branch `kit-v3` without losing history; `--self-test` on a fixture | `UPGRADE_OK` |
| `bin/check-docs` | links in these documents are alive; CHANGELOG covers every harness field | `DOCS_OK` |
| `bin/gate-v3` | the kit on an empty repo: F1, F2, F4–F7 rerun from there, F3 and F8 from the branch root | `GATE_OK` |

The numbers live in [`kit/budgets.json`](kit/budgets.json): kit defaults plus a `project` block that may only
tighten them. The team-lead files are listed there too (`owner`); they are guarded by `Edit` deny rules and by
the ownership lint: a commit that changes one of them must start with «Тимлид:».

## Layout

| path | what |
|---|---|
| `bin/two-tier-init <dir>` | installs the kit: `kit/**` lands in the root of the target, an existing file is never overwritten |
| `kit/CLAUDE.md` | 17 lines the executor reads every session: project facts, its two files, checks, budgets, stops, workflow agents and `main` |
| `kit/REVIEW.md` | the review template: findings, at most five blocking, `Named, not built` |
| `kit/budgets.json` · `kit/bin/` | the budgets and the tools a project runs itself (`check-budget`, `check-ci`, `check-harness`, `check-kit`, `two-tier-upgrade`) |
| `kit/docs/*.template.*` · `kit/docs/LAUNCH.md` | INTENT, SPEC, GOAL (verbatim from `docs/drafts/`), PLAN, PROGRESS, STATUS, PROCESS; the launch line and the control run |
| `kit/.claude/settings.json` | `model: claude-opus-5-5`, `autoMemoryEnabled: false`, `disableClaudeAiConnectors: true`, `worktree.baseRef: head`, `workflowSizeGuideline: medium`, narrow allow on `bin/check-*`, `bin/gate-*`, `make ci`, deny `Edit` on team-lead files, the hooks |
| `kit/.claude/launch.settings.json` | `enabledPlugins` and `skillOverrides` by the Environment table, the `autoMode.environment` template (`"$defaults"` + project placeholders), passed with `--settings` |
| `kit/.claude/workflows/verify-phase.js` | the saved workflow `/verify-phase`; its copy in `.claude/workflows/` lets this repository accept its own phases |
| `kit/.claude/hooks/` | `kill-switch.sh` (`continue: false`), `steer.sh` (a factual note, to the main session only), `refuse_sweeping_commands.py` |
| `kit/.claude/skills/` · `kit/.claude/agents/evaluator.md` | `plan-phase`, `accept`; the evaluator |
| `.github/workflows/two-tier.yml` | CI of this repository; the same file ships in `kit/.github/` |
| `docs/archive/` | everything retired, moved and never deleted: v1, the v2 kit (`kit-v2/`), v2 PROGRESS, PLAN and evidence |

## Quick start

```sh
mkdir my-project && cd my-project && git init
<two-tier-dev>/bin/two-tier-init .   # the kit lands in the root
bin/check-budget                     # BUDGET_OK
```

Then the team lead writes `intent/INTENT.md`, `docs/SPEC-1.md`, `docs/GOAL.txt` and `.claude/launch.settings.json`
from the templates, in commits that start with «Тимлид:». The operator launches the executor with the line in
[`docs/LAUNCH.md`](docs/LAUNCH.md) — the launch line itself is in `docs/PROCESS.md`. A live v2 project: `<two-tier-dev>/bin/two-tier-upgrade <path>` → branch
`kit-v3` and the report `docs/upgrade-v3.md` with what remains for the team lead, the executor and the operator.

This repository is not a kit install itself (there is no `.claude/` in its root), so its own executor starts with
`ENABLE_CLAUDEAI_MCP_SERVERS=false` and `--add-dir /tmp/two-tier-v3` (`claude/handoff-2026-10-06-v3-transition.md`).

## Status

v3 is accepted and merged (PR #1). v3.1 is built on branch `v3.1` and waits for acceptance; `main` is v3 until the operator merges.
