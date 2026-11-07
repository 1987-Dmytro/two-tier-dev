#!/usr/bin/env bash
# rollback.template.sh — шаблон отката (SPEC-v3.4 F4.1; образец — откат проекта telefon): скопировать в scripts/rollback.sh; выкатка sha — шаг проекта.
# Цель Makefile проекта:   rollback: ; @SHA=$(SHA) scripts/rollback.sh
# Строку `rollback: make rollback SHA=<sha>` печатает деплой; итог — `ROLLBACK_OK sha=… sekunden=…` (закрывает окно в docs/evidence/deploy-window.log) или `ROLLBACK_FAIL …`.
# SHA — любой существующий коммит (от 7 знаков): строка, напечатанная деплоем, — подсказка оператору, не замок; окно закрывает любой `ROLLBACK_OK`. Успешный откат снимает из истории deploy-stand всё, что шло после этого sha (sha не из истории — дописывает): следующий деплой откатывается на него, а не на отозванное.
#   ROLLBACK_CMD  выкатка этого sha, в подоболочке; регрессия отката не нужна: sha уже проходил её (пусто — шаг снят: пробы шаблона)
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
LOG=docs/evidence/deploy-window.log
t0=$SECONDS
sha=${SHA:-}
fail() { echo "ROLLBACK_FAIL $*"; exit 1; }
[[ "$sha" =~ ^[0-9a-f]{7,40}$ ]] || fail "SHA — make rollback SHA=<sha из строки rollback: деплоя>"
git rev-parse --verify -q "$sha^{commit}" >/dev/null || fail "sha=$sha — такого коммита нет"
if [ -n "${ROLLBACK_CMD:-}" ]; then
  export ROLLBACK_SHA=$sha
  ( eval "$ROLLBACK_CMD" ) || fail "sha=$sha rc=$?"  # в подоболочке: exit N в команде не минует строку итога
fi
stand=$(git rev-parse --git-path deploy-stand)
short=$(git rev-parse --short "$sha")  # короткий, как у деплоя: полный SHA тот же коммит не спрячет
if grep -qxF "$short" "$stand" 2>/dev/null; then  # всё, что шло после этого sha, отозвано: целью отката не станет
  keep=$(awk -v s="$short" '{ l[NR] = $0; if ($0 == s) k = NR } END { for (i = 1; i <= k; i++) print l[i] }' "$stand")
  echo "$keep" > "$stand"
else
  echo "$short" >> "$stand"
fi
mkdir -p "$(dirname "$LOG")"
echo "ROLLBACK_OK sha=$sha sekunden=$((SECONDS - t0))" | tee -a "$LOG"
