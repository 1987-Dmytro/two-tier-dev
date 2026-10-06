#!/usr/bin/env bash
# Copyright 2026 Anthropic PBC
# SPDX-License-Identifier: Apache-2.0
# Modified for two-tier-dev v3: documented PreToolUse output — `continue: false` stops Claude, deny is the fallback.
# While AGENT_STOP exists in the project root, the call is refused and the session stops. `touch AGENT_STOP` / `rm AGENT_STOP`.
f="${AGENT_STOP_FILE:-${CLAUDE_PROJECT_DIR:-.}/AGENT_STOP}"
[ -e "$f" ] || exit 0
r="Kill switch: AGENT_STOP exists in the project root. The operator halted this session; remove the file to resume."
printf '{"continue":false,"stopReason":"%s","hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$r" "$r"
