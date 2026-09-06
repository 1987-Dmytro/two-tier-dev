# brain-init M6 v2 — deltas for the executor side (Claude Code), 2026-09-03, + v2.1 addendum 2026-09-04, + v2.2 notes 2026-09-06

Source: the process retro of 2026-09-03 (eight pauses of one phase; a 15:1 verification-to-product line ratio;
45 % process commits), the stop reviews of 04–06.09, and the September-2026 guidance the retro was checked
against: Anthropic's Claude Code best practices («keep CLAUDE.md concise», «give Claude a check it can run», a
clean session with a better prompt beats a long session), «Effective harnesses for long-running agents» (a
feature list with `passes`, a progress file, one feature per fresh session), the `/goal` docs (one measurable end
state; a pause is not honoured).

## Remove
1. The budget hooks on `knowledge/hot.md` (≤40 lines), the daily-log and index churn — 45 % of the phase's commits
   were process. `SessionStart` injects ONLY `docs/plans/<phase>.PROGRESS.md` + `git log -15 --oneline`.
2. `/save` and `/close` → one `/checkpoint`: update PROGRESS (done / next / open stop, ≤60 lines), commit by path.
3. `/report` → an entry in PROGRESS (≤30 lines: question, answer, commands, output, deviations with cause tags).
   Separate reports are written only at phase close (`docs/reports/<phase>.md`, the DONE list's clause).
4. `/plan-phase` — only when the diff cannot be described in a sentence; ≤80 lines; lives beside the phase file,
   never a 700-line document.
5. The Stop hook for goals and `/goal` itself for phases with stop-points — not used; the DONE list of the phase
   file is the predicate.

## Keep
`permissions.deny` on the team-lead files; the `refuse-sweeping-commands` hook (`git add -A`, repo-wide format);
`make check` green after every commit; «numbers only from result files»; «never expand or shrink scope silently».

## Add (one line in CLAUDE.md)
«Never add a test, pin, guard or ledger the phase file did not ask for — the phase file asks for ONE test per
caught product defect; name every other need in PROGRESS instead.»

## Templates M6 v2 generates
- `docs/PHASE-<name>.md`: question → artifact → FEATURE LIST (`[ ] <id> — <what the operator sees> — check:
  <command → expected output>`) → constraints → stop-points with decision tables → **the fork catalogue** →
  **the money section with its six defaults** → decisions log (dated, ≤12 lines, a decision is not a law). Cap 150.
  Reference: `templates/PHASE.md`.
- `docs/plans/<name>.PROGRESS.md`: money live / DONE (id + commit) / NEXT (one id) / OPEN STOP (≤15 lines, with a
  `class:` line: planned read · fork · defect · money · process) or «none» / tree / named-not-built. Cap 60.
  Reference: `templates/PROGRESS.md`.
- The standing launch prompt (≤12 lines) — stored with the phase, pasted by the operator every session.
  Reference: `templates/standing-prompt.md`.

## v2.1 addendum, 2026-09-04 — from the four stops of that day
1. **The phase-file template gets the FORK CATALOGUE** (default answers written before the first item): (a) validity
   of a paid reading — a run counts only when every registered unit is answered and parsed; an incomplete run is
   recorded, not compared, its transport defect fixed and re-bought under the NEXT number without a stop; (b) the
   second instance of anything (window, source, carrier) — one id per entity, the screen shows all; (c) growth of
   a pinned structure — through a declared side file, one reader; producers take their paths as parameters, a
   seal pins results, never a code path; (d) a caught product defect — one test in both directions in the fix's
   commit, no authorisation.
2. **The runner prints `parse_failures`** in the error table as the validity gate of a run; before the first
   purchase of a new instrument — a $0 drill on every answer shape the prompt permits (object · array · fenced ·
   bare); a shape the model produces later joins the drill once.
3. **The PROGRESS template: the open stop carries a `class:` line** — the «preventable stops» metric is collected
   from PROGRESS, not from memory.
4. The CLAUDE.md line is sharpened to the wording under «Add» above.

## v2.2 notes, 2026-09-06 — from the money stops of 05.09 and the pre-purchase verifier
1. **The phase-file template carries a MONEY SECTION with six defaults:** one paid run = one money line · the
   whole-run rate of the slowest host · the cap quoted from the dry run · the guard read with the line's name ·
   the post-run reading as the close's reference · the hardware tier and its price as fields of the record read
   from the platform's listing (with the backstop derived from the cap). See `templates/PHASE.md` §6.
2. **The generator's emitter scaffold takes the money line, the hardware tier and the price as parameters**, never
   as constants; a default line name is a refusal waiting to happen.
3. **A new row shape written into a reply file** (an error reply) is read by every reader of that file in the same
   fix — the scaffold's readers go through whole lines, never a raw parse.
4. **The paid-run runbook is a template** (`templates/runbook-paid-run.md`), re-pointed to each run the session
   before it, so the paid session pastes and transposes nothing.
