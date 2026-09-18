# PROGRESS — `<phase-name>` (the executor's one file — done / next / open stop; cap 60 lines; §8 of the phase file is the DONE list)

## The money, live — read BY HAND from the guard this session, never carried from a record
Cycle: SPENT <x>, REMAINING <y> of the <ceiling>; anchor <a> UNMOVED; balance <b> at <time>Z.
Open line `<line>`: SPENT <x> of its cap <c>; last reading <time>. Closed this session: <line> at <settled>.

## Done — <date> s<N>: <one line, what this session proved>
- **Team-lead files committed by path (`<sha>`)** — <which>.
- **<item id> — <what>** (`<sha>`): <the check that was run and what it printed, in one or two lines>.
- <every commit of the session, one bullet, the number it produced and the file the number lives in>

## Next — ONE item
1. **<item id> — <what>**: <the exact command(s) the next session runs first, read from the phase file / the
   newest ruling — never paraphrased>; check: `<command>` → `<expected>`.

## Open stop — NONE | <≤15 lines>
<!-- class: planned read · fork · defect · money · process · question -->
**class:** <one of the classes above>
**stop-point:** <which stop-point of the phase file, or the fork the plan does not settle>
**question:** <the one question, with the decision table if it is the operator's>
**tree:** <clean at HEAD <sha> | the modified paths>

## Tree
Clean at HEAD `<sha>`; `make check` <passed>/<skipped>, exit 0, taken over a CLEAN tree at `<sha>`; $<spent this
session>, no live resource (listing shown: `[]`).

## Named, not built (the phase file forbids adding what it did not ask for)
- <a need with the file it belongs to and the ruling it waits for>
