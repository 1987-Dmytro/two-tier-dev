# templates — the documents every project instantiates

`bin/new-project.sh <dir> <phase> [project] [--git]` copies them with the placeholders filled. Each template
says who writes the file, its cap, and when it is written. Comments inside (`<!-- … -->`) are guidance — delete
them as you fill the file.

| template | becomes | owner | cap | written when |
|---|---|---|---|---|
| `PHASE.md` | `docs/PHASE-<phase>.md` | team lead | 150 lines | at phase start, after the interview; revised by version the same day a stop teaches something |
| `PROGRESS.md` | `docs/plans/<phase>.PROGRESS.md` | executor | 60 lines | every session: done / next (one item) / open stop with its class / money live |
| `STATUS.md` | `docs/STATUS.md` | team lead | 60 map lines + machine block | at every acceptance; always with a concrete finish date |
| `PROCESS.md` | `docs/PROCESS.md` | team lead | — | at project start; grows when a mechanic is learned (a ruling that had to carry commands) |
| `standing-prompt.md` | `docs/standing-prompt-<phase>.md` → ruling (a) | team lead | 12 lines | once per phase; pasted by the operator every session, verbatim |
| `rulings.md` | `docs/reviews/<date>-plan-<phase>.md` | team lead | 12 lines per ruling | after every acceptance and every stop |
| `stop-patterns.md` | `docs/reviews/<date>-stop-patterns.md` | team lead | 5 lines per stop | after every ruling — the self-improvement pass, never skipped |
| `report.md` | `docs/reports/<phase>.md` | executor | 30 lines | at phase close (and when the DONE list asks for it) |
| `runbook-paid-run.md` | `scripts/runbook-<run>.md` | executor | — | the session BEFORE a paid run, re-pointed to that run |
