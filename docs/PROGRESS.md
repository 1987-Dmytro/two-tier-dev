# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 3 построено: STOP-TL «Leg 3»
**Сделано:** Resume 400 (07.11 22:40–08.11 11:30). `risk-tier`: явная метка сильнее слов — `risk: low` при словах деплоя → OK «low: слова деплоя», токен — `high` (`da0f1ad`). Находка 400 измерена: `env` профиля в `settings.local` и в `settings.json` проекта не переключает `CLAUDE_CODE_SUBAGENT_MODEL` (Opus), `--settings` и окружение процесса — переключают (`2705fb5`, `HARNESS_NOTE` в F6, CHANGELOG). F9 `spec-board`: мод `mods/spec-board` (`/board`, строка статуса, файлы `spec-gate`, без модели и сети), 24 теста, validate; установлен оператором 08.11, в новой сессии вкладки рисует «board 36/0/2 · маркеров 8/9»; профиль кита `true`, строка шаблона «да» (`e392b3c`); `/code-review` дельты — 8 находок, 7 починены (`9afc3c2`). Круг `F1 F2 F9` на `9b9ae69` — PASS. Гейт клона поймал регрессию `da0f1ad` в `bin/check-verify` (сверка обрезанной строки risk-tier) — починена, evidence F7 — `VERIFY_OK` (`687ed27`). `bin/gate-v3.4` на `da00a54` — `GATE_OK` (536 с), на `93b4270` после push — `GATE_OK` со второго прогона (746 с; первый — `JEV_OK` нет: самопроба таймаута `bin/jev` 6357 мс против 5000 под нагрузкой гейта, отдельно 572–703 мс); `make ci` rc 0; `BUDGET_OK`; отчёт фазы — 38/38 с пробой.
**Следующий шаг:** тимлид читает плечо 3 (`STOP-TL` ниже).
**Когда закончим:** фаза v3.4 построена целиком; дальше — приёмка тимлида и его файлы.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`, `195bef0`, `4656dea`, `6b089d2`): голый `bin/check-harness` → `GATE_HOOK_OK` (и `ENV_OK HARNESS_OK HOOKS_OK ITEMS_OK COMMIT_OK`) — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`, `80e0e2e`, `d49e78e`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`, `2ba0dcb`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`, `e6c1958`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.
- **F5 Paar & Metriken** (`b2fbce2`, `d2b7961`, `d49e78e`, `502f935`): `bin/check-kit paar` → `PAAR_OK`; F5.3 `n=2 fon=7`: 2.1.316 — max 1216 с, 2.1.319 — max 1422 с, лимит 1800 с держит.
- **F6 Desktop** (`10875bd`, `4b7c87e`): `bin/check-harness --desktop` → `HARNESS_OK`; **F7 Risk & Evals** (`749c6e9`, `7344ceb`): `bin/check-verify` → `VERIFY_OK`; **F8 Dokumente, Mods & Gate** (`e145112`, `7344ceb`): `bin/gate-v3.4` → `GATE_OK`.
- **F9 Spec-board** (`5c7529a`, `745481f`, `f117594`, `e392b3c`, `9afc3c2`): `bin/check-kit mods` → `MODS_OK` — `docs/evidence/F9-check-kit-result.txt` (test=24, профиль true).
- Круги: `verify-265eaa4-F6-F8.txt` — PASS, 1422 с, 259 522 токена, named 9; `verify-502f935-F5-F7.txt` — PASS, 1394 с, named 5; плечо 3 — `verify-9b9ae69-F1-F2-F9.txt` — PASS, 1341 с, 331 158 токенов, блокирующих 0, named 9. Отчёт фазы — `docs/evidence/phase-report.md`: пунктов 38, с пробой 38.

## Next — один айтем
1. Чтение тимлида плеча 3; по его слову — следующая фаза или правки.

## Open stop — STOP-TL «Leg 3»
STOP: STOP-TL «Leg 3» — плечо 3 SPEC-v3.4 построено: risk-tier 400, находка 400 измерена, F9 spec-board установлен и включён в профиле, круг F1 F2 F9 PASS, gate-v3.4 GATE_OK.
Вопрос тимлиду: плечо 3 принято, фаза v3.4 закрыта?
Resume: Продолжай по SPEC-v3.4 по решению тимлида после чтения STOP-TL «Leg 3».
**Тимлиду (его файлы):** строка `spec-board` в `docs/PROCESS.md` — «да» (сейчас «нет», named круга) и `"spec-board@two-tier-mods": true` в `.claude/launch.settings.json`; находка 400 — модель подагентов профилем вкладки через `env` не выбирается, решение для профиля telefon; `$.process` в API помечен «CLI only» — вкладка Code (локальный CLI) рисует, другой хост потеряет порядок вердиктов и «не в HEAD»; `ONBOARDING.md` в корне — онбординг приложения, не исполнителя, не закоммичен.

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Время: стройка F1–F4 — 35 мин (15:38–16:13 06.11), мутации и починка — до 20:46; круг `be5c7a5` F1 F2 F3 — 1223 с, F4 — 647 с; F1 на `62f123a` — 827 с (CLI 2.1.319); плечо 2 — F5–F8 06–07.11, Resume 398 — правки и ревью 18:45–20:23, evidence до 21:00, круги 1422 + 1394 с.
- `spec-gate` Resume 398 и 400: решения `pass background:shell|workflow`, блоков 0, ложных 0. Замер вкладки (2.1.316): фоновый шелл — `pass background:shell`, фоновый подагент — `block`, 9 пунктов.
- Развилка F2.1: на выданной SPEC — `WARN planka-source`, до выдачи FAIL; красная сторона — на фикстурах. Развилка F1.5: `code_tab=10/10` — реплей точной формы Stop input и журнал вкладки; живой прогон — гейт §5 (1).
- Журнал telefon: 61/78 — срез ретро; по всем 03–05.11 — 66/83, чек печатает оба.
- Слово оператора 06.11: окно 5 ч снято тарифом (396); 07.11 — Graphify в ките (397: post-commit, `bin/two-tier-init`, `GRAPH_OK`); разработка — во вкладке Code (движок 2.1.317), CLI на PATH — только скриптам кита (2.1.319).
- Решение 397: живой abide — калибровка, `COMMIT_WARN` с числами; FAIL — судья ответил и не отказал. Пропуск на повторе диффа (CHECK_TIMEOUT) — тоже не ответ (`280433b`); abide в Resume 398 не ответил на 3 из 8 коммитов (skip CHECK_TIMEOUT, механизм пропуска верен).
- Решение 398, развилки: F5.2 — слова списка судятся в звене и инструменте (замер 7 SPEC telefon: в звене 0 из 2 настоящих вендоров, в обеих ячейках 2 из 2 и 2 ложных `API`); F7.1 — `in_flight()`: коммит пункта `F<n>.<k>:` на первой родительской линии после первого коммита запроса с этой SPEC и чистый диск → WARN; встроенный порог `check-window` — 100; пробы окна — на подставленном 85.
- Ложный `ENV_FAIL` (`4b7c87e`): строка тимлида «порог 100 %» у `window-guard` читалась режимом плагина; у плагина без опций число — не режим.
- Мутанты дельты 398: 24 воркфлоу и 8 после починки; выжил один — проводка `not g_index` в строке F8.1 `bin/check-docs` (чек сам себя не судит, как `say` плеча 2).
- F6: `HARNESS_WARN subagent-model-local settings.local=claude-opus-5-5 --settings=claude-sonnet-5-5` — модели подагентов прокси с профилем как settings.local и с `--settings` расходятся; строка с плеча 2, тимлиду к таблице.
- Ревью плеча 2 (четыре ревьюера, F5–F8): 42 находки, 14 блокирующих, починены; `/code-review` плеча (`a78782b..1bd2d42`): 10, 9 починены. Названо: `/phase resume` не ловит развилку без `<…>` и `|`; `/phase halt` после переезда в worktree пишет в стартовый каталог.
- Развилка F6.3: нет файла профиля — `HARNESS_WARN tab-profile profil=fehlt`, не красный; иной по смыслу — красный. MCP «да» в `pending` не судится (гонка init).
- Тимлиду: `bin/check-ui` пинит `jev-browser@0.1.2`, его `playwright ^1.63.0` плавает (Chromium из кэша npx под /tmp).
- **Побочный эффект, оператору (правило 4, C4):** вложенный `claude -p` с включёнными модами сам дописывает `~/.claude/plugins/installed_plugins.json` (записи user у `window-guard` и `phase-start`, local с путями `/tmp`); скрипты кита туда не пишут; откат — команда пользователя.
- PLAN-v3.4 на потолке: 150/150 строк. Мод пишется в `mods/` репо, не в `~/.claude/dev-mods` (C4); типы — локальный tsc против файла типов скилла: чисто.

## Named, not built
- Гейт: самопроба `bin/jev` «timeout» мерит стену процесса с порогом 5 с — под нагрузкой гейта флейк (1 из 3 прогонов плеча 3).
- Круг `9b9ae69`: F1 `caps.same_list` без проверки типа; пустой stdin Stop → block с exit 0; F2 `AMEND` не привязан к началу строки (code fence, коммент, дата 31.04); `gate-test` без таймаута, planken 1–2 → planken-inline; F9 `/board` молчит при сбое repo/root (collect вне try), открытый STOP — первая строка, два `session.start` — два таймера, журнал `null` — «не JSON».
- Из кругов: F1.1 `Monitor` → block (тип сравнивается точно); F1.2 `caps.same_list` 0 и 1 — значение вне нормы в файле тимлида; F3.4 `exit N` в `DEPLOY_CMD`; F4.2 нечисловой `latency_ms`; F5.5 `utilization` true или отрицательная — start; F6.1 `.built-head` не в UTF-8 — трассировка, короткий sha — ложный WARN; F6.4 журнал после обрезанной строки; F7.4 не-ASCII имена evidence в кавычках git; F5.2 колонка «инструмент замера» раньше «инструмент» — ложный OK.
