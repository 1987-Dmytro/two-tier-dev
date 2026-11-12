#!/usr/bin/env bash
# Copyright 2026 Anthropic PBC
# SPDX-License-Identifier: Apache-2.0
# Modified for two-tier-dev v3: lines of STEER.md reach Claude once, as facts in `additionalContext` next to the
# tool result (hooks doc: "factual statements rather than imperative"), then the file is cleared.
# v3.1: only the main session takes the note — a subagent's or workflow agent's call carries `agent_id` in the hook
# input (hooks doc, common input fields), and the file stays for the main session's next call.
# v3.5 (SPEC-v3.5 F2): with .claude/phase-session.json (the phase-start mod's mark) only a session it names takes the note —
# `session_id` of the hook input; without the file, any main session, as before.
# A convenience channel, not a trust boundary: the agent can write STEER.md itself.
f="${AGENT_STEER_FILE:-${CLAUDE_PROJECT_DIR:-.}/STEER.md}"
[ -s "$f" ] || exit 0
python3 -c '
import json, os, sys, time
try:
    data = json.load(sys.stdin)
except ValueError:
    data = {}
if not isinstance(data, dict) or data.get("agent_id"):
    sys.exit(0)
mark = os.path.join(os.environ.get("CLAUDE_PROJECT_DIR") or ".", ".claude", "phase-session.json")
if os.path.isfile(mark):
    try:
        j = json.load(open(mark, encoding="utf-8"))
        ids = j if isinstance(j, list) else j.get("sessions", []) if isinstance(j, dict) else []
    except (OSError, ValueError):
        ids = []
    if data.get("session_id") not in ids:
        sys.exit(0)
p = sys.argv[1]
lines = [l.strip() for l in open(p, encoding="utf-8") if l.strip()]
open(p, "w").close()
now = time.strftime("%H:%M")
note = "\n".join(f"Operator note {now}: {l}" for l in lines)
print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": note}}, ensure_ascii=False))
' "$f"
