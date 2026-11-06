#!/usr/bin/env bash
# deploy.template.sh — шаблон деплоя (SPEC-v3.4 F3.3, F3.4, F4.1; образец — деплой проекта telefon): скопировать в scripts/deploy.sh, шаг выкатки — свой.
# Порядок: паспорт модулей → выкатка → строка отката → регрессия закрытых модулей → итог. `DEPLOY_OK` — только после `REGRESS_OK`; строка отката — и в красном исходе: откат нужен именно там.
#   DEPLOY_CMD   выкатка проекта (пусто — шаг снят: пробы шаблона)
#   REGRESS_CMD  регрессия закрытых модулей, по умолчанию `make regress`: последняя строка `REGRESS_OK` и код 0, иначе `DEPLOY_FAIL step=regress`
#   PASSPORT_CMD сверка паспортов, по умолчанию `bin/check-passport`; `<МОДУЛЬ>_OFFEN=SPEC-<n>` открывает модуль текущей SPEC
#   DEPLOY_LINIE 1 — деплой на линию (сигнал, который чувствует клиент): после `DEPLOY_OK` окно закрывает живая проверка `LIVE_OK` или откат `ROLLBACK_OK` (`bin/check-fenster`)
# Итог и окно — строками журнала docs/evidence/deploy-window.log. Прежний sha — в служебном каталоге git: `make rollback SHA=<sha>` — scripts/rollback.template.sh.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
SHA=$(git rev-parse --short HEAD)
LOG=docs/evidence/deploy-window.log
STAND=$(git rev-parse --git-path deploy-stand)
LINIE=${DEPLOY_LINIE:-0}
mkdir -p "$(dirname "$LOG")"
PREV=$(cat "$STAND" 2>/dev/null || true)
ROLLBACK_LINE=$([ -n "$PREV" ] && echo "rollback: make rollback SHA=$PREV" || echo "rollback: none")

finish_red() {  # finish_red <шаг> [поля]: строка отката, итог, код 1
  echo "$ROLLBACK_LINE"
  echo "DEPLOY_FAIL step=$1 sha=$SHA${2:+ $2}" | tee -a "$LOG"
  exit 1
}

# 1. паспорт: до выкатки, сервер не тронут
if ! out=$(eval "${PASSPORT_CMD:-bin/check-passport}" 2>&1); then
  echo "$out"
  finish_red passport "$(grep -m1 '^PASSPORT_FAIL' <<<"$out" | cut -d' ' -f2-)"
fi
echo "$out"

# 2. выкатка
if [ -n "${DEPLOY_CMD:-}" ]; then
  eval "$DEPLOY_CMD" || finish_red rollout "rc=$?"
fi

# 3. регрессия закрытых модулей
out=$(eval "${REGRESS_CMD:-make regress}" 2>&1); rc=$?
echo "$out"
if [ "$rc" != 0 ] || [ "$(tail -1 <<<"$out")" != REGRESS_OK ]; then
  finish_red regress "rc=$rc"
fi

# 4. итог: строка отката рядом с DEPLOY_OK, следующий деплой откатывается на этот sha
echo "$ROLLBACK_LINE"
echo "$SHA" > "$STAND"
echo "DEPLOY_OK sha=$SHA linie=$LINIE rollback=${PREV:-none}" | tee -a "$LOG"
