# two-tier-dev — a development cycle for one operator and two AI tiers

**Operator · Team lead (Cowork, Fable 5.1, skills `team-lead` + `grilling`) · Executor (Claude Code, Opus 5 in
ultracode) · Evaluator (Haiku, no Write/Edit, a separate final pass).** One person runs a software project
through two tiers in two apps. The operator owns the goal, the money and the understanding, and decides exactly
three times per phase: the spec yes or no · one letter at a stop point · the gate, which he opens himself. The
team lead owns the intent, the SPEC and acceptance — what works and how it is proven, never the implementation
steps. The executor owns the PLAN, the code, the commits, the evidence files and its own progress file. The
evaluator owns the verdict and is never called by the executor on its own work. There is no direct channel
between the tiers: everything passes through files in the repository, and every handoff is written for a fresh
session.

The system optimises the **cost of verification**, not the speed of writing code, and it counts truth on the
**product** — the operator opens it at the gate — rather than on green tests. What a project needs travels in
`kit/`: 22 files, one command. The cycle was first run on this repository itself, so `docs/SPEC-v2.md` and
`docs/PLAN-v2.md` are the spec and the plan of the kit you are reading. Version history:
[`CHANGELOG.md`](CHANGELOG.md). Full description (Russian, the operator's language):
[`docs/dev-system.ru.md`](docs/dev-system.ru.md).

## The loop

```
INTENT     operator writes intent/<slug>.md — problem · desired result · users and systems · limits
SPEC       team lead grills it in Cowork by grilling (numbered questions, one frontier at a time, until the
           frontier is empty) → docs/SPEC-<n>.md, the six sections: 0 context · 1 high-level design · 2 features ·
           3 invariants · 4 stop points · 5 closing artifact · 6 open questions. A feature is a vertical slice that
           fits ONE fresh context window; the operator signs the spec or sends it back
PLAN       executor reads the SPEC in plan mode → docs/PLAN-<n>.md as a commit: files, order, risks, proof —
           buildable by an engineer who never saw the conversation
GOAL       ONE /goal per phase, ≤4000 characters: one end state · the named check · limits · a stop point
WORK       one commit per feature; docs/PROGRESS.md holds done / ONE next item / the open stop; every check
           writes docs/evidence/<fid>-<check>-result.txt — no file, no marker, the feature is not closed
STOP       STOP: <id> in PROGRESS.md is a DONE goal, not a refusal; beside it a standing resume line; the
           operator answers with one letter and that line brings the work back in a fresh session
ACCEPT     /accept collects STATUS and the evidence list → evaluator judges the diff against SPEC and PLAN by
           REVIEW.md — bugs · security · conformance — and prints PASS or NEEDS_WORK
GATE       docs/STATUS.md answers WHEN we finish; then the operator opens the product himself and says what is
           right and what is not. That, not a green test, closes the phase
HARNESS    AGENT_STOP stops the executor · a line in STEER.md steers it · commit-on-stop commits on Stop ·
           verify-gate refuses to write a result file until its evidence was read · refuse_sweeping_commands.py
           catches sweeping git add and friends
```

## Layout

| path | what |
|---|---|
| `bin/two-tier-init` | installs the kit: one argument, `kit/**` lands in the ROOT of the target, an existing file is never overwritten, git is not touched |
| `kit/` | the 22 files that travel into every project — everything below until `intent/` |
| `kit/CLAUDE.md` | what the executor reads in every fresh session: project facts, verification, evidence, stops, compaction |
| `kit/REVIEW.md` | what the evaluator judges by: bugs · security · conformance to SPEC and PLAN · what counts as Important |
| `kit/intent/intent.template.md` | the operator's entry form: problem · desired result · users and systems · limits · open questions |
| `kit/docs/*.template.md` | `SPEC` (six sections) · `PLAN` (files, order, risks, proof) · `STATUS` (the operator's map) · `PROGRESS` (the executor's page) · `PROCESS` (Environment table · money defaults · fork catalogue) |
| `kit/.claude/settings.json` | `model: opus`, `ultracode`, `workflowSizeGuideline`, the deny list on SPEC/PLAN/STATUS/PROCESS/`intent/`, the hook wiring |
| `kit/.claude/hooks/` | the five cwc hooks verbatim (Apache-2.0): `kill-switch` · `steer` · `track-read` · `verify-gate` · `commit-on-stop`; plus `refuse_sweeping_commands.py` from v1 and `test-output-filter.sh` |
| `kit/.claude/agents/evaluator.md` | the evaluator: Haiku, read-only tools, reads the transcript and `docs/evidence/` |
| `kit/.claude/rules/graphify.md` | the knowledge-graph section kept out of CLAUDE.md so the 40-line cap survives |
| `kit/.claude/skills/` | `team-lead` (patterns) · `grilling` (mattpocock, MIT, verbatim) · `plan-phase` (step 0 of a phase) · `accept` (STATUS + evidence → evaluator) |
| `intent/two-tier-dev-v2.md` | the operator's intent for this repository's own v2 phase — the head of the chain |
| `docs/SPEC-v2.md` · `docs/PLAN-v2.md` | the spec and the plan of the kit build: the first run of the cycle on itself |
| `docs/two-tier-dev-v2-architecture.md` | the signed architecture (18.09): tiers, chain, tree, settings, the executor's environment |
| `docs/dev-system.ru.md` | the system end to end in the operator's language (v2.0) |
| `docs/README.md` | one line per file in `docs/` |
| `docs/evidence/*-result.txt` | check output on disk — the evidence contract, for this repo's own phase |
| `docs/drafts/` | what is written but not yet signed |
| `docs/archive/` | all of v1, moved file by file, nothing deleted: `team-lead-v3.20.md`, `team-lead-v3.23.md`, `team-lead-v1-README.md`, `executor-kit-v1/`, `templates-v1/`, `brain-init-v1/`, `new-project.sh` |
| `CHANGELOG.md` | what each version learned, with the stop that taught it |
| `LICENSE` · `.gitignore` | MIT; as they are |

## The boundary rule (the one rule that keeps the system reusable)

A **pattern** goes into the skill — `team-lead` carries patterns and nothing else. A **mechanic** — a tool name,
a flag, a price, a path, a platform word — goes into the project's `docs/PROCESS.md`. The **lesson of a project**
stays in that project's own documents: its SPEC, its PLAN, its PROGRESS, its STATUS. A **default for every
project** goes into `kit/` here. The test for a skill line: *would it read the same in a project on another
platform, in another currency, with another executor?* If not, it belongs to the project, and only its pattern
comes here.

## Artifacts and their caps

| artifact | owner | cap |
|---|---|---|
| `kit/CLAUDE.md` — read in every fresh session | executor | 40 lines |
| `kit/.claude/skills/team-lead/SKILL.md` — patterns only | team lead | 80 lines |
| `docs/SPEC-<n>.md` — the six sections, the only document the operator signs | team lead | a feature = a vertical slice, ONE fresh context window |
| `docs/PLAN-<n>.md` — files · order · risks · proof, committed before the code; any deviation updates it in the same commit | executor | — |
| `/goal` — one per phase, handed to the operator verbatim in a code block | team lead | 4000 characters |
| `docs/PROGRESS.md` — done / ONE next item / the open stop with its class | executor | 60 lines |
| `docs/STATUS.md` — the operator's map with a concrete finish date, written by `/accept` | team lead | 60 map lines |
| `docs/evidence/<fid>-<check>-result.txt` — the command's own output, one file per check | executor | the mask `*-result.txt` is what `track-read.sh` counts as read; no file or no marker means the feature is not closed |

## Quick start for a new project

1. `cd <project> && bin/two-tier-init . && claude` — `CLAUDE.md`, `REVIEW.md`, `intent/`, `docs/*.template.md`
   and `.claude/` (settings, seven hooks, evaluator, rules, four skills) land in the folder.
2. Fill `CLAUDE.md` (stack, run command, check command) and `docs/PROCESS.md` from the templates: the
   Environment table, the money defaults, the fork catalogue.
3. Kickoff tools — the kit **describes** them, it does not install them. Run them yourself, in the project that
   needs them, and only under a named check or feature:
   - **Context7** — as an MCP server, for library documentation.
   - **graphify** — `pip install graphifyy && graphify install`, then `/graphify src --wiki` and
     `graphify hook install` (post-commit, AST, no LLM); MCP mode stays off. See `kit/.claude/rules/graphify.md`.
   - **ponytail** — `/plugin marketplace add DietrichGebert/ponytail`, then `/plugin install ponytail@ponytail`.
     Two separate messages, not one. Level `full`; `/ponytail-review` is a second pass over the diff.
4. The operator writes `intent/<slug>.md`; the team lead grills it in Cowork → `docs/SPEC-1.md`; the operator
   signs it.
5. The executor: plan mode → `docs/PLAN-1.md` as a commit → one `/goal` for the phase → `/accept`. From here the
   loop above runs, and a tool leaves the Environment table as soon as no feature of the new phase names it.

## Principles in one breath

Product truth first · intent before spec, spec before plan, plan before code · the operator decides three times
and no more · a feature is a vertical slice that fits one fresh context window · the SPEC says what works and
what proves it, never how to implement it · the PLAN is committed before the code and updated in the same commit
as any deviation · one `/goal` per phase · a stop is a done goal with a standing resume line · every check writes
its output to a file, and a check without output never passed · the executor does not verify itself — the
evaluator is a separate pass · taste is not a finding · a tool enters under a named check and leaves when no
feature names it · nothing is deleted, it is moved · a new rule only on the second repeat of the same mistake,
and as a hook first.

## Status

Living system, version 2.0 of the description (2026-09-18). v1 — the `team-lead` card, the executor kit, the
templates and `brain-init` — lives in `docs/archive/` in full; nothing was deleted, only moved. What each version
learned, and the stop that taught it, is in `CHANGELOG.md`. Contributions follow the boundary rule above: a
change to the skill needs the pattern and the stop that taught it.

License: MIT.
