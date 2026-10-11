# two-tier-dev — a development cycle for one operator and two AI tiers (kit v3.3)

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
the start prompt `docs/PROMPT.txt`, and the kit's Stop hook **`spec-gate`** holds the end of a turn by files, not words.

v3.3 (10.10.2026) puts **the judge on the claim**, not on the action. The v3.2 leg built ten features in 2 h 12 min and took eight
hours to the gate; its judges on every action made 80 % of the Jev calls and caught no blocking finding. Three claims, three judges:
- **«a piece is done» is a commit** — the kit's git hooks judge it by code (`kit/.githooks/commit-msg`: a secret value, an email or a
  home path in evidence, a team-lead file without «Тимлид:», a deletion without `git mv`; `kit/.githooks/pre-push`: a push that is not
  a fast-forward), then `abide check` against the team lead's rubric `.abide/rubric.json` (0.8 and above refuses once, the executor has
  the last word); `git config core.hooksPath .githooks` wires them, so a commit from a subprocess is judged too;
- **«the phase is done» is the end of a turn** — `spec-gate` holds it by the items `F<n>.<k>` of the SPEC: each item needs its line
  `F<n>.<k> <raw probe output>` in the evidence of the pushed HEAD; the hook asks no model;
- **«the leg is done» is the phase report and one full round** — `bin/phase-report` builds the matrix item × commits, probe,
  observation by code, and one full round of `bin/verify-phase` gives the verdict; after a fix, only the touched features are
  re-verified (`bin/verify-phase F2 …`), never a second full round.

Between the claims no model judges: Toolgate, the Abide hooks on edit and turn, Compact Adviser and Steer-or-Queue left the executor
for the operator's sessions, where their events are; Jev Belay stays in the shadow, and Jev keeps one cell of the phase report in the
shadow — an item against the raw output of its probe. **The window guard** starts the launch line: `bin/check-window` refuses
before the session when the subscription's 5-hour window is above 40 % or the week above 85 % (repair leg and acceptance: 70 %,
`--repair`); the only bypass is `--override` in the line, and it is printed.

Three judges, by the cost of a question, still hold: **code** where a file answers, **Jev** where a bounded question repeats (now in
the shadow), **a fresh agent** (`/verify-phase`) where the work must be reproduced. Why: [`intent/INTENT.md`](intent/INTENT.md). The phase
that built v3.3: [`docs/SPEC-v3.3.md`](docs/SPEC-v3.3.md), [`docs/PLAN-v3.3.md`](docs/PLAN-v3.3.md), [`docs/PROGRESS.md`](docs/PROGRESS.md);
v3.2: [`docs/SPEC-v3.2.md`](docs/SPEC-v3.2.md), [`docs/PLAN-v3.2.md`](docs/PLAN-v3.2.md); v3.1: [`docs/SPEC-v3.1.md`](docs/SPEC-v3.1.md),
[`docs/PLAN-v3.1.md`](docs/PLAN-v3.1.md); v3: [`docs/SPEC-v3.md`](docs/SPEC-v3.md), [`docs/PLAN-v3.md`](docs/PLAN-v3.md). History: [`CHANGELOG.md`](CHANGELOG.md).
The whole system in the operator's language: [`docs/dev-system.ru.md`](docs/dev-system.ru.md).

## The loop

```
INTENT   intent/INTENT.md — one living file: problem · result · success signals S1… · limits · non-goals · decisions · change log
SPEC     docs/SPEC-<n>.md pins the intent (intent/INTENT.md @ <first 12 chars of git hash-object>); a feature line names its signal, its items F<n>.<k> sit under it — an observable result and its place of reading, the block ≤900 chars; every §3 line names its judge
LAUNCH   bin/check-window && <the launch line of docs/PROCESS.md> -- "$(cat docs/PROMPT.txt)" — the start prompt ≤4000 chars; Read first: ≤3 files, ≤50k chars with CLAUDE.md; no /goal
PLAN     step 0 inside the launch (or /plan-phase first, for phases with paid or irreversible steps): per item its probe, green and red · order · risks · deviations; ≤150 lines
WORK     small commits with the item ids first (F2.3: …) and the probe in the same commit; the git hooks judge each commit; every probe prints F<n>.<k> <raw output> into docs/evidence/<F>-<check>-result.txt
TURN END spec-gate: every item's probe line in the pushed HEAD → SPEC_GATE_OK; otherwise the turn goes on, the block names the item (caps: 12 blocks, 3 h, no-progress)
STOP     a new line STOP: <id> in the pushed HEAD, with a question and a resume line — four reasons only: paid or irreversible above the threshold · a real scope change · input only the operator has · no progress
ACCEPT   CI on push (check-budget + make ci) · one full round of /verify-phase from a fresh clone (bin/verify-phase, ≤30 min), then point rounds for touched features · the phase report docs/evidence/phase-report.md · a review has ≤5 blocking findings
GATE     the operator runs the product and judges it by the success signals of the intent
```

## The mechanics — every rule has a command

| command | what it proves | marker |
|---|---|---|
| `bin/check-budget` | the budgets: skills, CLAUDE.md, intent, SPEC feature blocks, items and their places of reading, a judge on every §3 line, pin, open-question markers, PROGRESS, PLAN, the start prompt, reviews, the rubric, ownership of team-lead files | `BUDGET_OK` |
| `bin/check-budget --self-test [group…]` | a green and a red fixture for every rule | `SELFTEST_OK` |
| `bin/check-budget --templates` | every template, instantiated as an example, passes the budgets | `BUDGET_OK` |
| `bin/check-ci <branch>` | the `two-tier` workflow run of HEAD is green; a run of an older commit does not count | `CI_OK` |
| `bin/check-harness items` | `spec-gate` by the items: a missing probe line blocks and names the item, the full set passes, a STOP counts only from the pushed HEAD; the phase report from code | `ITEMS_OK` · `GATE_HOOK_OK` |
| `bin/check-harness commit` | the git hooks: a secret, a home path or an email, a team-lead file without «Тимлид:», a deletion, a force-push — refused with the rule; `abide check` refuses once; the rubric ≤ 8 rules, each red sample ≥ 0.8 | `COMMIT_OK` |
| `bin/check-harness env` | settings and control runs with the PROCESS launch line (`--effort ultracode`, `--setting-sources project,local`): `system/init` equals the Environment table, no hook on an action goes to the network or calls a model, the steer note lands, `AGENT_STOP` stops at the first call, deny and the sweeping-command refusal hold on the main session and on a workflow agent | `ENV_OK` · `HARNESS_OK` · `HOOKS_OK` |
| `bin/jev --self-test` | typed questions to Jev in one command: every side of the contract on a fake server; with a key, one live call (HTTP 200, `jev-1.13.0`) | `JEV_OK` |
| `bin/check-spend` | Jev spend of the leg from the logs of the layer: calls, tokens, $ and €, no cap; a fixture with a known sum | `SPEND_OK` |
| `bin/check-ui [<flow.json>]` | a Jev Browser scenario as a check (template); without an argument — a probe on a local page | `UI_OK` |
| `bin/check-window [--repair] [--override]` | the window guard of the launch line: one `claude -p` turn on Haiku reads the 5-hour and weekly windows; above the thresholds of `budgets.json` — a refusal before the session with both numbers and the reset; `--override` passes and prints the bypass | — |
| `bin/verify-phase [F<n> …]` | the saved workflow `/verify-phase` from a fresh clone of the pushed HEAD: per feature a fresh check run, edge cases against the items, a mutation; refuters; a judge; with a list — only those features (`FEATURES:` in the verdict) | `VERDICT: PASS` |
| `bin/check-verify` | `/verify-phase` checks only the named features, a surviving mutation and green evidence over a broken product are not PASS, a point PASS after a fix passes `spec-gate` | `VERIFY_OK` |
| `bin/phase-report` | the phase report `phase-report.md` in `docs/evidence/`: items × commits, probe, observation; items without commits, commits without an item, items without a probe; commit-judge counts; the hook's passes; Jev's status in the shadow | — |
| `bin/check-kit` | the kit's skills `plan-phase` and `accept`, the workflow and its launcher, an evaluator without Write and Edit · the `handoff` mod · the window guard on given events | `KIT_OK` · `HANDOFF_OK` · `WINDOW_OK` |
| `bin/two-tier-upgrade <path>` | a live project moves to the kit on branch `kit-v3` without losing history: the retired hooks and plugins leave, the previous files go to the archive; `--self-test` on a fixture | `UPGRADE_OK` |
| `bin/check-docs` | links in these documents are alive; CHANGELOG covers every harness field and the source sweep with quotes and addresses; the templates pass | `DOCS_OK` |
| `bin/gate-v3.3` | the kit on an empty repo: the v3.3 markers F1–F7 with their feature numbers and the surviving markers of v3.2; the gates of v3, v3.1 and v3.2 are in `docs/archive/` | `F7 GATE_OK` |

`ABIDE_OK` and `TOOLGATE_OK` are retired markers: the per-edit Abide hooks and the Toolgate hook left the kit in v3.3.

The numbers live in [`kit/budgets.json`](kit/budgets.json): kit defaults plus a `project` block that may only
tighten them. The team-lead files are listed there too (`owner`); they are guarded by `Edit` deny rules, by the
commit hook and by the ownership lint: a commit that changes one of them must start with «Тимлид:».

## Layout

| path | what |
|---|---|
| `bin/two-tier-init <dir>` | installs the kit: `kit/**` lands in the root of the target, an existing file is never overwritten; sets `core.hooksPath .githooks` |
| `kit/CLAUDE.md` | the lines the executor reads every session: project facts, its two files, checks, budgets, stops, workflow agents and `main`, the commit judges and `## Rules for every commit` |
| `kit/REVIEW.md` | the review template: findings, at most five blocking, `Named, not built` |
| `kit/budgets.json` · `kit/bin/` | the budgets and the tools a project runs itself (`check-budget`, `check-ci`, `check-harness`, `check-kit`, `check-spend`, `check-ui`, `check-window`, `jev`, `phase-report`, `two-tier-upgrade`, `verify-phase`) |
| `kit/docs/*.template.*` · `kit/docs/LAUNCH.md` | INTENT, SPEC (items and the judges table), the start prompt PROMPT, PLAN, PROGRESS, STATUS, PROCESS; the launch line with the window guard, `spec-gate` modes and the control run |
| `kit/.githooks/` | `commit-msg` (the code rules, then `abide check`), `pre-push` (no force-push) |
| `kit/.claude/settings.json` | `model: claude-opus-5-5`, `autoMemoryEnabled: false`, `disableClaudeAiConnectors: true`, `worktree.baseRef: head`, `workflowSizeGuideline: medium`, narrow allow on `bin/check-*`, `bin/gate-*`, `make ci`, deny `Edit` on team-lead files, the hooks |
| `kit/.claude/launch.settings.json` | `enabledPlugins` and `skillOverrides` by the Environment table, the `autoMode.environment` template (`"$defaults"` + project placeholders), passed with `--settings` |
| `kit/.claude/workflows/verify-phase.js` | the saved workflow `/verify-phase`, a feature list through `args`; its copy in `.claude/workflows/` lets this repository accept its own phases |
| `kit/.claude/hooks/` | `kill-switch.sh` (`continue: false`), `steer.sh` (a factual note, to the main session only), `refuse_sweeping_commands.py`, `spec-gate.mjs` (Stop, by the items) |
| `kit/.claude/spec-gate.json` | the gate's mode, caps and the question of the Jev cell — a team-lead file |
| `mods/` | marketplace `two-tier-mods`: `handoff` (a handoff document and a fresh context at 70 % of the window), `limits` (the operator's status line: the 5-hour and weekly windows, time to reset, context, session cost) |
| `kit/.claude/skills/` · `kit/.claude/agents/evaluator.md` | `plan-phase`, `accept`; the evaluator |
| `.github/workflows/two-tier.yml` | CI of this repository; the same file ships in `kit/.github/` |
| `docs/archive/` | everything retired, moved and never deleted: v1, the v2 kit (`kit-v2/`), the v3.2 hooks of Abide and Toolgate (`kit-v3.2/`), PROGRESS, PLAN, evidence and gates of earlier phases |

## Quick start

```sh
mkdir my-project && cd my-project && git init
<two-tier-dev>/bin/two-tier-init .   # the kit lands in the root, core.hooksPath → .githooks
bin/check-budget                     # BUDGET_OK
```

Then the team lead writes `intent/INTENT.md`, `docs/SPEC-1.md`, the start prompt `docs/PROMPT.txt`, `.claude/launch.settings.json`
and the rubric `.abide/rubric.json` from the templates, in commits that start with «Тимлид:». The operator launches the executor with
the line in `docs/PROCESS.md` — it starts with `bin/check-window && ` (every flag explained in [`docs/LAUNCH.md`](docs/LAUNCH.md)); the key
`TYPESAFE_API_KEY` stays in the terminal's environment. A live project: `<two-tier-dev>/bin/two-tier-upgrade <path>` → branch
`kit-v3` and the report `docs/upgrade-v3.md` with what remains for the team lead, the executor and the operator.

This repository is not a kit install itself (there is no `.claude/` in its root), so its own executor starts with
`ENABLE_CLAUDEAI_MCP_SERVERS=false` and `--add-dir /tmp/two-tier-v3` (`claude/handoff-2026-10-06-v3-transition.md`).

## Status

v3, v3.1 and v3.2 are accepted and merged (PR #1, PR #2, PR #3). v3.3 is built on branch `v3.3` and waits for acceptance; `main` is
v3.2 until the operator merges.
