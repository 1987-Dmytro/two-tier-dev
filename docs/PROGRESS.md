# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 1 закрыто, идёт плечо 2
**Сделано:** плечо 1: шаг 0, F1–F4 (судья конца хода, линты, замок и паспорт, окно и канарейка), мутации, `/code-review` (10 находок, 7 починены `6b089d2`, названы 3: F1.5 — реплей формы Stop input, вечный `shell` в фоне, срез журнала `bin/check-live`), окно 5 ч снято (`1e31e90`), graphify в ките (`9538f7c`–`ee7a5a8`), решения 396, 397. Голый `bin/check-harness` — все маркеры OK. Круг `verify-phase`: F4 — PASS на `be5c7a5`, F1 — PASS на `62f123a`; F2, F3 — NEEDS_WORK на `be5c7a5` только из-за `ENV_FAIL` F1, блокирующих по своим пунктам нет. **Следующий шаг оператора:** нет — слово на плечо 2 дано 07.11. **Когда закончим:** плечо 2 — строкой `STOP: STOP-TL «Leg 2»` в этом файле.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`, `195bef0`, `4656dea`, `6b089d2`): `bin/check-harness items` → `GATE_HOOK_OK` — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`, `80e0e2e`, `6b089d2`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`, `2ba0dcb`, `6b089d2`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`, `e6c1958`, `6b089d2`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.

## Next — один айтем
1. **F5 → F6 (F6.2–F6.4, остаток F6.1) → F7 → F8**, PLAN «К плечу 2»; `/code-review`, круг `verify-phase` F5 F6 F7 и F8, отчёт фазы, `bin/gate-v3.4`.

## Open stop — STOP-TL «Leg 1»
STOP: STOP-TL «Leg 1» — плечо 1 построено, круг сделан: F1 и F4 PASS, F2 и F3 без своих блокирующих; голый `bin/check-harness`, `make ci` зелёные.
Вопрос тимлиду: читать плечо 1 сейчас или вместе с плечом 2 на `STOP-TL «Leg 2»`?
Resume: «Продолжай по SPEC-v3.4 с F5» — слово оператора на плечо 2 дано 07.11, сессия идёт дальше сама.

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Архив evidence v3.3 сверх запроса (как `c3ff68d` в v3.3): старый хук засчитал бы `F4-verify-result.txt` и вердикты v3.3 пунктам v3.4.
- Слово оператора 06.11: окно 5 ч отменено тарифом — снято из `bin/check-window`, порогов кита, проб и документов; неделя судится одна, `make ci` зелёный целиком. Ещё называют окно файлы тимлида: корневой `budgets.json` (чек терпит два ключа), `docs/PROCESS.md`, SPEC §4 и F5.5. F5.5 в плече 2 — `WINDOW_WARN seven_day=fehlt`. Второе слово: `verify-phase` обязательна.
- Замер на этой вкладке (CLI 2.1.316): фоновый шелл — `pass background:shell`; фоновый подагент — `block`, 9 пунктов; ложных блоков — 0.
- Развилка F2.1: на самой SPEC-v3.4 три строки посадки без файла и n, p50/p95. SPEC §1 говорит «красная до выдачи»: до выдачи (HEAD на коммите запроса или SPEC правлена после него) — FAIL, выданная и идущая — `WARN planka-source`; красная сторона — на фикстурах. Тимлиду: пометить строки «ранняя» или дать файлы.
- Развилка F1.5: «10 концов хода» — реплей точной формы Stop input на фикстуре плюс живые решения этой вкладки в журнале; живой прогон вкладки на фикстуре — гейт оператора §5 (1).
- Журнал telefon: 61/78 — срез ретро (91 решение, 13 стопов, 12 cap-time, до 20:33Z); по всем 03–05.11 — 66/83, чек печатает оба.
- Слово оператора 07.11: graphify доделать и встроить в кит — `.githooks/post-commit` (`graphify update .` в фоне, если граф есть: AST, без модели и сети, только `graphify-out/`), первая сборка в `bin/two-tier-init`, строки отчёта апгрейда, `HARNESS_WARN graph-age` в `bin/check-harness`, `bin/check-kit graph` → `GRAPH_OK`. Вход Claude Code истёк посреди прогона (`OAuth session expired`) — оператор вошёл заново.
- Слово оператора 07.11: разработка — в приложении (вкладка Code, движок 2.1.317 приложения), CLI на PATH зовут только скрипты кита (`verify-phase`, пары `check-harness`, `check-window`); оператор обновил CLI до 2.1.319, 2.1.316 остался на диске. Автообновление в ките — сверка версий CLI, приложения и последней с командой `claude update` (F6.1), скрипты ничего не ставят.
- Решение 397: живой abide в разделе commit харнеса — `COMMIT_WARN` с числами, FAIL — неверный ответ судьи. Развилка: таймаут или ошибка abide на печати ключа — не ответ судьи, а пропуск (механизм пропуска верен): WARN «печать ключа без ответа», не FAIL; FAIL — судья ответил и не отказал.
- Круг F1 на `62f123a` (CLI 2.1.319) — 827 с, 167 161 токен, PASS. Названо кругом: `caps.same_list = 0` делает из блока pass (файл тимлида); `monitor`/`shell` со статусом completed отпускает ход — буква F1.1; `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=-5` в журнале — косметика.
- Решение 396 (`7c34be5`): голый `bin/check-harness` на нём — `OK run2: system/init = таблица`, `HARNESS_OK`, `HOOKS_OK`, `GATE_HOOK_OK`, `ITEMS_OK`, `COMMIT_OK`, красный один `jev-browser`; вывод — `docs/evidence/F1-check-harness-result.txt`.
- Тимлиду: `bin/check-ui` пинит `jev-browser@0.1.2`, а его `playwright ^1.63.0` плавает: ревизия Chromium зависит от кэша npx под /tmp и может уехать после чистки /tmp. Совет пакета `npx playwright install chromium` ставит другую ревизию: так вышло в этот раз. `frozen.json` — в `owner` корня на приёмке.
- `bin/check-harness env` на этой вкладке → `ENV_FAIL` не от правок плеча: таблица `docs/PROCESS.md` (файл тимлида) расходится с профилем v3.4 (ponytail, pr-review-toolkit, pyright-lsp — «да», сняты по SPEC §1; `limits` — «нет», включён в launch settings; скилл graphify — «да», не ставится), и нет Chromium для Playwright в домашнем кэше (`bin/check-ui`). PROCESS (g): таблицу правит тимлид, установку — оператор.
- Время плеча 1: стройка F1–F4 — 35 мин (15:38–16:13); мутации, ревью и починка — до 20:46; круг `verify-phase` на `be5c7a5`: F1 F2 F3 — 1223 с, 338 582 токена, F4 — 647 с, 157 032 токена (лимит 1800 с).
- Мутации и ревью плеча 1: 151 мутант, 81 выжил; подтверждённых находок 8. Закрыты правкой или пробой; что сознательно оставлено — `docs/PLAN-v3.4.md`, «Итог мутаций и ревью».
- `/code-review` диффа плеча — не починено, названо (`docs/PLAN-v3.4.md`, тот же раздел): F1.5 `code_tab=10/10` — реплей формы Stop input и журнал вкладки, живой прогон — гейт оператора; `shell` или `monitor`, который не кончится, отпускает ход — буква F1.1; `bin/check-live` не режет журнал по времени — срез делает проект, как в образце.

## Named, not built
- Из круга `verify-phase`: F1.1 тип фона сравнивается точно (`Monitor` → block); F1.2 `caps.same_list` 0 и 1 ведут себя странно — значение вне нормы в файле тимлида; F2.1 файл из пробелов и симлинк наружу считаются непустыми; F3.1 `F1.1 : x` с пробелом перед двоеточием проходит как id; F3.4 `DEPLOY_CMD` с `exit N` кончает деплой без строки `DEPLOY_FAIL`, `DEPLOY_OK` нет; F4.2 нечисловой и отрицательный `latency_ms` не красят; F4.3 медленный живой SMTP растягивает процесс, вердикт и код те же.
