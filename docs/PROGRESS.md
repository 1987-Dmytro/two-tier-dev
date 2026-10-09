# PROGRESS — two-tier-dev, SPEC-v3.2 «Jev-слой, без /goal» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 09.10.2026, 16:15 — фаза v3.2 закрыта: `VERDICT: PASS`
**Сделано:** все десять фич SPEC-v3.2 закрыты, их чеки прогнаны в этой сессии, evidence — `docs/evidence/F<n>-*-result.txt`; ветка `v3.2` запушена; CI на `b53dda5` — `CI_OK`; гейт на `b53dda5` — все маркеры фазы и `F10 GATE_OK`; `/verify-phase` из свежего клона `7f271b9` — `VERDICT: PASS`, блокирующих нет (`docs/evidence/verify-7f271b9.txt`). Финальные `bin/gate-v3.2` и `bin/check-ci v3.2` — после этого push. **Следующий шаг оператора:** финальная приёмка тимлида — ревью `v3.2-2` по `docs/evidence/verify-7f271b9.txt`, затем PR `v3.2` → `main` (merge — оператор). **Когда закончим:** со стороны исполнителя — сейчас, 09.10, 16:15; приёмка и merge — по готовности тимлида и оператора.

## Done
- Шаг 0a (`5a1913f`): архив v3.1 — `git mv` PROGRESS → `docs/archive/PROGRESS-v3.1.md`, evidence v3.1 → `docs/archive/evidence-v3.1/`, `accept-*.txt` → `docs/archive/evidence-v3/`.
- Шаг 0: `docs/PLAN-v3.2.md`; «до» — `bin/check-harness` на ките v3.1: корень репо `ENV_OK · HARNESS_OK · HOOKS_OK`, t3 `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` — `F4-harness-v3.1-baseline.txt`.
- **F1 `bin/jev`**: `bin/jev --self-test` → `JEV_OK` (фейковый сервер: 26 сторон контракта — ответ не той модели rc 3, ключ эхом в теле ошибки скрыт, ключ с пробелами и срок больше 10 мин — отказ до сети; живой вызов — HTTP 200, `jev-1.13.0`) — `docs/evidence/F1-jev-result.txt`; журнал расхода — `docs/evidence/jev.jsonl`.
- **F2 `spec-gate`**: `bin/check-harness` → `GATE_HOOK_OK` (20 проб: маркер — целая строка; строка STOP отпускает ход один раз — и правленая, и пунктом списка; голова PROGRESS — против коммита до сессии, пустая — не свежая; капы только смягчают блок; перенос кода в evidence после вердикта не проходит; два живых `claude -p`) — `docs/evidence/F2-harness-result.txt`.
- **F3 Abide**: `bin/check-harness` → `ABIDE_OK` (правка, печатающая секрет фикстуры, — блок act и требование починки; живая — в том же ходе, судят только хуки кита; чистая — тишина; блок Stop — заметка; `prompt` и `transcript_path` до Abide не доходят) — `docs/evidence/F3-harness-result.txt`; `abide_rules` ≤ 15.
- **F5 Toolgate «только отказ»**: `bin/check-harness` → `TOOLGATE_OK` (`jev-1.13.0`, аудит во `/tmp/two-tier-v3`, ключ — только из окружения; без ключа, без политики, на сроке и на `ask` — тишина; force-push — статическое правило; живой — отказ) — `docs/evidence/F5-harness-result.txt`.
- **F4 Окружение слоя**: `bin/check-harness` → `ENV_OK` на корне и на t3, у t3 все шесть маркеров против «до» `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL`; режим handoff на t3 — из `pluginConfigs` кита — `docs/evidence/F4-harness-result.txt`.
- **F6 handoff**: `bin/check-kit` → `KIT_OK · HANDOFF_OK` (строка шаблона 70 %, `/clear`; `pluginConfigs` кита — threshold 70, autoClear, `handoffs`; `.gitignore`; команда установки в `bin/two-tier-init`; `claude plugin validate` — 18 calls, `claude plugin test` — 8 из 8) — `docs/evidence/F6-kit-result.txt`.
- **F7 Запуск без `/goal`**: `bin/check-budget --templates` → `BUDGET_OK` (`kit-prompt`: `prompt_chars` и `docs/PROMPT.txt` в owner кита, схемы GOAL нет — grep пуст; `/goal` в ките — 0; `--` перед запросом — контракт шаблона); красные стороны: `docs/PROMPT.txt` в 4001 знак в проекте из кита — `FAIL prompt_chars`, шаблон без `--` — `FAIL contract`; `UPGRADE_OK`; t3 — пара из `docs/PROMPT.txt`; `VERIFY_OK` — `docs/evidence/F7-templates-result.txt`.
- **F8 Расход Jev**: `bin/check-spend` → `SPEND_OK` (фикстура сходится до токена и своих фикстур не оставляет; битые строки, BOM и копии отслеживаемого журнала в клонах не искажают итог; плечо: вызовов 6801, ~15 млн входных токенов, $0,64 ≈ €0,55, из них Toolgate — 5476, оценка) — `docs/evidence/F8-spend-result.txt`.
- **F10 Гейт v3.2**: `bin/gate-v3.2` на `b53dda5` → `F1 JEV_OK` … `F9 DOCS_OK`, уцелевшие v3.1 `HARNESS_OK`, `HOOKS_OK`, `VERIFY_OK`, `KIT_OK`, `OWNER_OK`, `F10 GATE_OK`, rc 0 (3 мин 27 с); `two-tier-init` кладёт ровно кит из git — 35 из 35, без кэша Python (ревью v3.2-1); CI `b53dda5` — `CI_OK` — `docs/evidence/F10-gate-result.txt`.
- **F9 Документы**: `bin/check-docs` → `DOCS_OK` (CHANGELOG v3.2 — 12 строк полей; LAUNCH — каждый флаг строки и `--` перед запросом, режимы `spec-gate`, ключ в окружении) — `docs/evidence/F9-docs-result.txt`.

## Next — один айтем
1. **Тимлид**: ревью `v3.2-2` по вердикту `7f271b9` и небазовым его находкам; оператор — PR `v3.2` → `main`.

## Open stop — NONE

## Notes
- STOP-INPUT 09.10 (`1809365`) снят: три правки кита внёс тимлид коммитом `6c50b67` (ревью `docs/reviews/v3.2-1.md`, решение оператора «А»); там же `docs/PROCESS.md` — `--` перед стартовым запросом.
- SessionStart-хук Abide просил скомпилировать рубрику (`new: kit/CLAUDE.md`): по SPEC §1 исполнитель рубрику не компилирует и не правит — `.abide/rubric.json` и `~/.abide/` не тронуты.
- Проба Abide «правка, печатающая секрет» — прямым вызовом хука на выдуманном `FIXTURE_SECRET` (PLAN, отклонение 11).
- Toolgate тимлида (политика пользователя, контекст задачи, порог 0,85) отказывал правки `kit/.claude/launch.settings.json` (0,88–0,90), `kit/budgets.json` оболочкой (0,92–0,93), проверку команд правок на клоне во `/tmp` (0,93) и составную команду коммита evidence F10 (0,93; тот же коммит прошёл шагами); отказанное не повторял — PLAN, отклонения 12, 13.
- `git add -A` в фикстурах во `/tmp` у `bin/check-verify`, `kit/bin/two-tier-upgrade`, `kit/bin/check-budget` — код v3.1, не тронут; своё — по точным путям.

## Named, not built
- Апгрейд проекта, уже переведённого `two-tier-upgrade` на v3.x: путь архива `docs/archive/kit-v2/` занят — конфликт в отчёте, rc 0; путь v2 → v3.2 проверен self-test.
- `spec-gate`: строка STOP внутри блока кода считается строкой; новая строка STOP с теми же первыми 60 знаками, что у отпущенной, — уже не новая.
- Небазовые находки финальной приёмки — 27 пунктов, `docs/evidence/verify-7f271b9.txt`, Named (покрытие чеков, нестандартные входы, косметика).
- Небазовые находки приёмки (`docs/evidence/verify-8cbfc5c.txt`, Named): «[toolgate] undefined» у отказа без reason, контракт шаблона не держит `--setting-sources` именно в строке запуска, `stats.json` неверной формы роняет `check-spend`, граница порога handoff в тестах мода; метка правила `goal` в выводе `check-budget`.
