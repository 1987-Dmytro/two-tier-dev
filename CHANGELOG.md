# Changelog — what each version learned, and the stop that taught it

The skill card `skills/team-lead/SKILL.md` is the unit of versioning; the templates and the executor kit
follow it. A version enters only through the self-improvement pass (skill §10): a stop → its class → the
rule → where it lives. Dates are the days the rule entered the live project.

## Unreleased — named debts
- brain-init M6 v2 deltas (`skills/brain-init/M6-v2-deltas.md`) are written but not yet applied in a live
  repository: session start still injects the vault cache, the Stop hook still stamps daily logs.
- The phase-file template's **money section** with seven defaults is here (`templates/PHASE.md` §6); the
  brain-init generator does not emit it yet.
- Retro metrics (stops per day, preventable stops, verification/product line ratio) are read by hand;
  they should be collected from the `class:` line of PROGRESS.
- The operator is the only channel between the tiers; an automatic prompt/report relay is speculative and
  waits until the money defaults stop producing stops.

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
