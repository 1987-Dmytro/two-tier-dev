# PROCESS — <project> — the mechanics the skill deliberately does not carry (team-lead file)

<!-- Everything concrete lives here: tool names, flags, ledgers, pins, languages, model choices. The skill
     card carries only patterns; the phase file carries this phase's rules; rulings carry decisions. -->

## File ownership (single writer per file; enforced by `.claude/settings.json` → `permissions.deny`)
- Team-lead files — the executor reads and commits them BY PATH, never edits: `docs/STATUS.md`, `docs/PRODUCT.md`,
  `docs/SPEC*.md`, `docs/PROCESS.md`, `docs/PHASE-*.md`, `docs/reviews/**`, `docs/labels-*.jsonl`, `docs/CODEBOOK-*.md`.
- Executor files: `src/`, `tests/`, `scripts/`, `results/`, `config/`, `knowledge/**`, `docs/plans/**`, `docs/reports/**`,
  runbooks, `.claude/**`.

## Cadence per phase
Phase file → (plan only when the diff is not a sentence, ≤80 lines) → standing prompt into a FRESH session, one
item per session, the check shown, commit by path, PROGRESS updated, a stop ends the turn → the operator relays
«done, check it» → acceptance by diff, artifact and a re-run check → tick, one decision line, STATUS with its date.
Two failed corrections in one session → one decision line, fresh session. `/goal` only for a single session with
one measurable end and no human decision inside.

## Models and effort (named per task; effort is a FIELD of the harness, never a per-session ritual)
Executor = <model> (a model change re-issues the standing prompt — at a phase boundary, never inside a paid step).
Team lead = <model>. Verifier = a fresh-context subagent for money, secrets, user input, and before every purchase.

## Harness fields (every setting that changes what the harness does to the money path is a field, read at $0)
<!-- Written from the platform's documentation read that day — quote the mechanism beside each rule; never from a
     symptom in a transcript. The proof of a field is deterministic: the field shown in the file, a rule shown to
     match the command's exact prefix — never «a harmless call passed» (a harmless call passes without any rule). -->
- **Launch line** of every executor session: `<the exact command, with its permission mode>` — a field here and of every
  paid runbook's §0, never an accident of the day; what protects the repo in that mode: `<deny rules · guard hooks · the
  money guard in the repo's own scripts>`, with the platform's sentence that says they hold in that mode.
- **Effort and orchestration:** `.claude/settings.json` → `env.<effort variable> = <level>` and `<orchestration key>: false`;
  an automatic fan-out is switched on only by `<session command>` in a session the team lead names (an audit, a sweep) —
  never for an item or a paid run; the retro reads agents spawned / dead on limits / findings unverified per session.
- **Narrow allow rules** for the paid CLI's create and release commands only (`<rule for create>`, `<rule for release>`) —
  broad rules are suspended by the classifier mode, narrow ones resolve before it; no other allow rule: one that never
  fires is deleted at the retro.
- **Hook timeouts** in the platform's unit (<seconds>): guard hooks generous (a timed-out guard does not block — a short
  timeout is a hole), context hooks short; hooks of one event run in parallel — a data dependency lives inside ONE command.
- **The check** of the fields, run by the executor when the file changes and by the team lead at acceptance:
  `<one-line validator over .claude/settings.json → "HARNESS FIELDS OK", exit 0>`. A harness change is issued as a
  whole file under `docs/reviews/<date>-harness-*/settings.json`, copied by path by the executor and verified by the
  NEXT session's start — the team lead never edits the executor's harness.

## Hooks and guards (deterministic — "must happen every time")
`SessionStart`: <what is injected>. `Stop`: <what is stamped>. `PreToolUse(Bash)`: refuse sweeping commands
(`git add -A`, repo-wide format). `make check` (= `<lint> && <tests>`) green after every commit; a red the
executor did not cause is named in PROGRESS, not fixed silently.

## Pins and sealed records
Pinned modules: <list> — a moved pin is claimed through `<mechanism>`, never by re-pinning. Sealed records
(`results/prereg_*.json`) are immutable; a re-emission is a new record that recomputes its pins from disk.
`results/measurements.jsonl` is the registry of measured constants (rate, memory, seconds per unit), one row per
measurement with `source`, `n`, `max`, `sample`; a rate is a property of the host it was measured on.

## Money (<platform>; console empty between sessions)
<!-- The seven defaults of the phase-file template, with THIS project's commands. Keep every command real. -->
- **A paid run is a whole session**: create → settlement in one session; in front of the create only the line's
  opening (registration → commit → pack → commit → the checks, minutes, no development); its runbook is written the
  session before and re-pointed to that run. Rulings name the command whose output is the number; a cap is quoted
  from `<dry-run command>`.
- **One paid run = one money line**, opened INSIDE the paid session, minutes before the create — never a session
  earlier (an aged anchor drinks the always-on drip into the close's reference; the band shuts within hours): by the
  registration when it reads the guard WITH its line (`<register command --line <name> --cap <cap>>` creates the
  ledger `<path>`, anchor = the balance then), else by `<guard command --line <name> --cap <cap> --note …>`; the
  emitter's default line is <name> — never used for a run. The team lead reads `<dry-run file>` + the code at HEAD
  before the purchase and the registration at acceptance (only the anchor and its time are new). **A registration is
  never repeated on an anchored line** — once the line has swallowed any cent (the drip across a billing boundary, a
  killed resource) a second `<register command>` at the full cap refuses; a re-registration (a price move, a retry an
  hour later) goes under a NEW line (`<name>-r2`, its own ledger) or with `--cap` = the guard's printed remaining of the
  line, the operator's word. **A runbook gate is a command that can fail the session** (exit ≠ 0, the next command
  chained with `&&`), placed BEFORE the step it guards — the instrument-pin check runs on the disk files before the
  registration; a printed «STOP» with exit 0 is a note. When the hard stop fires (spent == cap) the post-run note
  refuses — it is not retried; the close settles on the walk alone. **Where a ruling
  and this section disagree on a mechanic, this section wins: follow it, name the contradiction in PROGRESS, no stop.**
- **Pricing**: the rate is the whole-run mean of the slowest host (`<measurements file>`, `sample: whole run`); the
  dear corner is priced and shown; a leg that does not fit issues on the mean corner with the cap as the hard
  stop, no band gate. The hardware tier and its price are fields of the record read from `<platform listing
  command>` — both names the platform uses (<create-name> / <listing-name>); the tier order for a substitute
  comes from the ruling.
- **Bounds**: `<terminate flag>` = the cap's minutes at the registered price; a borrowed minute-constant that would
  bite first bounds the reading, not the money — the record says which bound is live. Never two billing resources
  at once; teardown proven by `<listing command>` → `[]` before every stop and session end.
- **The smoke** = the run's shortest, median and LONGEST units, first; the runner writes a failed unit's ERROR reply
  (`id`, `error`, `exception`, `unanswered`) and exits non-zero; the client reads `<smoke command>` → «in» / «did
  not come back» (delete at once) / waiting (a poll, paired with a process check); every reader of the reply file
  reads whole lines and counts an error row as unanswered.
- **Closing a line**: after the resource is released and BEFORE any next run — the post-run `<note command>` on the
  line, then `<close command --expect <the run record's billed span> --until <after the run> --tolerance <t>>`; a
  partial billing walk is refused and retried at the next session's start, read-only walk first; a line whose
  readings all predate its run closes on the walk alone and never takes a late reading.
- **Validity**: a reading counts only when every registered unit is answered and parsed; a serving failure moves
  the serving (a larger tier, allocator settings in the launch line), never the instrument; the re-buy takes the
  next number on its own line inside the <N>-run ceiling.
- **Ceiling** = `<constant>` in the guard (the operator's word; the anchor never regenerated). Pre-registration:
  readings-not-bars where the operator decides on a table; bars with kill criteria where a claim is made; one
  attempt on a frozen set; a spent set is demoted to a reading.

## Executor conventions
Deviations carry a cause tag (`contract-gap | spec-gap | verify-gap | env | tooling | model | process`); numbers
only from result files; never expand or shrink scope silently; `<report command>` → `docs/reports/<phase>.md`
≤30 lines, the question answered in the first ten.

## Languages
Conversation and STATUS in the operator's language; code, prompts, commits, records, plans and reports in English.
