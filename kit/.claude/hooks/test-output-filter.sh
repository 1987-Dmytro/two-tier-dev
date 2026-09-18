#!/usr/bin/env bash
# test-output-filter — два режима, оба на stdin.
#
#   PreToolUse(Bash): вход — JSON вызова. Если это прогон тестов без фильтра,
#   печатает additionalContext с идиомой, которая режет шум и ОСТАВЛЯЕТ итог.
#   Пайп: `pytest | .claude/hooks/test-output-filter.sh` — режет шум сам.
#
# Итоговая строка («N passed», «FAILED», «ERROR», «AssertionError») не режется
# никогда: без неё судья /goal не видит доказательства.
# ponytail: два режима в одном файле — так его называют и §3 (хук), и SPEC F2
# (фильтр); разделять на два файла значит менять дерево F1.
set -u

input=$(cat)
cmd=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null) || cmd=""

if [ -n "$cmd" ]; then
  case "$cmd" in
    *test-output-filter*) exit 0 ;;
    *pytest*|*"npm test"*|*vitest*|*jest*|*"cargo test"*|*"go test"*)
      echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"test-output-filter: прогоняй тесты через `<команда> 2>&1 | .claude/hooks/test-output-filter.sh` — шум срежется, итоговая строка (N passed / FAILED) останется в транскрипте и в docs/evidence/."}}'
      ;;
  esac
  exit 0
fi

printf '%s\n' "$input" | grep -E -- '(passed|failed|FAILED|ERROR|error:|AssertionError|Traceback|=====|\.\.\. ok|collected [0-9]+ item)' || true
