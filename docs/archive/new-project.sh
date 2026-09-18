#!/usr/bin/env bash
# new-project.sh — instantiate the two-tier cycle in a project folder (executor kit + document templates).
#
#   bin/new-project.sh <target-dir> <phase-name> [project-name] [--git]
#
# Creates (never overwrites — an existing file is reported and skipped):
#   CLAUDE.md, .claude/ (settings, commands, rules), scripts/ (hooks), knowledge/ (vault seed + hot.md),
#   docs/PHASE-<phase>.md, docs/plans/<phase>.PROGRESS.md, docs/STATUS.md, docs/PROCESS.md,
#   docs/reviews/<date>-plan-<phase>.md, docs/reviews/<date>-stop-patterns.md, docs/standing-prompt-<phase>.md,
#   docs/reports/, results/, tests/.
# With --git: `git init -b main` and a first commit "two-tier-dev scaffold" (only if the folder is not a repo yet).
# Requires: bash, sed, python3 (for the hook self-test). Works on macOS (BSD sed) and Linux.
set -euo pipefail

usage() { sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }
[ $# -ge 2 ] || usage

TARGET="$1"; PHASE="$2"; PROJECT="${3:-}"; DO_GIT=0
case "${3:-}" in --git) PROJECT=""; DO_GIT=1;; esac
case "${4:-}" in --git) DO_GIT=1;; esac
[ -n "$PROJECT" ] || PROJECT="$(basename "$TARGET")"

HERE="$(cd "$(dirname "$0")/.." && pwd)"
KIT="$HERE/executor-kit"; TPL="$HERE/templates"
TODAY="$(date +%Y-%m-%d)"

put() {  # put <source> <dest> — copy with substitutions, never overwrite
  local src="$1" dst="$2"
  if [ -e "$dst" ]; then echo "  skip (exists): ${dst#$TARGET/}"; return 0; fi
  mkdir -p "$(dirname "$dst")"
  sed -e "s|<phase-name>|$PHASE|g" -e "s|<project-name>|$PROJECT|g" -e "s|<project>|$PROJECT|g" \
      -e "s|<date>|$TODAY|g" "$src" > "$dst"
  [ -x "$src" ] && chmod +x "$dst"
  echo "  wrote: ${dst#$TARGET/}"
}

echo "two-tier-dev → $TARGET  (project: $PROJECT, phase: $PHASE)"
mkdir -p "$TARGET"/{docs/plans,docs/reports,docs/reviews,results,tests,src} \
         "$TARGET"/.claude/{commands,rules} "$TARGET"/scripts/hooks \
         "$TARGET"/knowledge/{daily_logs,decisions,runbooks,templates}

echo "executor kit:"
put "$KIT/CLAUDE.md.template"                    "$TARGET/CLAUDE.md"
put "$KIT/claude-config/settings.json"           "$TARGET/.claude/settings.json"
for f in "$KIT"/claude-config/commands/*.md; do put "$f" "$TARGET/.claude/commands/$(basename "$f")"; done
put "$KIT/claude-config/rules/_TEMPLATE.md"      "$TARGET/.claude/rules/_TEMPLATE.md"
for f in "$KIT"/scripts/*.py "$KIT"/scripts/*.sh; do put "$f" "$TARGET/scripts/$(basename "$f")"; done
put "$KIT/scripts/hooks/refuse_sweeping_commands.py" "$TARGET/scripts/hooks/refuse_sweeping_commands.py"
put "$KIT/knowledge/README.md"                   "$TARGET/knowledge/README.md"
for f in "$KIT"/knowledge/templates/*.md; do put "$f" "$TARGET/knowledge/templates/$(basename "$f")"; done
chmod +x "$TARGET"/scripts/*.py "$TARGET"/scripts/*.sh "$TARGET"/scripts/hooks/*.py 2>/dev/null || true

if [ ! -e "$TARGET/knowledge/hot.md" ]; then
  cat > "$TARGET/knowledge/hot.md" <<EOF
<!-- AUTO-GEN START (refreshed by scripts/refresh-hot-cache.py) -->
<!-- AUTO-GEN END (everything below preserved across refreshes) -->

# What's Hot (curated, ≤40 lines — a cache, not a log)
**Last update:** $TODAY

## Next
- the «next» line of docs/plans/$PHASE.PROGRESS.md

## Blockers
- none
EOF
  echo "  wrote: knowledge/hot.md"
fi
[ -e "$TARGET/.gitignore" ] || { printf '.DS_Store\n.obsidian/\n__pycache__/\n*.pyc\n.venv/\nknowledge/.vault-state.json\n' > "$TARGET/.gitignore"; echo "  wrote: .gitignore"; }
[ -e "$TARGET/docs/reports/.gitkeep" ] || touch "$TARGET/docs/reports/.gitkeep"

echo "documents (team lead's, from templates):"
put "$TPL/PHASE.md"            "$TARGET/docs/PHASE-$PHASE.md"
put "$TPL/PROGRESS.md"         "$TARGET/docs/plans/$PHASE.PROGRESS.md"
put "$TPL/STATUS.md"           "$TARGET/docs/STATUS.md"
put "$TPL/PROCESS.md"          "$TARGET/docs/PROCESS.md"
put "$TPL/rulings.md"          "$TARGET/docs/reviews/$TODAY-plan-$PHASE.md"
put "$TPL/stop-patterns.md"    "$TARGET/docs/reviews/$TODAY-stop-patterns.md"
put "$TPL/standing-prompt.md"  "$TARGET/docs/standing-prompt-$PHASE.md"
put "$TPL/report.md"           "$TARGET/docs/reports/TEMPLATE-report.md"
put "$TPL/runbook-paid-run.md" "$TARGET/scripts/runbook-TEMPLATE-paid-run.md"

echo "self-test of the hooks:"
( cd "$TARGET" && python3 scripts/refresh-hot-cache.py >/dev/null 2>&1 && echo "  refresh-hot-cache: ok" || echo "  refresh-hot-cache: FAILED" )
( cd "$TARGET" && python3 scripts/brain-session-end.py >/dev/null 2>&1 && echo "  brain-session-end: ok" || echo "  brain-session-end: FAILED" )
if echo '{"tool_input":{"command":"git add -A"}}' | ( cd "$TARGET" && python3 scripts/hooks/refuse_sweeping_commands.py ) >/dev/null 2>&1; then
  echo "  refuse_sweeping_commands: FAILED (git add -A was not refused)"
else
  echo "  refuse_sweeping_commands: ok (refuses git add -A)"
fi

if [ "$DO_GIT" = 1 ] && [ ! -d "$TARGET/.git" ]; then
  ( cd "$TARGET" && git init -b main -q && git add . && git commit -q -m "two-tier-dev scaffold: phase $PHASE" && echo "git: initialised, first commit made" )
fi

cat <<EOF

Next:
  1. Fill the placeholders in CLAUDE.md (≤80 lines) and docs/PROCESS.md (this project's mechanics).
  2. Team lead (Cowork, /team-lead): the interview → docs/PHASE-$PHASE.md — the fork catalogue and the money
     defaults BEFORE the first item; the standing prompt from docs/standing-prompt-$PHASE.md goes into ruling (a).
  3. Build the reference and the grader (they print a number at \$0), then paste the standing prompt into a fresh
     executor session. Cadence: ≥2 executor sessions a day, ≤1 stop a day, acceptance the same day.
EOF
