# REPORT — `docs/reports/<phase-name>.md` — the phase report (executor file; ≤30 lines of prose)

<!-- Fixed order. The first ten lines must let the operator answer the phase's question without reading further.
     A negative or partial answer is written as plainly as a positive one. Every number names its file.
     A table over 40 rows is a file under results/, linked; the report carries only the rows that answer the
     question. Chat gets the path, nothing else. -->

# REPORT — `<phase-name>`, sessions <a>–<b> (<dates>): <one line — the state of the question>

**Question (`docs/PHASE-<phase-name>.md` §1):** «<the operator's question>»

**Answer:** <the answer with its numbers and the files they come from — bars taken or not, on which set, on a
complete reading or not; what is one step away and what that step is>.

**Money:** <cycle spent / ceiling / remaining from the guard; every line closed with its settled figure; the one
open line, if any, and why it stays open by construction>.

**Evidence — this session:** (1) <command → output tail, file>; (2) …; each close, each check, the listing.

**Evidence — earlier sessions, SUMMARISED from accepted rulings and not re-read here except where a file is
cited:** <what was proven when, by which file>.

**§8, where each clause stands:** (a) … (b) … — each with its shown check or «not re-read here» said plainly.

**Deviations:** `Dv<n> [cause: contract-gap | spec-gap | verify-gap | env | tooling | model | process]` — <one line
each: what departed from the plan, how it was resolved, whose miss>.

**Debts (named, not built):** <one line each, who owns it, what it costs>.

**`make check`:** `<passed> passed, <skipped> skipped in <t>`, exit 0, over a CLEAN tree at `<sha>`; HEAD `<sha>`
(what changed between them and why the reading still covers the tree it grades).
