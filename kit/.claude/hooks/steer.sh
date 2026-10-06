#!/usr/bin/env bash
# Copyright 2026 Anthropic PBC
# SPDX-License-Identifier: Apache-2.0
# Modified for two-tier-dev v3: lines of STEER.md reach Claude once, as facts in `additionalContext` next to the
# tool result (hooks doc: "factual statements rather than imperative"), then the file is cleared.
# A convenience channel, not a trust boundary: the agent can write STEER.md itself.
f="${AGENT_STEER_FILE:-${CLAUDE_PROJECT_DIR:-.}/STEER.md}"
[ -s "$f" ] || exit 0
python3 - "$f" <<'PY'
import json, sys, time
p = sys.argv[1]
lines = [l.strip() for l in open(p, encoding="utf-8") if l.strip()]
open(p, "w").close()
note = "\n".join(f"Operator note {time.strftime('%H:%M')}: {l}" for l in lines)
print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": note}}, ensure_ascii=False))
PY
