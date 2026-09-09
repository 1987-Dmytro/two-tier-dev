# Runbook — a paid run (executor file; written the session BEFORE the run and re-pointed to THAT run)

<!-- The paid session pastes; it transposes nothing. Every path, name, line and cap below is this run's.
     The $0 half (the dry run, the code, this file) is its own item the session before; a fresh verifier reads
     this file at HEAD and the money paths before the purchase; the team lead reads the dry run + HEAD; only
     then the paid session — and the registration that OPENS the money line runs HERE (§1), minutes before the
     create, never a session earlier (an aged anchor drinks the always-on drip into the close's reference). -->

**Run:** `<run-name>` · **money line:** `<line>` · **cap:** <cap> (quoted from `<dry-run command>` — FITS on the
<mean|dear> corner at <figure>) · **hardware:** `<tier, both platform names>` at <price>/h (the day's dearer offer)
· **hard stop:** <minutes> (= the cap at the registered price; the borrowed backstop <bites first | lifted>) ·
**instrument pins:** unchanged from the registration `<record path>` · **out-file:** `<path>` · **launch line of this
session:** `<the exact executor launch command, with its permission mode — PROCESS «Harness fields»>`.

## 0 — before anything (in the paid session, $0)
- Start ritual done; team-lead files committed by path; `git status` clean; **no live resource**: `<listing
  command>` → `[]`.
- **The mode gate, FIRST, then the harness-fields check** (deterministic, before any money): `<grep of the applied-mode
  stamp the harness writes> && <the one-line validator of PROCESS «Harness fields» → "HARNESS FIELDS OK">` — exit ≠ 0 ends
  the turn before any anchor; no allow-rule grep (allow rules are inert in the mode the first gate demands); a permission
  prompt or denial later in this session is a stop, and the team lead's.
- The dry run is the committed one: `<show the dry run's bound, FITS corner, tier, price, pins>`.
- **The pin check is a gate, not a note — and it runs HERE, before the registration anchors anything:**
  `<pin-check command over the disk files against the dev-bar registration> && echo "PINS HOLD"` — it exits ≠ 0 on
  a moved pin and every following command is chained on it with `&&`; a moved pin ENDS the turn ($0).

## 1 — register and open the money line (in THIS session, before the resource exists)
**One registration per line.** If this registration must be redone after its anchor (a price move, a STOP retried an
hour later), it is a NEW line (`<line>-r2`, its own ledger) or `--cap` = the guard's printed remaining of the line on the
operator's word — never a second `<register command>` at the full cap on the anchored line (it refuses once any cent
has landed).
`<register command --line <line> --cap <cap>>` (FITS shown; a refusal ENDS the turn before any create) → commit the
record + the ledger → `<pack command>` → commit → the checks at that HEAD → `<guard command --line <line> --cap <cap>
--note "<line> — about to create">` → the line's ledger exists with its anchor; the guard prints REMAINING for the
line and for the cycle. The registration is read at acceptance against the dry run: same pins, bound, tier, price,
backstop — only the anchor and its time are new.

## 2 — create
`<create command … --hardware "<create-name>" --terminate-after <minutes> …>` — the operator's own line if the
platform refuses automation; record `<id>`, the price the response prints (rung 1: ≤ the registered price, the
tier = the registered tier), the create time.

## 3 — launch (the allocator env and the runner's pin are the registration's)
`<remote launch line with env vars, nohup, the log path>` — then watch the PROCESS, not a success-grep:
`<process check> ; <log tail>`.

## 4 — the smoke (shortest · median · LONGEST unit, first) and the GO
Poll `<smoke read command --replies <out-file>>`: «<all> in» → GO written by `<go command>`; «did not come back»
(an ERROR reply) → **delete at once** (§6); waiting + no runner process → the same outcome. The smoke's seconds
are read for the record, never for a band gate on a leg issued on the mean corner.

## 5 — the run, the fetch, the delete
`<fetch command>` → `<delete command>` → `<listing command>` → `[]` shown.

## 6 — the run record and the money line's close
`<close-segment command --replies <out-file>>` (the segment's billed span comes from here) → the POST-RUN reading
on the line: `<guard command --line <line> --note "post-run reading">` → `<close command --expect <billed span>
--until <after the delete> --tolerance <t>>`. A partial billing walk is refused: carried to the next session's
start, read-only walk first. **Never** take a late reading on a line whose readings predate its run. **If the hard
stop fired** (spent == cap) the post-run reading REFUSES — do not retry it; the close settles on the walk alone.

## 7 — the reading
`<score command --arm <bar arm>>` (BAR <x>/<y>) · `<score command --arm <reading arm>>` (READING) → the error
table → PROGRESS: done / next / open stop (class: planned read) → END THE TURN. An incomplete reading is recorded
under its number and compared to nothing.
