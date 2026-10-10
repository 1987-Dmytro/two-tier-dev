# Changelog — what each version learned, and the stop that taught it

The unit of versioning is the KIT: `kit/` (CLAUDE.md, REVIEW.md, the templates, `.claude/` — hooks, evaluator,
skills), `bin/two-tier-init` that copies it into a project, and the documents that describe the cycle; a
version is what the next `bin/two-tier-init` ships. A rule enters only on the REPEAT of the same error without
it, and it enters first as a hook (D10). Dates are the days the rule entered the live kit.

## Unreleased — named debts
- The Cowork card v3.22 that the v2 architecture §3 sends to the archive is not producible from repo content (PLAN-v2,
  risk 6); either the operator exports it or the line is retired.
- The limit cost of ultracode is measured on the v3.1 leg (SPEC-v3.1 §2: ≤40 % of the week, ordinary phases 15 %); the
  bar for ordinary phases is reset by that measurement at the v3.1 retro, together with `fix-until-green.js` (Q4).
- Living projects move to v3.3 by `bin/two-tier-upgrade` in the next phase (SPEC-v3.3 §6); the kit's S6 is measured there, and the kit
  stays frozen until that leg is accepted, except for a defect that stops it.

## v3.3 — 2026-10-10 — the judge stands on the claim, not on the action: a commit is judged by code and `abide check`, the end of a turn by the items of the spec, the leg by one acceptance round
- **Three claims, three judges** (D5–D7, S8). «A piece is done» is a commit: `kit/.githooks/commit-msg` refuses by code — rules
  `no-secret-values`, `evidence-anonymized`, `team-lead-files`, `no-delete` — and then runs `abide check --json --phase edit --diff <staged patch>`
  against the team lead's rubric `.abide/rubric.json` (0.8 and above refuses once with the rule and the file, the same diff once more
  passes as «rejected»; 0.5–0.8 is a note; an error or a timeout is a skip); `kit/.githooks/pre-push` refuses a push that is not a
  fast-forward (`no-force-push`), however it is spelled; `bin/two-tier-init` and `bin/two-tier-upgrade` set `git config core.hooksPath .githooks`,
  so a commit from a subprocess is judged too; every judgment is a line of `commit-judge.jsonl` in `docs/evidence/`. «The phase is
  done» is the end of a turn: `spec-gate` holds it by the items `F<n>.<k>` of the SPEC — per item a line `F<n>.<k> <raw probe output>`
  in `docs/evidence/F<n>-*-result.txt` of the pushed HEAD, a STOP only from the pushed HEAD, a full `/verify-phase` PASS plus a point
  PASS for every feature changed after it; the hook no longer asks Jev. «The leg is done» is the phase report `phase-report.md` in
  `docs/evidence/`, built by code (`bin/phase-report`: the matrix item × commits, probe, observation; items without commits, commits
  without an item, items without a probe; the commit-judge counts; the hook's passes; Jev's status confirms / contradicts / silent, in the
  shadow) and one full round of `bin/verify-phase`. Taught by: the v3.2 leg — ten features built in 2 h 12 min, eight hours to the gate;
  the judges on every action made 80 % of the 9070 Jev calls and caught no blocking finding (`claude/retro-2026-10-09-v3.2.md`).
- **One acceptance round** (F4): `bin/verify-phase F2 …` checks only the named features and writes `docs/evidence/verify-<sha7>-F2.txt`
  with a line `FEATURES: F2`; without a list — every feature; a surviving mutation, or an item the checker did not confirm with its own
  command and its raw output, blocks. Taught by: five full rounds, 2 h 49 min, in v3.2.
- **Retired at the executor** (F3): Toolgate, the Abide hooks on edit and turn, Compact Adviser, Steer-or-Queue — they judge each action
  or a human's message mid-turn, and the executor's phase has neither; their files moved to `docs/archive/kit-v3.2/claude-config/`; Jev
  Belay stays in the shadow; a hook on an action (PreToolUse, PostToolUse, UserPromptSubmit) that goes to the network or calls a model is
  red in `bin/check-harness`. The markers `ABIDE_OK` and `TOOLGATE_OK` are retired. Taught by: research 09.10 (c) — a tool stands where
  its event is (`claude/research-2026-10-09c-tools-as-designed.md`).
- **The window guard** (F5): the launch line starts with `bin/check-window && ` — one `claude -p` turn on `claude-haiku-5-5` reads
  `rate_limit_event.unifiedWindows` and refuses before the session when the 5 h window is above 40 % or the week above 85 % (the repair
  leg and `bin/verify-phase`: the 5 h window above 70 %, flag `--repair`), printing both numbers and the reset time; numbers not read —
  a refusal with the reason; the thresholds `window_five_hour_pct`, `window_seven_day_pct`, `window_repair_pct` are keys of `budgets.json`;
  the only bypass is the flag `--override` in the line, and the bypass is printed. Taught by: the repair leg of 09.10 started at 82 % of
  the 5 h window and stopped on the limit after 65 min.
- **Spec items** (F1.3, F6.3): the SPEC template puts items `F<n>.<k>` under each feature line, each with its place of reading, a judges
  table, and a judge on every line of §3; `bin/check-budget` holds a feature block (the line and its items) to `spec_block_chars` (900).
- **Gate:** `bin/gate-v3.3` prints F1 `ITEMS_OK`, F2 `COMMIT_OK`, F3 `ENV_OK`, F4 `VERIFY_OK`, F5 `WINDOW_OK`, F6 `DOCS_OK`, F7 `GATE_OK`
  and the surviving markers of v3.2; the v3.2 gate moved to `docs/archive/gate-v3.2/gate-v3.2`.
- **Source sweep 09.10 (Claude Code 2.1.295)** — the team lead's sweep (`claude/retro-2026-10-09-v3.2.md`, §3), every quote re-read on its
  page on 10.10 (Claude Code 2.1.296); a line per fact — the quote, its address, what it changes:
  - «Added `onFailure: "block"` for command and HTTP hooks: a hook that can't start, times out, or exits with an unexpected code blocks the action instead of letting it through» — [changelog 2.1.295](https://code.claude.com/docs/en/changelog) — a static ban may fail closed; the kit's Claude Code hooks still pass on their own error, the bans of F2 are git hooks.
  - «When a session starts with a skill named `verify` or `simplify` in place, Claude Code's commit instructions tell Claude to run it right before each commit, except for changes to docs or tests» — [skills](https://code.claude.com/docs/en/skills) — the documented spot of «a piece is done» is the commit; the kit judges it by a git hook (code, not a request to the model); a `verify` skill stays Named.
  - «A saved workflow can accept input through the `args` parameter» — [workflows](https://code.claude.com/docs/en/workflows#pass-input-to-a-saved-workflow) — `bin/verify-phase F2 …` passes the feature list as `args` (F4.1).
  - «A run doesn't pause in non-interactive mode with `claude -p`» — [workflows](https://code.claude.com/docs/en/workflows) — acceptance on a subscription limit fails instead of waiting: `bin/verify-phase` runs the window guard first (`--repair`, 70 %).
  - «Pushing to any branch of the repository you're working in, including the default branch» — [permission-modes](https://code.claude.com/docs/en/permission-modes) — auto mode does not hold `main`; GitHub branch protection does (checked 09.10).
  - «When repeated blocks reach a threshold, the action doesn't run and Claude keeps working. Claude Code doesn't stop the run.» — [permission-modes](https://code.claude.com/docs/en/permission-modes) — in `-p` a classifier block ends nothing: a hard ban is code.
  - «Reverted the auto mode denial message change from 2.1.281 that told Claude a denial covers the outcome, not only the exact command» — [changelog 2.1.293](https://code.claude.com/docs/en/changelog) — a refused action may come back in another form: `pre-push` judges what a push does, not how it is spelled (F2.3).
  - «Fixed `prompt` and `agent` hooks written as instructions (such as "Block commands that...") allowing what they should block» — [changelog 2.1.294](https://code.claude.com/docs/en/changelog) — a model hook is reliable only from 2.1.294; the kit has none on an action (F3.2).
  - «Because the `if` filter is best-effort, use the permission system rather than a hook to enforce a hard allow or deny» — [hooks](https://code.claude.com/docs/en/hooks) — a hook's filter is no ban; the push judge reads the push itself.
  - «A push written another way, such as `git -C . push`, isn't matched» — [permissions](https://code.claude.com/docs/en/permissions) — `Bash(git push *)` misses spellings; `pre-push` sees every push, `git -C` and subprocesses included (F2.3).
  - «Claude Code overrides a Stop hook after it blocks eight times in a row with no tool call from Claude in between» — [hooks-guide](https://code.claude.com/docs/en/hooks-guide) — the kit's cap of 12 blocks per session is another measure; no conflict.
  - «Percentage of the 5-hour or 7-day rate limit consumed, from 0 to 100» — [statusline](https://code.claude.com/docs/en/statusline) — `rate_limits.*.used_percentage` reaches only the status line of a running session: the `limits` mod shows it; there is no documented entry before a session.
  - «Fraction of the rate limit consumed (0.0 to 1.0)» — [agent-sdk python](https://code.claude.com/docs/en/agent-sdk/python) — `utilization` of the rate-limit event is documented, but it did not arrive in the measurement of 10.10; `unifiedWindows` is the one exception of C2 (the table below).
  - «If you set `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` during early access, remove it. Claude Code v2.1.287 and later ignores it» — [mods overview](https://code.claude.com/docs/en/plugins/mods/overview) — the variable leaves the launch line with Compact Adviser.
  - «agents reliably skew positive when grading their own work» — [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps), 24.03.2026 — the checker confirms an item only by its own command and its raw output (F4.3).
  - «any probabilistic defense has a non-zero miss rate» — [How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude), 25.05.2026 — a ban is code, a model judge is an estimate: Jev blocks nothing.

  Unchanged: `/goal` (documented, unused by the kit), the `Edit(path)` rules, the flags of the launch line, model-config.
- **Harness fields** — the source, and what a control run showed before, on kit v3.2 (the v3.2 leg, `docs/archive/evidence-v3.2/`), and
  after, on v3.3 (the probes of this phase, `docs/evidence/F1-harness-result.txt` … `F5-kit-result.txt`):

| field | v3.2 → v3.3 | source | before (v3.2) | after (v3.3) |
|---|---|---|---|---|
| `hooks`: `abide.mjs` (SessionStart, UserPromptSubmit, PostToolUse, Stop) | the kit's wrapper on four events → removed, `git mv` to `docs/archive/kit-v3.2/claude-config/hooks/`; Abide judges the commit (row `core.hooksPath`) | [Abide](https://github.com/coldteadotai/abide) README: «`edit` after each edit, `turn` once at the end against the whole diff»; `abide help` 0.0.9: «check uncommitted changes the way the hooks would» | `abide report` of the v3.2 leg: 23 edit checks, 0 turn checks — the turn is the whole phase, its diff does not fit a Jev request; `no-delete-tracked` never checked (research (c), §1) | Abide hooks in the kit's settings — 0 (F3.1, `docs/evidence/F3-harness-result.txt`); `abide check` once per commit (F2.4, `docs/evidence/F2-harness-result.txt`) |
| `hooks`: `toolgate-deny.mjs` (PreToolUse) + `.claude/toolgate.yaml` | deny only over `toolgate decide` → removed, both to `docs/archive/kit-v3.2/claude-config/`; force-push is refused by `pre-push` | [Toolgate](https://github.com/RiskAverseTech/toolgate) README: «A calibrated tool-call firewall that runs as a Claude Code mod (or `PreToolUse` hook)»; [How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude) | 80 % of the 9070 Jev calls of the leg; the user-level log of 09.10: 4121 decisions, 288 refusals, 281 of them «violates a constraint» at the threshold; the mutations of F3 not run because of them (retro v3.2, §2) | action hooks of the kit that go to the network or call a model — 0, a fixture PreToolUse with `fetch` — red with its name (F3.2); a non-fast-forward push into a bare fixture — refused (F2.3) |
| `permissions` (deny) `Edit(/.claude/toolgate.yaml)`; `owner` `.claude/toolgate.yaml` | set → removed with the policy | [permissions](https://code.claude.com/docs/en/permissions) | the policy was a team-lead file under deny | deny and the owner list of `kit/budgets.json` carry no retired file; deny covers the owner list (static check of `bin/check-harness`) |
| `launch.settings.json`: `enabledPlugins` `jev-steer-or-queue@jev-steer-or-queue`, its `pluginConfigs` | `true`, shadow → `false`, no `pluginConfigs` | [Steer-or-Queue](https://github.com/Larkspur-Wang/Jev_steer_or_queue) README: «This project classifies each mid-turn message into one of three timings and acts on it»; [settings-reference](https://code.claude.com/docs/en/settings-reference#enabledplugins) | shadow at the executor: nobody writes to the executor mid-turn — no signal (research (c), §3) | `false`; the Environment row «нет» — only the operator's sessions; `system/init` of a kit project equals the table (F3.1, F3.3) |
| `launch.settings.json`: `enabledPlugins` `compact-adviser@compact-adviser`, its `pluginConfigs` | `true`, `hint` → `false`, no `pluginConfigs` | [Compact Adviser](https://github.com/kunchenguid/compact-adviser) README: «Export `COMPACT_ADVISER_DISABLE=1` for unattended agent sessions, where advice has nobody to read it.» | inert in every session: the mod waits for `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`, set in no profile — «0 records» was no measurement (research (c), §1) | `false`; the Environment row «нет» (F3.1, F3.3) |
| launch line `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` | set → dropped | [mods overview](https://code.claude.com/docs/en/plugins/mods/overview): «Claude Code v2.1.287 and later ignores it» | in the template line only for Compact Adviser | the template line without it; the `handoff` mod passes `claude plugin validate` and `test` without it (`HANDOFF_OK`) |
| launch line `bin/check-window && ` (flags `--repair`, `--override`) | none → the window guard before `claude` | [statusline](https://code.claude.com/docs/en/statusline): `rate_limits.*.used_percentage`, only to the status line of a running session; [agent-sdk](https://code.claude.com/docs/en/agent-sdk/typescript#sdkratelimitevent): `rate_limit_event` | the repair leg of 09.10 started at 82 % of the 5 h window and stopped on the limit after 65 min (STOP-INPUT) | 5 h 41 % or week 86 % — a refusal before the session with both numbers and the reset; 39 % and 84 % — the session starts; `--repair` holds 70 %; no numbers — a refusal with the reason; `--override` passes and is printed (F5.1–F5.3, `docs/evidence/F5-kit-result.txt`) |
| `rate_limit_event.unifiedWindows` | the one exception of C2 (intent log 10.10) | the measurement of 10.10 — the field is undocumented; documented are `rate_limits` of the [statusline](https://code.claude.com/docs/en/statusline) and `utilization` of the [agent-sdk](https://code.claude.com/docs/en/agent-sdk/python) event | no entry before a session: the team lead read the windows by hand into STATUS | one `claude -p` turn on `claude-haiku-5-5`: `unifiedWindows.five_hour.utilization` and `seven_day.utilization` × 100 against `*_pct`; the field gone — a refusal with the reason (F5.3) |
| `core.hooksPath .githooks`: `.githooks/commit-msg`, `.githooks/pre-push` | none → set by `bin/two-tier-init` and `bin/two-tier-upgrade` | [githooks](https://git-scm.com/docs/githooks): «By default the hooks directory is $GIT_DIR/hooks, but that can be changed via the core.hooksPath configuration variable» | a commit was judged only at acceptance (the team lead's `abide check` and `git log`); force-push held by auto mode alone | a key, a home path or an email in evidence, a team-lead file without «Тимлид:», a deletion without `git mv` — refused with the rule and the file, from a Python subprocess too; `abide check` from 0.8 refuses once, the same diff passes as «rejected» (F2.1–F2.6, `docs/evidence/F2-harness-result.txt`) |
| `hooks`: `spec-gate.mjs` (Stop) | a marker per feature, Jev on the fuzzy part → the items `F<n>.<k>` by code, no Jev | [hooks: Stop decision control](https://code.claude.com/docs/en/hooks#stop-decision-control) | 51 «done» conditions on 10 markers: half of them outside any check, re-read five times by agents (retro v3.2, §1) | «done» without the probe line of an item — blocked, the block names the item; the full set — `SPEC_GATE_OK`; a STOP on disk only — blocked (F1.1–F1.5, `docs/evidence/F1-harness-result.txt`) |
| `workflows/verify-phase.js`: `args`; `bin/verify-phase [F<n> …]` | every feature on every round → one full round, then only the touched features | [workflows](https://code.claude.com/docs/en/workflows#pass-input-to-a-saved-workflow): «A saved workflow can accept input through the `args` parameter» | five full rounds, 2 h 49 min (retro v3.2, §2) | `bin/verify-phase F1` on a fixture — a verdict with `FEATURES: F1`; a surviving mutation — not PASS, the finding names the feature and the mutation; green evidence over a broken product — not PASS (F4.1–F4.3, `docs/evidence/F4-verify-result.txt`) |
| `budgets.json`: `spec_block_chars` 900, `window_five_hour_pct` 40, `window_seven_day_pct` 85, `window_repair_pct` 70; `abide_rules` 15 → 8 | new keys of the kit; the rubric bound tightened | [statusline](https://code.claude.com/docs/en/statusline) — the 0–100 scale of `window_*`; the rest are kit budgets by D7 (at most eight rules in the rubric) | a feature line of ≤ 600 chars held 51 conditions; a rubric of 13 rules; the thresholds were words of PROCESS | a block of 901 chars, an item without a place of reading, a §3 line without a judge — `bin/check-budget` red with the id (F1.3); a changed threshold in a fixture's `budgets.json` changes the decision (F5.4) |

Mods, `claude plugin validate`:
- `limits` 0.1.0 (`mods/limits`), «Validation passed with warnings»:
  - `./register.ts hooks: session.measure`
  - `./register.ts calls: $.clock.now, $.ui.status`

  The operator's status line — the 5 h and week windows with the time to their reset, context fill, session cost; the warning is the
  missing `author` of `plugin.json`; `claude plugin test mods/limits` — 3 pass, 0 fail. Not in the executor's Environment («нет»).

Known debts: Abide 0.0.9 still calls the floating `jev-latest` (SPEC-v3.3, Named); `unifiedWindows` may vanish with any release —
`bin/check-window` then refuses with the reason, and the window is read by hand until a documented entry exists.

## v3.2 — 2026-10-09 — the spec drives the phase without `/goal`: a Stop hook holds the end of a turn by evidence files, the Jev layer comes through the kit
- **Launch without `/goal`** (D5): the phase starts from the start prompt `docs/PROMPT.txt` (template `kit/docs/PROMPT.template.txt`),
  passed as the last argument of the launch line; the GOAL template moved to `docs/archive/GOAL.template-v3.1.txt`; `check-budget` reads
  `Read first:` from the start prompt (the older `docs/GOAL.txt` until it is moved) under the budget `prompt_chars` (a project's older
  `goal_chars` — WARN; in the kit, `--templates` fails `kit-prompt` until `kit/budgets.json` and `kit/CLAUDE.md` drop the GOAL scheme)
  and fails on any `/goal` left in the kit; `bin/two-tier-upgrade` moves a project's `docs/GOAL.txt` to `docs/PROMPT.txt` in its own «Тимлид:» commit
  and brings a project upgraded before to the kit in full: a `kit-v3` (local or on origin) ahead of HEAD carries the work on, one behind
  HEAD is moved onto it, a diverged one is rc 1; the previous kit files of each run go to a new archive `docs/archive/kit-<date>/`, the
  report `docs/upgrade-v3.md` speaks of this run, and a kit file left stale in HEAD is rc 1 with a rollback (review v3.2-2, B1).
  Taught by: the operator, 09.10 — «`/goal` мешает разработке, нужна только правильная спека».
- **`spec-gate`** — the kit's Stop hook: by code, every feature of the phase SPEC has its evidence file with the marker, the branch is
  pushed, the PROGRESS head differs from the one committed before the session, `/verify-phase` gave PASS for HEAD, all judged from the
  pushed HEAD (a set file that `git status` shows as changed, untracked or deleted holds the turn by name; STOP lines count on disk) — then
  `SPEC_GATE_OK`; a new `STOP: <id>` line of §4 ends a turn once; otherwise the end of the turn is blocked with the list of what is missing. Jev answers only the fuzzy part (a STOP line with a question and a resume
  line, a complete PROGRESS head, evidence that contradicts «done») in one `bin/jev` call; caps of 12 blocks and 3 h and `no-progress`
  after the same list three times only soften a block, background tasks and `AGENT_STOP` pass; on its own error it lets the turn end.
- **The Jev layer through the kit** (D6): Abide (rules of the project's CLAUDE.md on every edit, a note — the end of the turn is not
  held), Toolgate «deny only», Belay and Steer-or-Queue in shadow, Compact Adviser `hint`, the `handoff` mod at 70 %; Quicksilver, Jev
  SEO and Jev Browser by task, proven by probes; the Environment table drives all of it and `bin/check-harness` compares it with
  `system/init`, the plugin modes and the logs of a live session. Taught by: the team lead's measurement 09.10 — the v3.1 kit on this
  Mac after the user-level install: `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` (`docs/archive/evidence-v3.2/F4-harness-v3.1-baseline.txt`).
- **Tools:** `bin/jev` — typed questions to Jev for both tiers (model pinned `jev-1.13.0`, key from the environment, spend log);
  `bin/check-ui` — a Jev Browser scenario as a check (template); `bin/check-spend` — Jev spend of a leg in calls, tokens, $ and €.
- **Harness fields** — the source, and the same control pair (`bin/check-harness`) before, on kit v3.1 (`docs/archive/evidence-v3.2/F4-harness-v3.1-baseline.txt`:
  the repo root with the team lead's wiring, and t3 from the v3.1 templates), and after, on v3.2 (`docs/archive/evidence-v3.2/F2-harness-result.txt` … `F7-templates-result.txt`):

| field | v3.1 → v3.2 | source | before (v3.1) | after (v3.2) |
|---|---|---|---|---|
| `hooks`: `spec-gate.mjs` (Stop) + `.claude/spec-gate.json` | none → the kit's Stop hook, modes off · shadow · active | [hooks: Stop input](https://code.claude.com/docs/en/hooks#stop-input), [Stop decision control](https://code.claude.com/docs/en/hooks#stop-decision-control) | «done» ended the turn by words; the evidence was read only at acceptance | one marker of two and «done» — blocked, the reason names F2; the full set — `SPEC_GATE_OK`; a new STOP line — the turn ends; caps, `no-progress`, no key and a dead address — code decides in ≤ 20 s; a live `claude -p` held 4 turns (`docs/archive/evidence-v3.2/F2-harness-result.txt`) |
| `hooks`: `abide.mjs` (SessionStart, UserPromptSubmit, PostToolUse, Stop) | user-level only → the kit's wrapper over Abide 0.0.9 | [Abide](https://github.com/coldteadotai/abide) (installed source 0.0.9), [PostToolUse decision control](https://code.claude.com/docs/en/hooks#posttooluse-decision-control) | its SessionStart told the executor to compile a rubric the executor may not edit; session state in the home directory | a fixture rubric: an edit printing the fixture secret gets «Abide: This edit appears to break a rule…», a live edit is repaired in the same turn, a clean edit is silent; the Stop block and the compile request become notes (`docs/archive/evidence-v3.2/F3-harness-result.txt`) |
| `hooks`: `toolgate-deny.mjs` (PreToolUse) + `.claude/toolgate.yaml` | user-level `toolgate hook` (allow, ask) → the kit's hook over `toolgate decide`, deny only; policy: `jev-1.13.0`, no task context, deny 0.9, force-push a static rule, audit under `/tmp/two-tier-v3`, ledger off | [Toolgate](https://github.com/RiskAverseTech/toolgate) 0.16.0 (`toolgate --help`, installed source), [PreToolUse decision control](https://code.claude.com/docs/en/hooks#pretooluse-decision-control) | t3: the user-level hook printed `allow` — `bin/two-tier-upgrade --help` ran outside the allow rules; its `ask` stopped the workflow agents (`HARNESS_FAIL`, `HOOKS_FAIL`) | p95 0.56 s; `git push --force` denied with a reason; no key, a hung `decide`, no policy — silence; the allow pair and the workflow agents green with the hook (`docs/archive/evidence-v3.2/F5-harness-result.txt`) |
| `launch.settings.json`: `enabledPlugins`, `pluginConfigs`, `env` | 3 plugins → plus Belay and Steer-or-Queue (shadow), Compact Adviser (`hint`), handoff, typesafe off; model pins in `env` | [settings-reference: pluginConfigs](https://code.claude.com/docs/en/settings-reference#pluginconfigs), [plugins](https://code.claude.com/docs/en/plugins) | t3: five layer plugins from the user's settings outside the table — `ENV_FAIL` | t3: 7 plugins equal the table; Belay's verdict in a live session is `shadow` — `pluginConfigs` of `--settings` reach the hook (`docs/archive/evidence-v3.2/F4-harness-result.txt`) |
| launch line `--setting-sources project,local` | none → set | [cli-reference](https://code.claude.com/docs/en/cli-reference#cli-flags), [agent-sdk settingSources](https://code.claude.com/docs/en/agent-sdk/claude-code-features) | the user's hooks and plugins entered the executor's session | t3: `HARNESS_OK`, `HOOKS_OK`, `ENV_OK` |
| launch line `--add-dir /tmp/two-tier-v3/skills` | none → the user's skills marked «да» | [skills: load from `--add-dir`](https://code.claude.com/docs/en/skills) | under `project,local` the user's skills do not load | graphify in `system/init` on t3; Quicksilver and Jev SEO stay out, their probes green |
| launch line `--no-chrome` | none in the template → set | [cli-reference](https://code.claude.com/docs/en/cli-reference#cli-flags) | the built-in `claude-in-chrome` could enter the executor's session (v3.1 gate) | a row of the table and the flag |
| launch line `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` | none → set | [mods overview](https://code.claude.com/docs/en/plugins/mods/overview), [compact-adviser](https://github.com/kunchenguid/compact-adviser) `register.ts` | Compact Adviser 0.1.12 inert: every handler waits for the variable that Claude Code no longer reads | set in the template line; `hint` checked statically (in `-p` the mod is silent) |
| launch line: start prompt `-- "$(cat docs/PROMPT.txt)"` | `/goal` typed by hand → the prompt as the last argument, after `--`: `--add-dir` and `--mcp-config` take several values and would swallow it | [cli-reference: `claude "query"`](https://code.claude.com/docs/en/cli-reference#cli-commands) | `docs/GOAL.txt` pasted after `/goal` | the pair on t3 starts from `docs/PROMPT.txt` in the order of the line; a line without `--` fails `check-harness` (`docs/archive/evidence-v3.2/F7-templates-result.txt`) |
| `permissions` (deny) | plus `Edit(/docs/PROMPT.txt)`, `Edit(/.claude/spec-gate.json)`, `Edit(/.abide/rubric.json)`, `Edit(/.claude/toolgate.yaml)` | [permissions](https://code.claude.com/docs/en/permissions) | the start prompt, the gate's questions, the rubric and the policy were not the team lead's files | the static check: deny covers the owner list |
| `bin/verify-phase`: `--setting-sources project,local`, `SPEC_GATE=off` | the user's settings in acceptance → `project,local` | [cli-reference](https://code.claude.com/docs/en/cli-reference#cli-flags) | `bin/check-verify`: the clean fixture got `NEEDS_WORK` — the user-level Toolgate refused every Bash call of the verifiers | `VERIFY_OK` (`docs/archive/evidence-v3.2/F7-templates-result.txt`) |
| `workflows/verify-phase.js`: start prompt | `docs/GOAL.txt` → `docs/PROMPT.txt` (else `docs/GOAL.txt`) | [workflows](https://code.claude.com/docs/en/workflows) | the scope reader read `docs/GOAL.txt` | the fixtures start from `docs/PROMPT.txt`; `VERIFY_OK` |

Mods of the layer, `claude plugin validate`:
- `handoff` 0.2.0 (`mods/handoff`), «Validation passed»:
  - `./register.tsx hooks: session.start, turn.complete, command.run{command=handoff}, ui.render{component=AbovePrompt}`
  - `./register.tsx calls: $.clock.after, $.clock.now (via writeHandoff), $.command.register, $.command.run (via clearAndResume), $.fs.write (via writeHandoff), $.model.fork (via writeHandoff), $.prompt.submit (via clearAndResume), $.session.root (via writeHandoff), $.session.turns, $.session.usage, $.state.get, $.state.set, $.store.get (via readLast), $.store.set (via writeHandoff), $.ui.log (via handoffFileOnly, writeHandoff), $.ui.resolve, $.ui.status, $.ui.toast`
- `compact-adviser` 0.1.12, «Validation passed»:
  - `./register.ts hooks: session.start, prompt.submit, command.run, turn.start, turn.complete, session.compact, command.run{command=compact-adviser}, config.describe{key="compact-adviser.typesafeApiKey"}, ui.close{id=compact-adviser}, ui.render{component=Pane}`
  - `./register.ts calls: $.clock.after, $.clock.now, $.clock.sleep (via judgeCheckpoint, placeRing), $.command.register, $.command.run (via submitBeforeCompact), $.config.list, $.config.set (via saveRow), $.env.get (via isActivated, judgeEndpoint, logHome, resolvedKey, testEndpoint), $.fs.read (via appendTypeSafeLog, resolvedKey), $.fs.write (via appendTypeSafeLog), $.http.fetch (via judgeCheckpoint), $.prompt.submit (via submitBeforeCompact), $.session.compact (via compactNow), $.session.cwd (via logHome), $.session.id, $.session.messages (via judgeCheckpoint), $.session.usage (via changeMinimum, judgeCheckpoint, settle, statusText), $.store.delete, $.store.get, $.store.keys, $.store.set, $.ui.ask (via confirm), $.ui.close, $.ui.focus (via placeRing), $.ui.invalidate, $.ui.log, $.ui.open (via openPane), $.ui.panes (via paneOpen), $.ui.resolve, $.ui.status (via armBeforeCompact, clearStatus, compactNow, judgeCheckpoint), $.ui.toast`

Known debts of the layer: Abide 0.0.9 and Compact Adviser 0.1.12 call the floating `jev-latest` with no setting — the package version does not fix the model, the server resolves the alias (`jev-1.13.0` on 09.10), and a rubric calibrated on one version may judge with another; Steer-or-Queue is pinned through `JEV_ROUTER_JEV_MODEL`, Quicksilver through `QUICKSILVER_MODEL`.

## v3.1 — 2026-10-07 — ultracode in full: the executor's standard mode, its environment equal to a table, hooks proven on workflow agents, acceptance by a saved workflow
- **Ultracode is the executor's standard mode** (D4, N2): `--effort ultracode` in the launch line of `docs/PROCESS.md`;
  workflow agents edit only in their own worktrees or only read, the main session commits by exact paths, push to
  `main` is forbidden (`kit/CLAUDE.md` — the auto-mode classifier reads it). Taught by: the operator, 07.10 — «изучи все
  его возможности и давай использовать его по полной»; the facts — `claude/ultracode-2026-10-07.md`.
- **Environment = table:** the Environment table of `docs/PROCESS.md` (tool · form · id · on · feature · install · remove)
  drives `enabledPlugins`, `skillOverrides` and the MCP of the launch line; `bin/check-harness` compares `system/init` of
  the pair with it — `ENV_OK`. Taught by: Cowork skills, user plugins and MCP leaking into the executor (team lead's
  measurement 07.10), and the v3 rule «`mcp_servers` 0» that cut Context7 off too.
- **Acceptance by a saved workflow:** `/verify-phase` (`kit/.claude/workflows/verify-phase.js`) — per feature a fresh
  check run, edge cases against «done» and a mutation (`claude-sonnet-5-5`, own worktree), a refuter per blocking
  candidate, a judge (`claude-opus-5-5`, schema, ≤5 blocking); `bin/verify-phase` clones the pushed HEAD, runs the gate,
  holds the 30-minute limit (`VERIFY_TIMEOUT`) and writes `docs/evidence/verify-<sha>.txt`; `/accept` and the GOAL
  template's (A) run it. Proven on fixtures by `bin/check-verify` (`docs/archive/evidence-v3.1/F4-verify-result.txt`). Taught by:
  acceptance longer than the leg (06.10: 4 h against 1 h; 07.10: ~35 min by one subagent).
- **Ownership, tails 3 and 5:** `budgets.json` is a team-lead file; the commit lint takes the owner list at each
  commit's parent, so the commit that adds an entry is green and an executor's later edit is red; END STATE catches a
  team-lead file with a sign stuck to it (`—`, `…`, `‘’`, `„“`, `@`, a leading `/`, `#`, `{}`, `&&`, `’s`), a root-level
  team-lead file and a two-level team-lead directory without `/`. Taught by: `docs/archive/evidence-v3/accept-8f1d232.txt`.
- **Harness fields** — the doc, and the same control pair (`bin/check-harness`, `docs/LAUNCH.md`) before, on kit v3
  (`docs/archive/evidence-v3/F4-harness-result.txt`, `main` @ `7957d68`), and after, on v3.1 (`docs/archive/evidence-v3.1/F1-harness-result.txt`):

| field | v3 → v3.1 | doc | before (v3) | after (v3.1) |
|---|---|---|---|---|
| `worktree.baseRef` | not set (`fresh`) → `"head"` | [settings-reference](https://code.claude.com/docs/en/settings-reference#worktree-baseref), [worktrees](https://code.claude.com/docs/en/worktrees#choose-the-base-branch) | a workflow agent with `isolation: 'worktree'` read `main-base` — the tree of `origin/main`, not the branch (`docs/archive/evidence-v3.1/F1-baseref-result.txt`) | the same agent read `head-feature` — the branch HEAD with its unpushed commit |
| `workflowSizeGuideline` | `small` → `medium` | [settings-reference](https://code.claude.com/docs/en/settings-reference#workflowsizeguideline), [workflows](https://code.claude.com/docs/en/workflows#set-a-size-guideline) | advice: fewer than 5 agents | advice: fewer than 10 agents (D4); not visible in the pair — advice to the model, not a cap; `claude doctor` 0 settings errors |
| `permissions.allow` | none → `Bash(bin/check-*)`, `Bash(bin/gate-*)`, `Bash(make ci)` | [permissions](https://code.claude.com/docs/en/permissions#wildcard-patterns), [workspace trust](https://code.claude.com/docs/en/permissions#project-allow-rules-and-workspace-trust) | run `allow` under `dontAsk`: `bin/check-ci` denied; under `-p` even an exact rule in `.claude/settings.json` is denied — the folder is never trusted | the kit's rules passed with `--allowedTools`: `bin/check-ci` runs, `bin/two-tier-upgrade --help` denied; the executor's interactive session applies them after the trust dialog |
| launch line `--effort` | `medium` in `docs/LAUNCH.md` → `ultracode` in the PROCESS launch line | [model-config](https://code.claude.com/docs/en/model-config#adjust-effort-level), [workflows](https://code.claude.com/docs/en/workflows#let-claude-decide-with-ultracode) | run1 and run2 green with `--effort medium` | run1, run2, `allow` green with `--effort ultracode`; `system/init` carries no effort or ultracode field — the flag row of the Environment table proves it |
| `launch.settings.json`: `enabledPlugins`, `skillOverrides` | only `autoMode.environment` → plus the plugins and skills of the Environment table | [settings-reference](https://code.claude.com/docs/en/settings-reference#enabledplugins), [skills](https://code.claude.com/docs/en/skills) | the pair ran with `--setting-sources project,local`: user plugins and skills never loaded, so `system/init` was not the executor's environment | the pair runs the PROCESS line as is: plugins 3 (ponytail, pr-review-toolkit, pyright-lsp) plus the `@builtin` ones, Cowork skills 0 — on the kit repo and on t3 (`docs/archive/evidence-v3.1/F2-harness-result.txt`) |
| launch line `--strict-mcp-config --mcp-config` | none → exactly the MCP rows of the table | [cli-reference](https://code.claude.com/docs/en/cli-reference#cli-flags), [mcp](https://code.claude.com/docs/en/mcp) | `mcp_servers 0` in both runs — the v3 rule «no servers» | `context7 connected` in both runs; the plugin's remote Context7 (`needs-auth` in `-p`) is off |
| `bin/check-harness`: environment = table | `mcp_servers` 0 and no `claude.ai …` → `system/init` equals the Environment table of PROCESS | [headless](https://code.claude.com/docs/en/headless), [agent-sdk](https://code.claude.com/docs/en/agent-sdk/typescript) | a server outside the table — only a WARN | missing, extra or not `connected` — FAIL with the name; both sides by fixtures (`--self-test`, in `make ci`) |
| `hooks`: `steer.sh` | the first caller takes the note → only the main session: a call with `agent_id` leaves `STEER.md` | [hooks](https://code.claude.com/docs/en/hooks#common-input-fields) | probe `agent` on the v3 hooks: the workflow agent's own call emptied `STEER.md`, its `cat` saw nothing (`docs/archive/evidence-v3.1/F3-harness-v3-baseline.txt`) | the note stays for the main session; run1 still delivers it to the main session (`docs/archive/evidence-v3.1/F3-harness-result.txt`) |
| `hooks`: `refuse_sweeping_commands.py` | refusal «— CLAUDE.md Rules» → a self-contained reason | [hooks](https://code.claude.com/docs/en/hooks) | probe `guards`: the refusal points to «CLAUDE.md Rules», a section that does not exist | the refusal names the rule itself; `git add -A` refused on the main session and on a workflow agent, index empty |
| `hooks`: `kill-switch.sh` | unchanged; proven on a workflow agent | [hooks](https://code.claude.com/docs/en/hooks), [workflows](https://code.claude.com/docs/en/workflows) | run2 only: the main session stops at its first call | probe `kill`: the agent creates `AGENT_STOP` itself, its next call is refused, the probe file is not created — same on v3 and v3.1 |
| `permissions` (deny) on a workflow agent | unchanged; proven | [sub-agents](https://code.claude.com/docs/en/sub-agents#permission-modes), [workflows](https://code.claude.com/docs/en/workflows) | proven on the main session only | Write to `docs/STATUS.md` denied on the main session and on the agent: «File is in a directory that is denied by your permission settings» |
| `workflows/verify-phase.js` | none → the saved workflow `/verify-phase`, launched by `bin/verify-phase` | [workflows](https://code.claude.com/docs/en/workflows#save-the-workflow-for-reuse), [headless](https://code.claude.com/docs/en/headless#background-tasks-at-exit) | acceptance by one fresh subagent: 07.10 `role-checker`, ~19 min, one finding (`docs/archive/evidence-v3/accept-8f1d232.txt`) | fixtures: a planted edge defect → `NEEDS_WORK`, the defect named; a clean phase → `PASS`, 0 blocking; past the limit → `VERIFY_TIMEOUT`; ~80 s per one-feature fixture (`docs/archive/evidence-v3.1/F4-verify-result.txt`) |

## v3.0 — 2026-10-06 — budgets enforced by code, the result instead of the path, the harness from the official docs, a living intent pinned in the SPEC
- **Budgets:** `bin/check-budget` + `budgets.json` (kit defaults; a project may only tighten) — skills, CLAUDE.md, the
  intent, SPEC feature lines and pin, open-question markers, PROGRESS, PLAN, GOAL, reviews, ownership of team-lead
  files; every rule has a green and a red fixture (`--self-test`), every template an example (`--templates`); CI on
  push (`.github/workflows/two-tier.yml`, `bin/check-ci`). Taught by: the 06.10 retro — the `team-lead` skill ×7,
  ~0.6 M characters of mandatory reading at executor start, acceptance longer than the leg (`intent/INTENT.md`, D1).
- **Intent:** one living `intent/INTENT.md`, pinned in the SPEC by `git hash-object`; a pivot is a change-log line and
  a new pin, not a layer of amendments (D3). Taught by: an intent outdated after three pivots that lived in reviews.
- **Skills:** `team-lead` and `grilling` leave the kit — Cowork holds them, copies live in `docs/drafts/`; `plan-phase`
  serves only phases with paid or irreversible steps; `accept` runs a fresh evaluator and writes
  `docs/evidence/accept-<sha>.txt`, never STATUS.
- **Upgrade:** `bin/two-tier-upgrade <path>` — branch `kit-v3`, nothing pushed, nothing deleted, team-lead files left
  to the team lead, a second run changes nothing.
- **Harness fields** — the doc, and the same control pair (`bin/check-harness`, `docs/LAUNCH.md`) before, on the v2 kit
  (`docs/archive/evidence-v3/F4-harness-v2-baseline.txt`), and after, on v3 (`docs/archive/evidence-v3/F4-harness-result.txt`):

| field | v2 → v3 | doc | before (v2) | after (v3) |
|---|---|---|---|---|
| `model` | `opus` → `claude-opus-5-5` | [settings-reference](https://code.claude.com/docs/en/settings-reference#model), [model-config](https://code.claude.com/docs/en/model-config) | static FAIL: the alias moves by itself; init `claude-opus-5-5` only via `--model` | static OK; init `claude-opus-5-5` |
| `ultracode` | `true` → removed | [settings-reference](https://code.claude.com/docs/en/settings-reference#ultracode), [workflows](https://code.claude.com/docs/en/workflows) | static FAIL: a workflow planned for every task | removed; the keyword stays for parallel items |
| `effortLevel` | not set → not set | [model-config](https://code.claude.com/docs/en/model-config) | — | effort lives in the launch line, `--effort medium` |
| `autoMemoryEnabled` | `false` → `false` | [settings-reference](https://code.claude.com/docs/en/settings-reference#automemoryenabled), [memory](https://code.claude.com/docs/en/memory) | `false` | `false`: MEMORY.md is not read at start |
| `disableClaudeAiConnectors` | — → `true` | [settings-reference](https://code.claude.com/docs/en/settings-reference#disableclaudeaiconnectors), [mcp](https://code.claude.com/docs/en/mcp) | 5 `claude.ai …` servers in both runs | 0 in both runs |
| `subagentPromptCacheTtl` | `"1h"` → removed | [settings-reference](https://code.claude.com/docs/en/settings-reference#subagentpromptcachettl) | not visible in the pair: no subagent | removed: one evaluator per acceptance does not need the dearer hour-long cache writes |
| `workflowSizeGuideline` | `small` → `small` | [settings-reference](https://code.claude.com/docs/en/settings-reference#workflowsizeguideline) | not visible in the pair: no workflow | kept: it bounds the spend of a keyword-started workflow |
| `permissions` (deny) | 7 rules → 9 `Edit(…)` on the team-lead list | [permissions](https://code.claude.com/docs/en/permissions) | 5 of 9 team-lead files covered; PLAN (the executor's file in v3) and the archive denied | 9 of 9, no `Write(…)` rules (never consulted) |
| `hooks`: `kill-switch.sh` | `decision: block` → `continue: false` + `stopReason` + deny | [hooks](https://code.claude.com/docs/en/hooks) | run 2: one call denied, `terminal_reason completed` — the model stopped by itself | run 2: `hook_stopped` at the first call, the probe not created |
| `hooks`: `steer.sh` | a blocking order → a factual note in `additionalContext` | [hooks](https://code.claude.com/docs/en/hooks) | run 1: the marker arrived by blocking the call | run 1: the marker arrived, the call ran, the note came with its result |
| `hooks`: paths | relative `.claude/hooks/…` → exec form with `${CLAUDE_PROJECT_DIR}` | [hooks](https://code.claude.com/docs/en/hooks) | static FAIL | static OK |
| `hooks`: `verify-gate.sh`, `track-read.sh` | → `docs/archive/kit-v2/` | [hooks](https://code.claude.com/docs/en/hooks) | inert: the gate guards `test-results.json`, which the kit never writes | removed |
| `hooks`: `commit-on-stop.sh` | → archive | [hooks](https://code.claude.com/docs/en/hooks) | 0 commits in the copy (no tracked files); in a project it commits `-am`, against exact-path commits and the ownership lint | removed |
| `hooks`: `test-output-filter.sh`, the graphify hint | → archive | [hooks](https://code.claude.com/docs/en/hooks) | inert in the pair; both inject orders, the doc asks for facts | removed |
| `rules/graphify.md` | → archive | [memory](https://code.claude.com/docs/en/memory) | loaded at every start | the Environment row of PROCESS carries the tool |
| `hooks`: `refuse_sweeping_commands.py` | kept, exec form | [hooks](https://code.claude.com/docs/en/hooks) | runs | runs: stage by path, not the whole tree |
| `launch.settings.json` | new: `autoMode.environment` with `"$defaults"` | [auto-mode-config](https://code.claude.com/docs/en/auto-mode-config) | init `permissionMode auto` | init `permissionMode auto` |
| `claude doctor` | — | [cli-reference](https://code.claude.com/docs/en/cli-reference) | 0 settings errors | 0 settings errors |

## v2.0 — 2026-09-18 — a harness is assembled from the platform's own primitives, never written a second time; what a check proved lives in a file, because the transcript no longer holds the work
- **Tiers:** two tiers and no bus between them — the operator decides three times (spec yes/no · a letter at a
  stop point · the gate he opens himself) and never retells a report; the channel between the tiers is the repo
  folder, which Cowork reads (SPEC, STATUS, `docs/evidence/`). Taught by: four days of v1 — 44 sessions of
  «report is ready → make session», the operator's own hands carrying every hand-off between two applications.
- **Kit:** everything a project receives is one folder, `kit/`, and one command puts it there —
  `cd <project> && bin/two-tier-init . && claude`; a rule that is not in the kit is not shipped. Taught by:
  decisions D1–D17 of the 10.09 retro never reached the repository — it stood on v3.20 of 09.09 while the live
  rules lived in a Cowork card and a generator script.
- **Harness:** the harness is the official primitives of `anthropics/cwc-long-running-agents` (Apache-2.0)
  copied verbatim — five hooks and `evaluator.md`; where an official file exists we write no analogue of our
  own, and only the two Bash guards are ours (`refuse_sweeping_commands.py` from v1, the test-output filter).
  Taught by: the self-written brain-init M6 — its v2 deltas (`docs/archive/brain-init-v1/M6-v2-deltas.md`) were
  written, carried in this file as a debt, and never applied in a single live repository.
- **Evaluator:** acceptance is a separate pass launched by `/accept` — Haiku, no Write/Edit, the diff against
  SPEC and PLAN by `REVIEW.md`; the executor never verifies itself with subagents, and «verify with a subagent
  / double-check / re-verify» is banned from every prompt of the kit. Taught by: the 10.09 retro (D17) — under
  ultracode the executor plans its own workflow, so a self-check grades the assumptions of the session that
  made them.
- **Evidence:** every check writes its output to `docs/evidence/<fid>-<check>-result.txt` as well as showing
  it, `verify-gate` refuses a result the session has not read, and the evaluator reads the files. Taught by:
  the move to ultracode (18.09) — a workflow's intermediate results live in the script's variables and never
  reach the transcript, so «show the command and its output in the transcript» (D8) proves nothing about
  a workflow's subagent.
- **Diet:** `kit/CLAUDE.md` ≤40 lines, the team lead's card ≤80 and patterns only, a feature is a vertical
  slice that fits one fresh context window, `/goal` ≤4000 characters. Taught by: the card at
  `docs/archive/team-lead-v3.23.md` — 404 lines, one rule added per stop, against Anthropic's own «bloated
  files cause Claude to ignore your instructions».
- **Archive:** nothing of v1 is deleted — every file has an address in `docs/archive/` (`team-lead-v3.20.md`,
  `team-lead-v3.23.md`, `team-lead-v1-README.md`, `executor-kit-v1/`, `templates-v1/`, `brain-init-v1/`,
  `new-project.sh`) and the phase's `git log --diff-filter=D` is empty. Taught by: the move's own registry —
  the v1 card's README was named by no v2 document, and without a line for it the folder would have gone by
  hard delete with the card's history inside; it is now `docs/archive/team-lead-v1-README.md`.

## v3.20 — 2026-09-09 (evening) — every non-purchase line of a paid runbook is rehearsed in the paid session's own call boundaries; the close is written from the previous leg's real close
- **§7:** a runbook gate drilled is not a runbook rehearsed: every line that is not the purchase itself is executed at $0
  in the prep session the way the paid session will execute it — a variable exported in one call and used in another,
  a value computed in one block and read in the next, a close whose arithmetic the platform's billing does not share —
  and the close is written from the previous leg's REAL close record. Taught by: the origin project's third verifier
  pass over one leg — an API key exported in one shell call and consumed in the next (shell state does not survive a
  call), and a close expecting the run record's wall time against a serverless walk that bills worker uptime (the
  previous leg had closed without that expectation); both would have stopped the paid session at $0.

## v3.19 — 2026-09-09 (late afternoon) — a money gate is re-read on the next leg's population; the runbook carries what ran; a control a ruling orders is run first
- **§6:** a money gate written for one population (a reserve, a pack size, a floor) is re-read on the next leg's
  population before its purchase — the dry run exercises the in-run gates at the registered cap, or the verifier
  computes them with the emitter's own functions. Taught by: the origin project's verifier before the c3 leg —
  an in-run room gate sized for a 3 000-page leg (one wedged job in reserve + a pack sized by time) would have
  ended a 30-page leg before its first page at the cap the whole-leg price cleared by 63 %; the cap moved by the
  operator's word, the code untouched before the purchase.
- **§6:** a runbook line the last paid run had to replace mid-session (a launch form the harness killed, a
  close that refused) is replaced at that run's acceptance — the record carries what RAN. Taught by: the C2
  runbook still carried the foreground launch its own log shows killed twice; the c3 runbook inherited it.
- **§3.5:** a control a ruling orders is run once by the team lead before the ruling is issued, or worded as the
  delta to show. Taught by: a «byte-identical» control over a record that embeds a live reading — unreachable, a
  deviation for the executor to name.

## v3.18 — 2026-09-09 (afternoon) — a ruling's premise is measured; an inert field is retired; a refusal is attributed only to a documented mechanism
- **§3.5:** what a ruling calls existing, shared or unmoved was shown that day by a run of the function that decides it
  on the real inputs — never read off a comment, a table or memory. Taught by: the origin project's (l)3 «both channels
  carry ONE existing chain id — nothing sealed moves» — the fold function folded neither channel; the «$0 extension»
  was a change of a measured layer, found by the executor one session later (a right stop, the team lead's fork).
- **§5:** a harness field the platform can no longer act on (a rule that only matters in a mode the record's first gate
  refuses) is inert — retired that day, not maintained per run. Taught by: two allow rules written for a symptom's
  command (`pod create`) while the leg created a template and an endpoint, in a mode where allow rules have no effect;
  the runbook gate refused by construction.
- **§5:** the attribution of a refusal follows the same rule as a harness rule — the documented mechanism, quoted, or
  «undocumented» beside the proven workaround; one refusal of a documented kind meets the documented path, never probes.
  Taught by: a ruling that blamed the classifier for a copy refused in the classifier mode — the same refusal returned in
  bypass mode, because deny rules reach into the shell's file commands in every mode (the docs said so).
- Templates: `templates/PROCESS.md` «Harness fields» — no allow rules while the mode ignores them; deny rules reach into
  the shell (read tool / write tool / read-only comparison); `templates/runbook-paid-run.md` §0 — the mode gate FIRST,
  then the fields check; no allow-rule grep.

## v3.17 — 2026-09-09 — a field is a field only where the platform reads it without a hand
- **§5:** a value the operator must retype at every launch is a ritual wearing a field's name and fails in the
  first session that forgets it; the paid record's gate reads the value the platform actually applied, never the
  one the operator meant to type. Taught by: the origin project's s37 — the session after the launch line had been
  declared a field ran in the classifier mode anyway (the flag was not in effect; the classifier refused a copy and a
  read-only command); the mode moved to the operator's user-level default, the harness stamps the applied mode into a
  file and the paid runbook's first gate reads it.
- Templates: `templates/PROCESS.md` «Harness fields» — the mode lives where the platform reads it without a hand,
  the harness stamps the applied value, the paid runbook's first gate reads the stamp.

## v3.16 — 2026-09-08 (evening) — a harness rule is written from the platform's docs; harness fields, not rituals
- **§5:** every setting that changes what the harness does to the money path (the session's permission mode, its
  effort, its orchestration, the timeouts of its guards) is a FIELD of the harness and of the paid run's record, set
  once and read at $0 — never a per-session ritual of the operator's hands; a harness rule is written from the
  platform's documentation read that day, never from a transcript's symptom, and its proof is deterministic (a field
  shown in the file, a rule shown to match the command's exact prefix), never «a harmless call passed»; the pre-issue
  questions gain «what does the PLATFORM say this setting does». **§7:** a kit's template is a law multiplier — a
  template defect is fixed in the template and in every live copy the same day; automatic multi-agent orchestration
  inside an executor session is a cost line the retro reads (agents spawned, dead on limits, findings unverified).
  **§10:** a planned tooling review gets the same pass; a rule it retires is named with what it failed to prove.
- **Kit and templates:** `executor-kit/claude-config/settings.json` — hook `timeout` values in SECONDS (they were
  written as milliseconds: 5000 = 83 minutes; the platform's default is 600 and a timed-out `PreToolUse` command hook
  does NOT block, so a guard's timeout is generous by design), ONE sequential `SessionStart` hook (hooks of one event
  run in parallel — the refresh and the cache injection raced), the effort field and `ultracode: false`;
  `templates/PROCESS.md` gains «Harness fields»; `templates/standing-prompt.md` — nothing is typed before the paste;
  `templates/runbook-paid-run.md` — the launch line as a field and a harness-fields gate in §0.
- Taught by: the origin project's tooling audit of both tiers against the platform's documentation (08.09) — the
  classifier's two denials of the paid create (s33) were the broad shell allow rule being suspended in the classifier
  mode while narrow rules resolve before it; the v2.3 rule written from that symptom («a harmless call of the same
  shape passed») proved nothing; sessions had been launched in two different permission modes without a record; the
  millisecond timeouts sat in the live repo, in the kit and in the brain-init template.

## v3.15 — 2026-09-08 — the graded instrument is the product's pipeline end to end
- **§2:** every filter the product applies between the model's answer and the screen (an evidence hook, a dedup, a
  post-processing layer) sits inside what the grader scores, or the phase file names the exception BEFORE the first
  purchase; a number measured upstream of a product filter is the model's number, disclosed as such. A gap found
  after the fact is closed at $0 by the product's own functions over the same answers; the reading is never
  rewritten, the record is never widened so the product reproduces the instrument. **§3.4 (h)** the fork-catalogue
  default; **§5** «does the grader score the rows the product ships?» joins the pre-issue questions; **§6** a gap the
  executor measured on one axis is re-measured by the team lead on every axis the grader scores. Taught by: the
  origin project's s35 — five dev iterations and two frozen sets had graded the model's raw answer while the product
  screened it through its evidence hooks before the post-processing layer; the loop reproduced 0.7411 / 0.7937 where
  the screen published 0.7500 / 0.8021 (the executor named the subject row, not the signal delta).

## v3.14 — 2026-09-06 (late) — a decision table is written in the operator's words
- **§8:** a decision table says first what the number measures and why it is what it is, then per branch what it
  buys, costs and changes on the map, the recommendation first; no metric, set or guard names the operator did not
  coin; a table the operator has to ask about is rewritten in plain words before it is answered. Taught by: the
  origin project's operator answering the second fork of the evening with «explain it to me, I am lost» — the
  branches were priced and dated but written in the team lead's jargon; the plain explanation settled it in one turn.

## v3.13 — 2026-09-06 (night) — the harness's permission is proven at $0; the reference's ties are counted before the verdict; a second red frozen set changes the instrument's class
- **§5:** the paid session's irreversible command is pre-authorised in the executor's harness and PROVEN at $0 in the
  prep session by a call of the same shape that cannot spend; a permission prompt inside a paid session with an open
  money line is a stop, and the team lead's. Taught by: the origin project's s33 — the harness classifier denied the
  create twice with the line anchored (≈ 16 min of anchor age, $0).
- **§6 triage (2):** the reference's own declared ties are counted before the verdict; a verdict the ties alone could
  flip is reported with both numbers; the codebook is the first suspect. Taught by: holdout-2 read red on subject
  (0.7054) with 15 of 33 misses on the gold's own declared ties.
- **§6:** a frozen set red for the second time under one law family is not answered by another tuning round — a dev
  bar fit on one set is a fit, not a forecast; the next attempt is a different instrument class measured at $0 on
  every spent set, and the next frozen set's purchase is gated on that $0 reading. Taught by: two holdouts at ≈ 0.71
  after a dev bar of 0.8857 taken on the fifth tuning round.

## v3.12 — 2026-09-06 (evening) — one registration per line; a runbook gate is a command that can fail the session
- **A registration is ONE per line** (fork catalogue (g)): once a line has swallowed any cent — the always-on drip across
  a billing boundary, a resource the liveness gate killed — its own remaining, not the cap, is its measure and a second
  registration at the full cap refuses; a registration repeated after the anchor (a price move, a retry an hour later)
  is a NEW line of (b) with its own anchor, or is issued against the anchored line's printed remaining on the operator's
  word — and the runbook's recovery paths say which BEFORE the first purchase.
- **A runbook gate is a command that can fail the session** (§7): a non-zero exit with the next command chained on it,
  placed BEFORE the step it guards; a printed «STOP» that exits 0 is a note to a human who is not in the room; a gate
  placed after the command it guards (a pin check after the anchoring registration) guards nothing.
- **The hard stop firing is a branch written in advance** ((f)): the post-run reading may refuse at the cap, the close then
  settles on the walk alone, and the runbook says so before the purchase so nobody retries the reading.
- Taught by: the fresh pre-purchase verifier of the origin project's holdout-2 shot (no stop happened — the findings
  entered PROCESS «Money» v2.2 and PHASE v17 the same hour, the paid session opens with a three-line runbook fix).
  Templates: `templates/PROCESS.md` «Money» and the paid-run runbook template gain the three defaults.

## v3.11 — 2026-09-06 — registration ≠ opening; the standing law beats a ruling on a mechanic
- The money line is OPENED (its anchor taken) inside the paid session, minutes before the resource is created —
  never a session earlier: an aged anchor drinks the always-on drip into the close's reference and the band shuts
  within hours (fork catalogue (f), (g)). The record is written and read at $0; the team lead's pre-purchase
  reading is the dry run and the code at HEAD; where the emitter registers and opens in one command, that command
  runs in the paid session and the registration is read at acceptance against the dry run.
- A ruling sets choices and never re-sequences a mechanic PROCESS.md already sequences; where the two disagree,
  the executor follows PROCESS.md, names the contradiction in PROGRESS and does not stop. Two pre-issue checks
  join §5: «what ELSE does this command do» and «does PROCESS.md already sequence it».
- Taught by: the origin project's stop s29 — a ruling put the registration (which also anchors the line) in the
  $0 prep session while PROCESS opened the line «before the pod» in the paid one; measured on the previous run,
  the whole 2.73 % drift of the close was the volume's drip over the anchor's age. Templates PHASE §6 (seventh
  default), PROCESS «Money» and the paid-run runbook (§1) carried the same contradiction and are fixed.

## v3.10 — 2026-09-06 — diet: patterns only
- The card carries patterns only: a tool name, a flag, a price, a path or a platform word in it is a defect
  of the card. Mechanics moved to the project's `docs/PROCESS.md` («Money» v2 in the origin project).
- Taught by: the operator's review — the card had absorbed guard flags, hardware names and sums over two days.

## v3.9 — 2026-09-05 — a fresh verifier BEFORE every purchase
- A fresh-context verifier reads the money paths end to end with the commands the paid session will run
  (the emitter's defaults, every reader of the reply file, the guard calls, the runbook at HEAD) before the
  purchase, not after a stop; the purchase is the session after the team lead has read the registration.
- The hardware tier, its price and the money line are FIELDS of the record read from the platform's listing,
  never constants or defaults of the emitter; a default line name is the next refusal.
- A new row shape in the reply file (an error reply) is read by every reader of that file in the same fix.
- The platform's backstop is derived from the cap at the registered price; a borrowed minute-constant that
  bites first bounds the reading, not the money.
- Taught by: a verifier run before the fifth dev iteration found five latent bites (a refusing default line,
  a hard-coded card, two readers dying on the new error row, a borrowed backstop) — a stop that did not happen.

## v3.8 — 2026-09-05 — a serving failure is a transport defect; a close needs its reference
- Out-of-memory, a crash, a dead process: the instrument never moves, the serving environment does; the runner
  reports a failed unit as an ERROR reply and exits non-zero, so the client never waits out a deadline.
- A law that grew is a new memory footprint: its longest render is measured before the first paid run; the
  smoke holds the longest unit first.
- A money line's close settles against its POST-RUN reading, taken before any next run; a line whose readings
  all predate its run closes on the billing walk alone and never takes a late reading; a ruling that orders a
  close names that reading with it.
- Taught by: an OOM on the longest render of a grown law (the client waited out the deadline — most of the run's
  cost was the wait), then a close ordered against a pre-run reading that could never pass.

## v3.5–v3.7 — 2026-09-05 — money defaults
- One paid run = one money line (own name, own anchor, the run's cap, closed by its run record in the same
  session); an open multi-run line carries no new run; the registration reads the guard named with its line.
- The rate is the whole-run mean of the slowest host seen, never a smoke of three, never a borrowed sibling; when
  the dear corner refuses, the leg issues on the mean corner with the cap as the hard stop and no band gate.
- A cap named in a ruling is quoted from the dry run that priced it, never typed. A fence for a later step is an
  estimate, never a cap.
- A rule that retires a bound is checked on every leg that reads the bound. A ruling that orders a command is
  checked against the command's own gate before it is issued.
- Taught by: three money stops in one day, all the team lead's — a typed cap, a borrowed rate that outlived the
  smoke, a cap registered on a multi-run line whose guard the registration never read.

## v3.1–v3.4 — 2026-09-04/05 — the fork catalogue, the red-bar triage
- The phase file gets a FORK CATALOGUE written before the first item: validity of a paid reading, the second
  instance of anything, growth of a pinned structure (producers take paths as parameters; every decision field
  of a record branches on the leg), a caught product defect (one test, both directions, no stop), a test that
  pinned a literal of the record.
- The reference is drawn from the product's population, never a superset; a spent frozen set is demoted to a
  reading; the instrument on the frozen set is byte-for-byte the one that took the dev bar.
- Red → triage: (1) was the run complete, (2) the reference and the grader, (3) only then the law.
- Taught by: four stops in a day (a transport truncation read as a red bar, a population parameterised under
  another leg's decision table, a test pinning a literal of a moved record, a planned read with two questions
  the phase file could have answered).

## v3 — 2026-09-03 — process v3
- One phase file (≤150 lines) with a feature list of checks; one progress file for the executor (≤60 lines);
  a standing prompt instead of `/goal` for phases with stop-points; rulings ≤12 lines that decide and never
  legislate; the law diet (a test only for a product defect or a data invariant; the guard set frozen for a
  stage); process caps (STATUS ≤60, brief ≤5); one item per session, ≥2 sessions a day, ≤1 stop a day.
- Taught by: eight pauses of one phase, a 15:1 verification-to-product line ratio, 45 % process commits, and
  an evaluator that could not honour a pause.

## v2.1 → v2.5 — 2026-08-26 … 09-02 — the two-tier scheme
- Universal skill separated from project mechanics (`docs/PROCESS.md`); roles and what is never delegated;
  product truth first; pre-registration and one attempt; models and effort named per task.
- Taught by: a week lost on an adapter that a stop-rule should have closed earlier; the operator's audit
  against Anthropic's and Karpathy's 2026 guidance.
