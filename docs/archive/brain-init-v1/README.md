# brain-init — the executor-side kit generator (Claude Code)

`/brain-init` is the Claude Code skill that turns a fresh repository into the executor's workplace: `CLAUDE.md`,
`.claude/settings.json` with the deny rules and hooks, the slash commands, path-scoped rules, the `knowledge/`
vault (an Obsidian vault that doubles as the second-tier memory), the code graph, and — module **M6 «two-tier»** —
the templates of the phase file and the progress file, the standing prompt and the deny rules that make the
team lead's files read-only for the executor.

**Status in this repository:** the skill's source is kept by the operator in the Claude Code skills folder and is
to be copied here as `SKILL.md` (+ its modules) — the operator's step. What is here now:

- `M6-v2-deltas.md` — the changes to the two-tier module derived from the retro of 2026-09-03 and the stop reviews
  of 04–05.09 (written, **not yet applied** in the live project).
- `../../executor-kit/` — the files the generator produces, as they run today, for installing by hand.

Versioning: a change to what brain-init generates enters the same way as a change to the skill card — through a
stop review (`templates/stop-patterns.md`) naming the class of stop it prevents; `CHANGELOG.md` at the root
records it.
