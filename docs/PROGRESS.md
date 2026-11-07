# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 2 построено: `STOP-TL «Leg 2»`
**Сделано:** Resume 398 (07.11, 18:40–21:50). Слова тимлида в коде: F5.2 `vendor_words`, F7.1 `deploy_words`, F6.3 `profil=fehlt`, F8.1 `docs/README.md` на v3.4, порог недели 100 % на пробах (`d49e78e`…`4b7c87e`). Ревью дельты: `/code-review` (8 находок, 6 починены) и воркфлоу (32 мутанта, 2 ревьюера и проверка, 14 находок, блокирующих после починки 0). Evidence F1–F8 на финальном коде; круги `verify-phase` F6 F8 и F5 F7 — `VERDICT: PASS`, блокирующих 0; F5.3 закрыт (`n=2`); `bin/phase-report`, `make ci`, `bin/gate-v3.4` → `GATE_OK` на последнем HEAD.
**Следующий шаг:** тимлиду — чтение `STOP-TL «Leg 2»` и вопросы ниже, затем слово на плечо 3 (F9 `spec-board`); оператору до слова ничего.
**Когда закончим:** плечо 3 F9 ≈ 2 ч → `STOP-TL «Leg 3»` → приёмка §5 → гейт оператора → PR `v3.4 → main`.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`, `195bef0`, `4656dea`, `6b089d2`): голый `bin/check-harness` → `GATE_HOOK_OK` (и `ENV_OK HARNESS_OK HOOKS_OK ITEMS_OK COMMIT_OK`) — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`, `80e0e2e`, `d49e78e`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`, `2ba0dcb`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`, `e6c1958`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.
- **F5 Paar & Metriken** (`b2fbce2`, `d2b7961`, `d49e78e`, `502f935`): `bin/check-kit paar` → `PAAR_OK`; F5.3 `n=2 fon=7`: 2.1.316 — max 1216 с, 2.1.319 — max 1422 с, лимит 1800 с держит.
- **F6 Desktop** (`10875bd`, `4b7c87e`): `bin/check-harness --desktop` → `HARNESS_OK`; **F7 Risk & Evals** (`749c6e9`, `7344ceb`): `bin/check-verify` → `VERIFY_OK`; **F8 Dokumente, Mods & Gate** (`e145112`, `7344ceb`): `bin/gate-v3.4` → `GATE_OK`.
- Круги плеча 2: `verify-265eaa4-F6-F8.txt` — PASS, 1422 с, 259 522 токена, named 9; `verify-502f935-F5-F7.txt` — PASS, 1394 с, 285 593 токена, named 5. Отчёт фазы — `docs/evidence/phase-report.md`: пунктов 38, без пробы только F9.1–F9.2 (плечо 3).

## Next — один айтем
1. После слова тимлида — плечо 3: F9 `spec-board`; установка мода у пользователя — STOP-INPUT с командой.

## Open stop — STOP-TL «Leg 2»
STOP: STOP-TL «Leg 2» — плечо 2 построено: evidence F1–F8 на финальном коде, круги F6 F8 и F5 F7 — PASS, `/code-review` дельты разобран, `make ci` и `bin/gate-v3.4` зелёные.
Вопрос тимлиду: плечо 2 принято, и по `risk-tier` SPEC-v3.4 — метки `risk: high` у F3, F4, F7 или узкий `deploy_words`?
Resume: Продолжай по SPEC-v3.4 плечом 3: F9 spec-board — слово тимлида после чтения STOP-TL «Leg 2».
**Тимлиду, файлы его** (решается на чтении, код не ждёт):
- SPEC-v3.4: `BUDGET_WARN risk-tier F3 F4 F7` — `deploy_words` («Fenster», «на линию», `DEPLOY_OK`, `LIVE_OK`) ловят пробы шаблонов кита, деплоя на линию в фазе нет.
- `checks/planken.json`: `API` в `vendor_words` ложное на telefon SPEC-2 («узел n8n → API BO», «API `telefon-bo`»); одно звено не находит ни одного вендора telefon — судится и ячейка инструмента (PLAN, откл. 23).
- `in_flight()` — только в `risk-tier`; `planka-source` после правки SPEC тимлидом — FAIL, как было (F2.1): поправка с новой планкой вендора красна, пока нет пары или «ранняя». Нужен ли и там WARN — слово.
- Пункт F8.4 называет `/resume` и `/halt`, мод — `/phase resume` и `/phase halt` (встроенная `/resume`).
- Клон telefon: `budgets.json` — 85 и ключи окна 5 ч: `bin/check-kit` в проекте `WINDOW_FAIL` (с 396), `check-window` отказывает на 85 — фаза перевода.
- §5 (5): `window-guard` читает порог на старте сессии — подставленный 10 % действует с новой сессией (LAUNCH; тесты мода 100 % и 10 %).

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Время: стройка F1–F4 — 35 мин (15:38–16:13 06.11), мутации и починка — до 20:46; круг `be5c7a5` F1 F2 F3 — 1223 с, F4 — 647 с; F1 на `62f123a` — 827 с (CLI 2.1.319); плечо 2 — F5–F8 06–07.11, Resume 398 — правки и ревью 18:45–20:23, evidence до 21:00, круги 1422 + 1394 с.
- `spec-gate` Resume 398: 8 решений `pass background:shell|workflow`, блоков 0, ложных 0. Замер вкладки (2.1.316): фоновый шелл — `pass background:shell`, фоновый подагент — `block`, 9 пунктов.
- Развилка F2.1: на выданной SPEC — `WARN planka-source`, до выдачи FAIL; красная сторона — на фикстурах. Развилка F1.5: `code_tab=10/10` — реплей точной формы Stop input и журнал вкладки; живой прогон — гейт §5 (1).
- Журнал telefon: 61/78 — срез ретро; по всем 03–05.11 — 66/83, чек печатает оба.
- Слово оператора 06.11: окно 5 ч снято тарифом (396); 07.11 — Graphify в ките (397: post-commit, `bin/two-tier-init`, `GRAPH_OK`); разработка — во вкладке Code (движок 2.1.317), CLI на PATH — только скриптам кита (2.1.319).
- Решение 397: живой abide — калибровка, `COMMIT_WARN` с числами; FAIL — судья ответил и не отказал. Пропуск на повторе диффа (CHECK_TIMEOUT) — тоже не ответ (`280433b`); abide в этот вечер не ответил на 5 из 8 коммитов (skip, механизм пропуска верен).
- Решение 398, развилки: F5.2 — слова списка судятся в звене и инструменте (замер 7 SPEC telefon: в звене 0 из 2 настоящих вендоров, в обеих ячейках 2 из 2 и 2 ложных `API`); F7.1 — `in_flight()`: коммит пункта `F<n>.<k>:` на первой родительской линии после первого коммита запроса с этой SPEC и чистый диск → WARN; встроенный порог `check-window` — 100; пробы окна — на подставленном 85.
- Ложный `ENV_FAIL` (`4b7c87e`): строка тимлида «порог 100 %» у `window-guard` читалась режимом плагина; у плагина без опций число — не режим.
- Мутанты дельты 398: 24 воркфлоу и 8 после починки; выжил один — проводка `not g_index` в строке F8.1 `bin/check-docs` (чек сам себя не судит, как `say` плеча 2).
- F6: `HARNESS_WARN subagent-model-local settings.local=claude-opus-5-5 --settings=claude-sonnet-5-5` — модели подагентов прокси с профилем как settings.local и с `--settings` расходятся; строка с плеча 2, тимлиду к таблице.
- Ревью плеча 2 (четыре ревьюера, F5–F8): 42 находки, 14 блокирующих, починены; `/code-review` плеча (`a78782b..1bd2d42`): 10, 9 починены. Названо: `/phase resume` не ловит развилку без `<…>` и `|`; `/phase halt` после переезда в worktree пишет в стартовый каталог.
- Развилка F6.3: нет файла профиля — `HARNESS_WARN tab-profile profil=fehlt`, не красный; иной по смыслу — красный. MCP «да» в `pending` не судится (гонка init).
- Тимлиду: `bin/check-ui` пинит `jev-browser@0.1.2`, его `playwright ^1.63.0` плавает (Chromium из кэша npx под /tmp).
- **Побочный эффект, оператору (правило 4, C4):** вложенный `claude -p` с включёнными модами сам дописывает `~/.claude/plugins/installed_plugins.json` (записи user у `window-guard` и `phase-start`, local с путями `/tmp`); скрипты кита туда не пишут; откат — команда пользователя.
- PLAN-v3.4 на потолке: 150/150 строк.

## Named, not built
- Из кругов: F1.1 `Monitor` → block (тип сравнивается точно); F1.2 `caps.same_list` 0 и 1 — значение вне нормы в файле тимлида; F3.4 `exit N` в `DEPLOY_CMD`; F4.2 нечисловой `latency_ms`; F5.5 `utilization` true или отрицательная — start; F6.1 `.built-head` не в UTF-8 — трассировка, короткий sha — ложный WARN; F6.4 журнал после обрезанной строки; F7.4 не-ASCII имена evidence в кавычках git; F5.2 колонка «инструмент замера» раньше «инструмент» — ложный OK.
