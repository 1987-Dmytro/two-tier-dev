# executor-kit — what `brain-init` puts into a repository, as reference files

These are the executor-side files of the two-tier cycle, taken from a live project where they were generated
by `brain-init` (modules M1–M6) and then run for a month. They are generic: no project names, no paths outside
`${CLAUDE_PROJECT_DIR}`. Until the `brain-init` skill source lives in `skills/brain-init/`, copy them by hand.

| file | role |
|---|---|
| `CLAUDE.md.template` | the executor's law, ≤80 lines: where the truth lives, file ownership, the per-phase loop, rules, the second brain, stack |
| `claude-config/settings.json` → `.claude/settings.json` | `permissions.deny` on every team-lead file (single writer per file); the harness FIELDS (v3.16): `env.CLAUDE_CODE_EFFORT_LEVEL` and `ultracode: false` — effort and orchestration are settings, never a per-session ritual; hooks with `timeout` in SECONDS (the platform's unit; a guard's timeout is generous because a timed-out `PreToolUse` hook does not block): `SessionStart` — ONE sequential hook (refresh → inject `knowledge/hot.md` → stale check → context census; hooks of one event run in parallel, so a dependency lives inside one command), `Stop` (`brain-session-end.py`: daily-log stub + `knowledge/index.md`), `PreToolUse(Bash)` (`refuse_sweeping_commands.py` + a code-graph hint before greps). The project's PROCESS adds the narrow `permissions.allow` rules for its paid CLI's create/release commands and names the executor's launch line (its permission mode) as a field |
| `claude-config/commands/plan-phase.md` | `/plan-phase <name>` — a plan only when the diff is not a sentence; STOP for review |
| `claude-config/commands/report.md` | `/report <name>` — the phase report, question first, ≤30 lines |
| `claude-config/commands/save.md` · `close.md` | mid-session checkpoint and end-of-day close of the vault (M6 v2 folds both into one `/checkpoint` that updates PROGRESS and commits by path) |
| `claude-config/rules/_TEMPLATE.md` | a path-scoped rule (loaded only when matching files are touched) |
| `scripts/hooks/refuse_sweeping_commands.py` | refuses `git add -A`, repo-wide format and their spellings by BEHAVIOUR, not by string; tested in both directions |
| `scripts/brain-session-end.py` | the Stop hook: daily-log stub, `knowledge/index.md`, vault state; idempotent, always exits 0 |
| `scripts/refresh-hot-cache.py` | regenerates the AUTO section of `knowledge/hot.md`; the curated block below the marker survives |
| `scripts/stale-check.sh` | warns when the curated block of `hot.md` is older than the last commit |
| `scripts/context-census.py` | a one-line estimate of what every session pays at boot (CLAUDE.md, memory, hot.md, unscoped rules) |
| `knowledge/README.md` · `knowledge/templates/` | the vault's constitution; daily-log and decision templates |

## What M6 v2 changes (not yet applied in the live project — see `skills/brain-init/M6-v2-deltas.md`)

`SessionStart` injects ONLY `docs/plans/<phase>.PROGRESS.md` and `git log -15 --oneline`; the hot-cache and
daily-log budget hooks are removed (they were 45 % of one phase's commits); `/save` + `/close` → one
`/checkpoint`; `/report` → an entry in PROGRESS; no Stop hook for `/goal`; the phase-file template carries the
fork catalogue and the money section; the PROGRESS template carries `class:` for the open stop; the one line
in `CLAUDE.md`: «Never add a test, pin, guard or ledger the phase file did not ask for — the phase file asks for
ONE test per caught product defect; name every other need in PROGRESS instead.»

## Installing by hand

1. Copy `CLAUDE.md.template` → `CLAUDE.md` and fill the placeholders; keep it ≤80 lines.
2. Copy `claude-config/` to `<project>/.claude/` and `scripts/` as is (the hooks are wired by path in `settings.json`). The
   folder is not named `.claude` here because dot-folders are hidden and some tools refuse to write them.
3. Copy `knowledge/` and create `knowledge/hot.md` with the two AUTO-GEN markers `refresh-hot-cache.py` expects.
4. Create `docs/plans/<phase>.PROGRESS.md` from `templates/PROGRESS.md`; the phase file comes from the team lead.
5. Run one session with the standing prompt (`templates/standing-prompt.md`) and check that a deny rule refuses
   an edit of `docs/STATUS.md` and the hook refuses `git add -A` — a guard nobody has seen refuse is not a guard.
