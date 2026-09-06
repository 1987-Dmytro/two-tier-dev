# PHASE — `<phase-name>` — v1 <date>: <one line: what this revision adds; keep the whole history of revisions in this header line>

<!-- Team-lead file. The ONE document the executor reads. Cap: 150 lines (this template with its comments
     is ~110; delete the comments as you fill it). Mechanics named below are CONSTRAINTS; the goal is the
     question and the checks. Every threshold, floor, sample and window is stated here or nowhere. -->

Team-lead file. Executor: read this, then take the «next» line of `docs/plans/<phase-name>.PROGRESS.md`.

## 1. The operator's question and the artifact that answers it

«<the question in the operator's own words>» — answered by <the exact artifact: the row, the number, the
screen, the file>, built from result files only.

## 2. Success criteria — checks the executor can run (graders first, mechanics later)

<!-- One line per feature: [ ] id — what the operator can SEE — check: <command → expected output>.
     Ordered. Bars are stated with their reference file and its population rule. -->
- [ ] **S1 <name>** — <what the operator sees> — check: `<command>` → `<expected output>` (bar ≥ <x> on
  `docs/labels-<set>.jsonl`, drawn from the PRODUCT's population: <population rule written BEFORE the draw>).
- [ ] **S2 <name>** — … — check: `…`
- [ ] **End-to-end (closes the phase):** on a CLEAN CLONE, `<one command>` builds the artifact from the raw
  store; it fails loudly on any missing source. Then the product-truth gate: <N> rows under seed <s>
  rendered for the operator, who says in his own words what is right and wrong.

## 3. Constraints (files that must not move, and why)

<!-- Pinned modules, sealed records, frozen sets; the side files through which pinned structures grow. -->
Extend, do not fork: <modules>. PINNED: <files> — new text goes in a NEW module. Sealed records and frozen
sets are immutable. **Asked for here, once for all:** a caught PRODUCT defect gets ONE test, both directions,
in the same commit as its fix — no authorisation needed; every other new test, pin, guard or ledger stays
forbidden (name the need in PROGRESS). Producers a new leg re-uses take their paths as parameters; a seal
pins results, never a code path; every decision-bearing field of a record branches on the leg or the
emitter refuses to write.

## 4. Out of scope

<one line each>

## 5. Stop-points (ask BEFORE, never report after) — each with its decision table

<!-- Operator decisions, paid or irreversible steps. A decision table = the columns the operator reads to
     decide in ONE visit; the $0 steps that fill the columns come BEFORE the stop. -->
1. <paid step> — table: option · what fits under the cap · what it costs · when the operator is asked again.
2. <irreversible step> — …

### Fork catalogue — the answers to forks that recur in every phase, written BEFORE the first item
- **(a) Validity of a paid reading.** A run counts only when every registered unit is answered and parsed
  (`parse_failures = 0` in its error table). An incomplete run is recorded under its number, never compared;
  its transport defect is fixed with its one test and re-bought under the NEXT number — not a stop. A serving
  failure (out of memory, a crash, a dead process) is of this class: the instrument (law, render, ceiling,
  precision, decoding, parser) never moves for it — the serving environment does, disclosed in the re-emission;
  the runner reports a failed unit as an ERROR reply and exits non-zero; a new row shape in the reply file is
  read by EVERY reader of that file in the same fix, through whole lines.
- **(b) The second instance of anything** (window, source, carrier): one id per entity across sources; the
  screen renders all instances.
- **(c) Growth of a pinned structure:** through its declared side file, read by the one reader that reads the
  pinned file. The hardware tier, its price and the money line are FIELDS of the record, read at $0 from the
  platform's listing and from the ruling — never constants or defaults of the emitter.
- **(d) A caught product defect:** one test, both directions, in the fix's commit; no stop.
- **(e) A test that pinned a literal of the record:** when a ruling moves the record and the test's INVARIANT
  still passes while only literals diverge, the test is rewritten to read the committed record, both
  directions, in the same commit — not a stop. Weakening an invariant stays a stop. A fixture never invents a
  unit the record lacks.
- **(f) The money line of a paid run:** see §6.

## 6. Money — defaults for every paid run (the project's commands are in `docs/PROCESS.md` «Money»)

<!-- Six defaults. Fill the numbers; do not add rules one per stop — extend the defaults. -->
1. **One paid run = ONE money line** (own name, own anchor taken by an opening reading before the run, the run's
   cap as its cap, closed by its run record in the same session). An open multi-run line carries no new run.
   The registration reads the guard named with ITS line; a default line name in the emitter is a refusal.
2. **The rate is the WHOLE-RUN mean of the slowest host seen** (n = the run's units, from the run record) —
   never a smoke of three, never a borrowed sibling. The dear corner (the max on every unit) is priced and
   shown; when it does not fit, the leg issues FITS on the MEAN corner with the cap as the hard stop, no band gate.
3. **A cap is quoted from the dry run that priced it**, never typed. A fence written for a later step is an
   estimate, re-priced at that step's registration.
4. **The hardware tier and its price are fields of the record**, read from the platform's listing at $0 (both
   names the platform uses); the platform's backstop is derived from the cap at the registered price — a
   borrowed minute-constant that would bite first bounds the reading, not the money; the record says which.
5. **The close settles against the line's POST-RUN reading**, taken after the run's resource is released and
   before ANY next run; a line whose readings all predate its run closes on the billing walk alone, bounded to
   its own window, and never takes a late reading. Billing lag → the close is retried at the next session's
   start, read-only walk first.
6. **The smoke holds the longest unit first**; a card too small fails on three units, not on eighty. The cycle
   ceiling is the operator's word (a table: options · what fits · when asked again); the anchor is never
   regenerated; always-on resources drip into every open window; teardown is proven by a listing.
Ceiling: <amount> (operator, <date>). Per-leg caps: <leg> ≤ <cap> (quoted from `<dry-run command>`) …

## 7. Dependencies the team lead owes

`docs/labels-<set>.jsonl` (blind, from the product's population) lands after the executor's draw; $0
scaffolding does not wait; graded readings and the frozen-set attempt do.

## 8. DONE WHEN — the list the phase closes on (each clause a shown check)

(a) … (b) … (c) `make check` green with no test file deleted — a test that must change to pass is a STOP;
(d) `docs/reports/<phase-name>.md` exists, ≤30 lines, opens with the question and answers it in the first ten
lines, every number naming its file; (e) `git status --porcelain <owned paths>` prints nothing.

## 9. Decisions log

<!-- Rulings live in docs/reviews/<date>-plan-<phase-name>.md, ≤12 lines each, dated; this section lists the
     latest ones in one line each: (a) <date> — <choice · number · file>. -->
