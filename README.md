# two-tier-dev — a development cycle for one operator and two AI tiers

**Operator · Team lead (Cowork, skill `team-lead`) · Executor (Claude Code, kit `brain-init`).**
One person runs a software project through two AI tiers. The operator owns the goal, the money and
the understanding; the team lead owns the phase file, acceptance and the decisions log; the executor
owns code, tests, commits and its own progress file. There is no direct channel between the tiers:
the operator pastes one **standing prompt** down and brings the report **«done, check it»** up, and
otherwise only answers decision tables.

The system optimises the **cost of verification**, not the speed of writing code — verification must
stay cheaper than building — and it counts truth on the **product** (the operator sees the output
beside a reference) rather than on green tests. Everything in this repository was derived from a
real phase of a real project (28 executor sessions, 24 dated rulings, eight stop reviews in two days,
September 2026) and is revised after every stop. Version history: [`CHANGELOG.md`](CHANGELOG.md).
Full description (Russian, the operator's language): [`docs/dev-system.ru.md`](docs/dev-system.ru.md).

## The loop in twelve lines

```
PHASE START     interview (question · metric · data reality · prohibitions) → PHASE file with a feature list, a fork
                catalogue and money defaults → standing prompt (≤12 lines, the same every session)
EXECUTOR        brief ≤5 lines → operator pastes the prompt into a FRESH session → start ritual → ONE item → its
SESSION         check shown → commit by path → PROGRESS updated → «done» or a stop (written, turn ended)
ACCEPTANCE      diff · artifact · the team lead re-runs the check · numbers from result files only · a fresh verifier
                for money, secrets, user input — and before EVERY purchase; red → triage (run complete? reference and
                grader? only then the law); green → tick · one decision line · STATUS with a finish date
STOP            ruling ≤12 lines (decides, never legislates) → pattern note (class · root · preventable?) → the same
                day: phase file revision / PROCESS.md (a mechanic) / skill card (a pattern) / executor harness
PAID RUN        $0 prep item (dry run with pins, population, decision table, platform price, cap quoted from
                it, hard stop) → fresh verifier → team lead reads the dry run + HEAD → paid session: the
                registration opens the money line minutes before the create → run → close → reading
PHASE CLOSE     product-truth gate (operator sees N rows under a seed) → report ≤30 lines → retro metrics → one line
```

## Layout

| path | what |
|---|---|
| `skills/team-lead/SKILL.md` | the team-lead skill card (Cowork side) — **patterns only**; the current version is the one to save |
| `skills/brain-init/` | the executor-side kit generator (Claude Code `/brain-init`): its README and the M6 v2 deltas; the skill source is added by the operator |
| `bin/new-project.sh` | instantiates the cycle in a folder: executor kit + the documents from `templates/`, hook self-test, optional `git init` |
| `templates/` | the artifacts every project instantiates: `PHASE.md` (with the fork catalogue and the money section), `PROGRESS.md`, `STATUS.md`, `PROCESS.md`, `standing-prompt.md`, `rulings.md`, `stop-patterns.md`, `report.md`, `runbook-paid-run.md` |
| `executor-kit/` | what brain-init puts into a repository, as reference files: `CLAUDE.md.template`, `claude-config/` (= the project's `.claude/`: settings with deny rules + hooks, commands, a rules template), hook scripts, the `knowledge/` vault seed |
| `docs/` | the system described end to end (`dev-system.ru.md`), principles, retro notes |
| `CHANGELOG.md` | what each skill version learned, with the stop that taught it |

## The boundary rule (the one rule that keeps the system reusable)

A **pattern** goes into the skill. A **mechanic** — a tool name, a flag, a price, a path, a platform
word — goes into the project's `docs/PROCESS.md`. A **rule of this phase** goes into the project's
`docs/PHASE-<phase>.md`. A **decision made along the way** is a dated ruling in `docs/reviews/`. A
**default for every project** goes into a template here. The test for a skill line: *would it read the
same in a project on another platform, in another currency, with another executor?* If not, it belongs
to the project, and only its pattern comes here.

## Artifacts and their caps

| artifact | owner | cap |
|---|---|---|
| `docs/PHASE-<phase>.md` — the ONE document the executor reads | team lead | 150 lines |
| `docs/plans/<phase>.PROGRESS.md` — done / next (one item) / open stop with its class | executor | 60 lines |
| `docs/STATUS.md` — the operator's map with a concrete finish date | team lead | 60 lines (+ a machine-read block) |
| a ruling in `docs/reviews/<date>-plan-<phase>.md` | team lead | 12 lines |
| a stop review in `docs/reviews/<date>-stop-patterns.md` | team lead | 5 lines per stop |
| `docs/reports/<phase>.md` — question and answer in the first ten lines | executor | 30 lines |
| the standing prompt | team lead | 12 lines |
| a step brief before every prompt | team lead | 5 lines |
| a plan (only when the diff is not a sentence) | executor | 80 lines |
| `CLAUDE.md` · `knowledge/hot.md` | executor | 80 · 40 lines |

## Quick start for a new project

1. `bin/new-project.sh ~/Projects/<name> <phase-1> <name> --git` — the executor kit (`CLAUDE.md`, deny rules,
   hooks, commands, the `knowledge/` vault) and the documents from `templates/` land in the folder, the hooks
   self-test, the first commit is made. (`/brain-init` M6 does the same from inside Claude Code once its source
   is in `skills/brain-init/`.)
2. Open a Cowork session with `/team-lead`: a short interview, one question at a time (goal · metric ·
   data reality · hard prohibitions · blindspot pass) → `docs/PRODUCT.md` / spec → the first
   `docs/PHASE-<phase>.md` from `templates/PHASE.md` — with the fork catalogue and the money defaults
   filled in BEFORE the first item.
3. Fill `docs/PROCESS.md` from `templates/PROCESS.md`: every platform mechanic the skill deliberately
   does not carry (guard commands, ledgers, pins, languages).
4. Build the reference and the grader before any optimisation — they print a number at $0.
5. Paste the standing prompt into a fresh executor session; from here the loop above runs. Cadence:
   at least two executor sessions a day, at most one stop a day, acceptance the same day.

## Principles in one breath

Product truth first · one phase file, one progress file · a standing prompt, not a program · one item
per session, an item is a unit of verification · acceptance by diff, artifact and a re-run check · numbers
only from result files · pre-register the claims that matter, one attempt on a frozen set, a red bar is
an answer · the instrument on the frozen set is byte-for-byte the one that took the dev bar · a spent set
is demoted to a reading · one paid run = one money line, its cap is the platform's hard stop, its close
settles against a post-run reading · a caught defect gets one test in both directions, nothing else gets
a test · every stop teaches, the same day · a law that shrinks.

## Status

Living system, version 1.0 of the description (2026-09-06). Known debts are listed at the end of
`docs/dev-system.ru.md` and in `CHANGELOG.md` under *Unreleased*. Contributions follow the boundary
rule above: a change to the skill needs the pattern and the stop that taught it.

License: MIT.
