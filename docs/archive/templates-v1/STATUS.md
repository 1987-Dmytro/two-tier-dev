# STATUS — <project> (<date>, <time>) — the map of stage <n> «<name>»: what comes after what, where we are, when it ends

> Operator's document, in the operator's language; edited only by the team lead, after acceptances. History:
> git of this file, `docs/reviews/`. Cap: 60 map lines; the machine-read block at the end does not count and
> is never edited (sealed producers quote it byte for byte).

## What this project is (one paragraph)
<the customer's question, the product, the stage's promise — in the operator's words>

## The plan of stage <n> — what comes after what (phase file `PHASE-<phase-name>` v<k>; every number from result files)
| # | layer | what it is for you | state | held by |
|---|---|---|---|---|
| S1 | <layer> | <what the operator sees> | ✅ / ❌ / <reading with its file> | <who> |
| S2 | … | … | … | … |
| gate | you | <N> rows under seed <s> (`<command>`): you say what is right and wrong | after <bars> | **operator** (<minutes>, <date>) |

**Where we are, in one line:** <…>.
**Honestly:** <what is red, what is a reading and not a bar, what was narrowed and where that is declared>.

## Next steps — in order, who does what
1. ✅ <done step, with its number and file>
2. <executor: item> (≤ <cap>) → <team lead: acceptance / labelling> → <operator: decision>
**Estimate: the stage gate — <date>** given <conditions>; each red iteration +1 day; <what needs the operator's word>.

## Money (guard: `<ledger file>`; billing posts with a lag)
Cycle: spent <x> of <ceiling> (operator's word <date>); REMAINING <y>. Ahead: <leg> ≤ <cap> + <leg> ≤ <cap> → <what
remains>; <what needs the ceiling raised>. Lines: <closed lines with their settled figures>; <open lines by
construction>. Always-on resources: <what drips, until when>.

## Proven and staying in the product
<numbers with their files, one line each>

## Live decisions (the latest; full texts in `docs/reviews/<date>-plan-<phase-name>.md`)
- (<letter>) <date> — <one line: the choice, the number, the file>

## Deferred on purpose (what · what unblocks it)
<one line each>

## Lessons (retro `docs/reviews/<date>-retro-*.md`; stop reviews `docs/reviews/<date>-stop-patterns.md`)
Sessions/day and stops/day with their classes; which rule entered where; the next diet step.

<!-- MACHINE-READ BLOCK — quoted verbatim by sealed producers. Bytes below are law: never reword, never re-flow.
     This block is NOT map prose and does not count toward the cap. -->
## Archive of rulings that sealed records read (do not edit)
