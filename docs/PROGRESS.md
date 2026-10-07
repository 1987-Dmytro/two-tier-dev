# PROGRESS — two-tier-dev, SPEC-v3.1 «ultracode по полной» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 07.10.2026, 13:10 — фаза v3.1 закрыта, ждёт приёмки
**Сделано:** F1–F9 закрыты, у каждой фичи — свой чек и evidence в `docs/evidence/`. `/verify-phase` из свежего клона `e1cd97f` → `VERDICT: PASS`, блокирующих 0 (`docs/evidence/verify-e1cd97f.txt`; 11 агентов, 8 мин, гейт 120 с). Блокирующая прогона на `f3b4863` починена в этой сессии. CI `v3.1` → `CI_OK`; `bin/gate-v3.1` → `F1`…`F8`, `F9 GATE_OK`. Плечо — 11:37–13:10 по транскрипту.
**Следующий шаг оператора:** «отчёт готов» в свежую сессию тимлида: `/team-lead — приёмка v3.1 (ветка v3.1, голова docs/PROGRESS.md); /usage до … после …`. Тимлиду ещё: deny `Edit(/budgets.json)` в `.claude/launch.settings.json` — это файл тимлида. После PASS — PR `v3.1` → `main` по «да» оператора.
**Когда закончим:** приёмка v3.1 — 07.10, вечер: `bin/verify-phase` 8–20 мин и ревью тимлида ~15 мин. Перевод telefon — 08.10, если неделя ≤ 60 % (SPEC-v3.1 §6). Сдвинуть может только окно оператора.

## Done
- Шаг 0: `docs/PLAN-v3.1.md` (`19b0380`).
- Шаг 0b (`a4b474d`): `git mv` evidence v3 → `docs/archive/evidence-v3/`, PROGRESS v3 → `docs/archive/PROGRESS-v3.md`.
- **F1 Харнес ultracode**: `bin/check-harness` → `HARNESS_OK` — `F1-harness-result.txt`; `baseRef` `fresh` → `main-base`, `head` → `head-feature` — `F1-baseref-result.txt`.

- **F2 Окружение = таблица**: `bin/check-harness` → `ENV_OK` на репо кита и на t3 — `F2-harness-result.txt`; `--self-test` — в `make ci`.
- **F3 Хуки на агентах**: `bin/check-harness` → `HOOKS_OK` на репо и t3 — `F3-harness-result.txt`; «до» на хуках v3 → `HOOKS_FAIL` — `F3-harness-v3-baseline.txt`.
- **F7 Владение: хвосты 3 и 5**: `bin/check-budget --self-test intent owner` → `OWNER_OK` (ok 280, BAD 0); красная проба на `rule_owner` из `8f1d232` → `OWNER_FAIL`, ok 170, BAD 101 — `F7-owner-result.txt`.
- **F4 `/verify-phase`**: `bin/check-verify` → `VERIFY_OK` — `F4-verify-result.txt`: красная фикстура → `NEEDS_WORK`, дефект назван; чистая → `PASS`, блокирующих 0; `--limit 20` → `VERIFY_TIMEOUT`.
- **F5 `/accept` v3.1**: `bin/check-kit` → `KIT_OK` — `F5-kit-result.txt`: вердикт — `bin/verify-phase` (свежий клон, `Workflow(verify-phase)`, 30 мин), скилл 1 999/4 000 знаков.
- **F6 Шаблоны и CLAUDE.md**: `bin/check-budget --templates` → `BUDGET_OK` с контрактом фраз — `F6-templates-result.txt`; красная проба (шаблон PROCESS без `--effort ultracode`) → `BUDGET_FAIL`.
- **F8 Документы**: `bin/check-docs` → `DOCS_OK` — `F8-docs-result.txt`: CHANGELOG v3.1 (поле — док, до, после), LAUNCH (каждый флаг строки), README и dev-system — ultracode и `/verify-phase`; красная проба → `DOCS_FAIL`.
- **F9 Гейт v3.1**: `bin/gate-v3.1` → `F1 HARNESS_OK` … `F8 DOCS_OK`, `v3 GATE_OK`, `F9 GATE_OK` — `F9-gate-result.txt` (гейт свежего клона `e1cd97f`); F2, F3 — оттуда же.
- **`/verify-phase` фазы**: `f3b4863` → `NEEDS_WORK` (1 блокирующая, фикс-ап `e1cd97f`); `e1cd97f` → `VERDICT: PASS` — `verify-e1cd97f.txt`.

## Next — один айтем
1. **Приёмка тимлида v3.1**: свежий клон `origin/v3.1`, `bin/verify-phase` → `VERDICT: PASS`, `bin/gate-v3.1` → `GATE_OK`.

## Open stop — NONE

## Notes
- Пробы `guards` и `agent` просят попытку вопреки CLAUDE.md: с правилом «по точным путям» (F6) агент сам не запускал `git add -A` — чек дал FAIL, не ложный PASS. Контрольный `-p` — таймаут 300 с: главная сессия однажды зависла после завершённого воркфлоу `kill-probe`, итог — по снятому потоку и файлам.
- Хвост 3: lint коммитов берёт список владения на родителе коммита; на родителе нет `budgets.json` — кит ещё не стоял, файлов тимлида нет (коммит установки и апгрейда зелёные). Deny `Edit(/budgets.json)` в `.claude/launch.settings.json` репо — правка тимлида.
- Риск 1 PLAN снят замером: `continue:false` kill-switch останавливает агента воркфлоу, `kill-switch.sh` не менялся. Проба требует попытки записи: агент, прочитавший CLAUDE.md, иначе останавливался сам.
- Встроенные плагины `@builtin` (`cc-plugin-*`) в сверке не считаются: PROCESS называет их прозой, строки таблицы нет.
- `permissions.allow` из `.claude/settings.json` в `-p` не действует (папка не доверена) — пара и `bin/verify-phase` передают те же правила `--allowedTools`; отклонение 3 PLAN.

## Named, not built
- Неблокирующие `/verify-phase` @ `f3b4863` (полный список — журнал PLAN): `refuse_sweeping` не ловит `git add -A` после перевода строки, `&`, `-fA`, `sudo`, `bash -c` (поведение v2); у `bin/gate-v3.1` нет негативного self-test; `table()` падает на PROCESS без `## Environment`; `id` таблицы чувствительны к регистру, «Да» ≠ «да»; апгрейд проекта v3.0 не вносит `budgets.json` в его `owner`; пути тимлида не нормализуются (`docs//`, `..`); каталоги прогонов во `/tmp/two-tier-v3` копятся.
- `fix-until-green.js` — Q4, по замеру на ретро v3.1.
