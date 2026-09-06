# Runbook — a paid run (executor file; written the session BEFORE the run and re-pointed to THAT run)

<!-- The paid session pastes; it transposes nothing. Every path, name, line and cap below is this run's.
     The $0 half (registration) is its own item the session before; a fresh verifier reads this file at HEAD
     and the money paths before the purchase; the team lead reads the committed registration; only then the
     paid session. -->

**Run:** `<run-name>` · **money line:** `<line>` · **cap:** <cap> (quoted from `<dry-run command>` — FITS on the
<mean|dear> corner at <figure>) · **hardware:** `<tier, both platform names>` at <price>/h (the day's dearer offer)
· **hard stop:** <minutes> (= the cap at the registered price; the borrowed backstop <bites first | lifted>) ·
**instrument pins:** unchanged from the registration `<record path>` · **out-file:** `<path>`.

## 0 — before anything (in the paid session, $0)
- Start ritual done; team-lead files committed by path; `git status` clean; **no live resource**: `<listing
  command>` → `[]`.
- The registration is the committed one: `<show the record's line, cap, price, pins>`.

## 1 — open the money line (before the resource exists)
`<guard command --line <line> --cap <cap> --note "<line> — about to create">` → the line's ledger exists with its
anchor; the guard prints REMAINING for the line and for the cycle.

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
start, read-only walk first. **Never** take a late reading on a line whose readings predate its run.

## 7 — the reading
`<score command --arm <bar arm>>` (BAR <x>/<y>) · `<score command --arm <reading arm>>` (READING) → the error
table → PROGRESS: done / next / open stop (class: planned read) → END THE TURN. An incomplete reading is recorded
under its number and compared to nothing.
