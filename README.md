# two-tier-dev — a development cycle for one operator and two AI tiers (kit v3.2)

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
from a fresh clone in at most 30 minutes. v3.2 (09.10.2026) drops `/goal`: **the spec drives the phase** — the launch line carries
the start prompt `docs/PROMPT.txt`, and the kit's Stop hook **`spec-gate`** holds the end of a turn until the evidence files show every
feature done, the branch pushed, the PROGRESS head written and `/verify-phase` PASS for HEAD — files, not words. **The Jev layer**
(TypeSafe's calibrated classifier) comes through the kit and the Environment table: Abide checks every edit against the rules of
`CLAUDE.md`, Toolgate denies dangerous calls and stays silent otherwise, Belay and Steer-or-Queue run in shadow, Compact Adviser
hints, the `handoff` mod moves a long session into a fresh context. Three judges, by the cost of a question: **code** where a file
answers, **Jev** where a bounded question about a document repeats on every turn or edit, **a fresh agent** (`/verify-phase`) where
the work must be reproduced. Why: [`intent/INTENT.md`](intent/INTENT.md). The phase that built v3.2: [`docs/SPEC-v3.2.md`](docs/SPEC-v3.2.md),
[`docs/PLAN-v3.2.md`](docs/PLAN-v3.2.md), [`docs/PROGRESS.md`](docs/PROGRESS.md); v3.1: [`docs/SPEC-v3.1.md`](docs/SPEC-v3.1.md), [`docs/PLAN-v3.1.md`](docs/PLAN-v3.1.md); v3: [`docs/SPEC-v3.md`](docs/SPEC-v3.md), [`docs/PLAN-v3.md`](docs/PLAN-v3.md). History: [`CHANGELOG.md`](CHANGELOG.md).
The whole system in the operator's language: [`docs/dev-system.ru.md`](docs/dev-system.ru.md).

## The loop

```
INTENT   intent/INTENT.md — one living file: problem · result · success signals S1… · limits · non-goals · decisions · change log
SPEC     docs/SPEC-<n>.md pins the intent (intent/INTENT.md @ <first 12 chars of git hash-object>); a feature line ≤600 chars names its signal
LAUNCH   the launch line of docs/PROCESS.md ends with the start prompt -- "$(cat docs/PROMPT.txt)" — ≤4000 chars; Read first: ≤3 files, ≤50k chars with CLAUDE.md; done = the phase gate and /verify-phase PASS; no /goal
PLAN     step 0 inside the launch (or /plan-phase first, for phases with paid or irreversible steps): files · order · risks · proof · deviations; ≤150 lines
WORK     one commit per feature; each check → docs/evidence/<F>-<check>-result.txt; the head of docs/PROGRESS.md (≤60 lines) is the report; Abide judges every edit
TURN END spec-gate: the full set of evidence files → SPEC_GATE_OK; otherwise the turn goes on with the list of what is missing (caps: 12 blocks, 3 h, no-progress)
STOP     a new line STOP: <id> — four reasons only: paid or irreversible above the threshold · a real scope change · input only the operator has · no progress
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
| `bin/check-harness` | settings and control runs with the PROCESS launch line (`--effort ultracode`, `--setting-sources project,local`): the steer note lands, `AGENT_STOP` stops at the first call, the allow rules hold, `claude doctor` clean · `system/init` equals the Environment table, plugin modes equal it, Belay's shadow in a live session, by-task probes (`qs status`, `jevseo doctor`, `bin/check-ui`) · deny, sweeping-command refusal, kill switch and steer note on the main session and on a workflow agent · `spec-gate` holds «done» without markers and lets the full set through · Abide's fix demand on an edit · Toolgate denies a force-push and stays silent otherwise | `HARNESS_OK` · `ENV_OK` · `HOOKS_OK` · `GATE_HOOK_OK` · `ABIDE_OK` · `TOOLGATE_OK` |
| `bin/jev --self-test` | typed questions to Jev in one command: every side of the contract on a fake server; with a key, one live call (HTTP 200, `jev-1.13.0`) | `JEV_OK` |
| `bin/check-spend` | Jev spend of the leg from the logs of the layer: calls, tokens, $ and €, no cap; a fixture with a known sum | `SPEND_OK` |
| `bin/check-ui [<flow.json>]` | a Jev Browser scenario as a check (template); without an argument — a probe on a local page | `UI_OK` |
| `bin/verify-phase` | the saved workflow `/verify-phase` from a fresh clone of the pushed HEAD: per feature a fresh check run, edge cases against «done», a mutation; refuters; a judge | `VERDICT: PASS` |
| `bin/check-verify` | `/verify-phase` finds a planted edge defect, stays silent on a clean fixture, and a run past its limit ends in `VERIFY_TIMEOUT` | `VERIFY_OK` |
| `bin/check-kit` | the kit's skills `plan-phase` and `accept` (verdict by `/verify-phase`), the workflow and its launcher, an evaluator without Write and Edit · the `handoff` mod: table row, launch settings, `claude plugin validate` and `test` | `KIT_OK` · `HANDOFF_OK` |
| `bin/two-tier-upgrade <path>` | a live project moves to v3 on branch `kit-v3` without losing history; `--self-test` on a fixture | `UPGRADE_OK` |
| `bin/check-docs` | links in these documents are alive; CHANGELOG covers every harness field | `DOCS_OK` |
| `bin/gate-v3.2` | the kit on an empty repo and the branch root: the v3.2 markers F1–F9 with their feature numbers and the surviving v3.1 markers (`HARNESS_OK`, `HOOKS_OK`, `VERIFY_OK`, `KIT_OK`, `OWNER_OK`); the gates of v3 and v3.1 are in `docs/archive/` | `F10 GATE_OK` |

The numbers live in [`kit/budgets.json`](kit/budgets.json): kit defaults plus a `project` block that may only
tighten them. The team-lead files are listed there too (`owner`); they are guarded by `Edit` deny rules and by
the ownership lint: a commit that changes one of them must start with «Тимлид:».

## Layout

| path | what |
|---|---|
| `bin/two-tier-init <dir>` | installs the kit: `kit/**` lands in the root of the target, an existing file is never overwritten |
| `kit/CLAUDE.md` | 17 lines the executor reads every session: project facts, its two files, checks, budgets, stops, workflow agents and `main` |
| `kit/REVIEW.md` | the review template: findings, at most five blocking, `Named, not built` |
| `kit/budgets.json` · `kit/bin/` | the budgets and the tools a project runs itself (`check-budget`, `check-ci`, `check-harness`, `check-kit`, `check-spend`, `check-ui`, `jev`, `two-tier-upgrade`, `verify-phase`) |
| `kit/docs/*.template.*` · `kit/docs/LAUNCH.md` | INTENT, SPEC, the start prompt PROMPT, PLAN, PROGRESS, STATUS, PROCESS; the launch line, `spec-gate` modes and the control run |
| `kit/.claude/settings.json` | `model: claude-opus-5-5`, `autoMemoryEnabled: false`, `disableClaudeAiConnectors: true`, `worktree.baseRef: head`, `workflowSizeGuideline: medium`, narrow allow on `bin/check-*`, `bin/gate-*`, `make ci`, deny `Edit` on team-lead files, the hooks |
| `kit/.claude/launch.settings.json` | `enabledPlugins` and `skillOverrides` by the Environment table, the `autoMode.environment` template (`"$defaults"` + project placeholders), passed with `--settings` |
| `kit/.claude/workflows/verify-phase.js` | the saved workflow `/verify-phase`; its copy in `.claude/workflows/` lets this repository accept its own phases |
| `kit/.claude/hooks/` | `kill-switch.sh` (`continue: false`), `steer.sh` (a factual note, to the main session only), `refuse_sweeping_commands.py`, `spec-gate.mjs` (Stop), `abide.mjs` (Abide's four hooks), `toolgate-deny.mjs` (PreToolUse, deny only) |
| `kit/.claude/spec-gate.json` · `kit/.claude/toolgate.yaml` | the gate's mode, caps, questions and thresholds; the executor's Toolgate policy — team-lead files |
| `mods/handoff/` | the `handoff` mod (marketplace `two-tier-mods`): a handoff document and a fresh context at 70 % of the window |
| `kit/.claude/skills/` · `kit/.claude/agents/evaluator.md` | `plan-phase`, `accept`; the evaluator |
| `.github/workflows/two-tier.yml` | CI of this repository; the same file ships in `kit/.github/` |
| `docs/archive/` | everything retired, moved and never deleted: v1, the v2 kit (`kit-v2/`), v2 PROGRESS, PLAN and evidence |

## Quick start

```sh
mkdir my-project && cd my-project && git init
<two-tier-dev>/bin/two-tier-init .   # the kit lands in the root
bin/check-budget                     # BUDGET_OK
```

Then the team lead writes `intent/INTENT.md`, `docs/SPEC-1.md`, the start prompt `docs/PROMPT.txt` and `.claude/launch.settings.json`
from the templates, in commits that start with «Тимлид:». The operator launches the executor with the line in `docs/PROCESS.md`
(every flag explained in [`docs/LAUNCH.md`](docs/LAUNCH.md)); the key `TYPESAFE_API_KEY` stays in the terminal's environment. A live v2 project: `<two-tier-dev>/bin/two-tier-upgrade <path>` → branch
`kit-v3` and the report `docs/upgrade-v3.md` with what remains for the team lead, the executor and the operator.

This repository is not a kit install itself (there is no `.claude/` in its root), so its own executor starts with
`ENABLE_CLAUDEAI_MCP_SERVERS=false` and `--add-dir /tmp/two-tier-v3` (`claude/handoff-2026-10-06-v3-transition.md`).

## Status

v3 and v3.1 are accepted and merged (PR #1, PR #2). v3.2 is built on branch `v3.2` and waits for acceptance; `main` is v3.1 until the operator merges.
