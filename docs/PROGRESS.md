# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 1, F1–F4 построены, graphify в ките, F1 ждёт решения по abide
**Сделано:** шаг 0 и F1–F4: судья конца хода, линты, замок и паспорт, окно и канарейка; мутации разобраны и починены; `/code-review`: 10 находок, 7 починены (`6b089d2`), названы 3: F1.5 — реплей формы Stop input, вечный `shell` в фоне, срез журнала `bin/check-live`. Окно 5 ч снято (`1e31e90`). Круг `verify-phase` на `be5c7a5`: F4 — PASS; F1 F2 F3 — NEEDS_WORK из-за `ENV_FAIL`. Решение 396: таблица и Chromium 1254 поправлены — `ENV_OK`. Graphify встроен в кит по слову оператора (`9538f7c`–`ee7a5a8`, `GRAPH_OK`, CI зелёный). **Следующий шаг оператора:** ответ на вопрос стопа ниже. **Когда закончим:** плечо 1 — точечный `bin/verify-phase F1`, затем строка `STOP: STOP-TL «Leg 1»`.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`, `195bef0`, `4656dea`, `6b089d2`): `bin/check-harness items` → `GATE_HOOK_OK` — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`, `80e0e2e`, `6b089d2`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`, `2ba0dcb`, `6b089d2`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`, `e6c1958`, `6b089d2`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.

## Next — один айтем
1. **Точечный `bin/verify-phase F1`** после ответа оператора по `COMMIT_FAIL`: вердикт в `docs/evidence/`.

## Open stop — STOP-INPUT
STOP: STOP-INPUT «Leg 1 — живой abide в commit»: голый `bin/check-harness` на `ee7a5a8` — `ENV_OK`, `HARNESS_OK`, `HOOKS_OK`, `GATE_HOOK_OK`, `ITEMS_OK`, красный один `COMMIT_FAIL`: `F2.4 FAIL: … заметка (4 проб.) — rc 0 «»` и `F2.5 FAIL: … no-secret-values —`. Это живой суд abide в пробах v3.3, код плеча их не трогал; четыре прогона — красное каждый раз в другом месте, напрямую abide отвечает за 1,2 с (журнал — PLAN).
Вопрос оператору: принять `COMMIT_FAIL` как стохастику живого abide и идти в точечный `bin/verify-phase F1` или прогнать голый `bin/check-harness` ещё раз позже?
Resume: «Продолжай по SPEC-v3.4: COMMIT принят — точечный круг F1, затем STOP-TL» или «Продолжай по SPEC-v3.4: ещё прогон голого bin/check-harness, затем круг F1».

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Архив evidence v3.3 сверх запроса (как `c3ff68d` в v3.3): старый хук засчитал бы `F4-verify-result.txt` и вердикты v3.3 пунктам v3.4.
- Слово оператора 06.11: окно 5 ч отменено тарифом — снято из `bin/check-window`, порогов кита, проб и документов; неделя судится одна, `make ci` зелёный целиком. Ещё называют окно файлы тимлида: корневой `budgets.json` (чек терпит два ключа), `docs/PROCESS.md`, SPEC §4 и F5.5. F5.5 в плече 2 — `WINDOW_WARN seven_day=fehlt`. Второе слово: `verify-phase` обязательна.
- Замер на этой вкладке (CLI 2.1.316): фоновый шелл — `pass background:shell`; фоновый подагент — `block`, 9 пунктов; ложных блоков — 0.
- Развилка F2.1: на самой SPEC-v3.4 три строки посадки без файла и n, p50/p95. SPEC §1 говорит «красная до выдачи»: до выдачи (HEAD на коммите запроса или SPEC правлена после него) — FAIL, выданная и идущая — `WARN planka-source`; красная сторона — на фикстурах. Тимлиду: пометить строки «ранняя» или дать файлы.
- Развилка F1.5: «10 концов хода» — реплей точной формы Stop input на фикстуре плюс живые решения этой вкладки в журнале; живой прогон вкладки на фикстуре — гейт оператора §5 (1).
- Журнал telefon: 61/78 — срез ретро (91 решение, 13 стопов, 12 cap-time, до 20:33Z); по всем 03–05.11 — 66/83, чек печатает оба.
- Слово оператора 07.11: graphify доделать и встроить в кит — `.githooks/post-commit` (`graphify update .` в фоне, если граф есть: AST, без модели и сети, только `graphify-out/`), первая сборка в `bin/two-tier-init`, строки отчёта апгрейда, `HARNESS_WARN graph-age` в `bin/check-harness`, `bin/check-kit graph` → `GRAPH_OK`. Вход Claude Code истёк посреди прогона (`OAuth session expired`) — оператор вошёл заново.
- Решение 397: живой abide в разделе commit харнеса — `COMMIT_WARN` с числами, FAIL — неверный ответ судьи. Развилка: таймаут или ошибка abide на печати ключа — не ответ судьи, а пропуск (механизм пропуска верен): WARN «печать ключа без ответа», не FAIL; FAIL — судья ответил и не отказал.
- Решение 396 (`7c34be5`): голый `bin/check-harness` на нём — `OK run2: system/init = таблица`, `HARNESS_OK`, `HOOKS_OK`, `GATE_HOOK_OK`, `ITEMS_OK`, `COMMIT_OK`, красный один `jev-browser`; вывод — `docs/evidence/F1-check-harness-result.txt`.
- Тимлиду: `bin/check-ui` пинит `jev-browser@0.1.2`, а его `playwright ^1.63.0` плавает: ревизия Chromium зависит от кэша npx под /tmp и может уехать после чистки /tmp. Совет пакета `npx playwright install chromium` ставит другую ревизию: так вышло в этот раз. `frozen.json` — в `owner` корня на приёмке.
- `bin/check-harness env` на этой вкладке → `ENV_FAIL` не от правок плеча: таблица `docs/PROCESS.md` (файл тимлида) расходится с профилем v3.4 (ponytail, pr-review-toolkit, pyright-lsp — «да», сняты по SPEC §1; `limits` — «нет», включён в launch settings; скилл graphify — «да», не ставится), и нет Chromium для Playwright в домашнем кэше (`bin/check-ui`). PROCESS (g): таблицу правит тимлид, установку — оператор.
- Время плеча 1: стройка F1–F4 — 35 мин (15:38–16:13); мутации, ревью и починка — до 20:46; круг `verify-phase` на `be5c7a5`: F1 F2 F3 — 1223 с, 338 582 токена, F4 — 647 с, 157 032 токена (лимит 1800 с).
- Мутации и ревью плеча 1: 151 мутант, 81 выжил; подтверждённых находок 8. Закрыты правкой или пробой; что сознательно оставлено — `docs/PLAN-v3.4.md`, «Итог мутаций и ревью».
- `/code-review` диффа плеча — не починено, названо (`docs/PLAN-v3.4.md`, тот же раздел): F1.5 `code_tab=10/10` — реплей формы Stop input и журнал вкладки, живой прогон — гейт оператора; `shell` или `monitor`, который не кончится, отпускает ход — буква F1.1; `bin/check-live` не режет журнал по времени — срез делает проект, как в образце.

## Named, not built
- Из круга `verify-phase`: F1.1 тип фона сравнивается точно (`Monitor` → block); F1.2 `caps.same_list` 0 и 1 ведут себя странно — значение вне нормы в файле тимлида; F2.1 файл из пробелов и симлинк наружу считаются непустыми; F3.1 `F1.1 : x` с пробелом перед двоеточием проходит как id; F3.4 `DEPLOY_CMD` с `exit N` кончает деплой без строки `DEPLOY_FAIL`, `DEPLOY_OK` нет; F4.2 нечисловой и отрицательный `latency_ms` не красят; F4.3 медленный живой SMTP растягивает процесс, вердикт и код те же.
