# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 3: F9 построен, ждёт установки у пользователя
**Сделано:** Resume 400 (07.11 22:40–08.11). `risk-tier`: явная метка сильнее слов — `risk: low` при словах деплоя → OK «low: слова деплоя», токен — по-прежнему `high` (`da0f1ad`). Находка 400 измерена: `env` профиля в `settings.local` и в `settings.json` проекта не переключает `CLAUDE_CODE_SUBAGENT_MODEL` (Opus), `--settings` и окружение процесса — переключают (`2705fb5`, `HARNESS_NOTE` в F6, CHANGELOG). F9 `spec-board`: мод `mods/spec-board` (`/board`, строка статуса, файлы `spec-gate`, без модели и сети), 22 теста, validate; `bin/check-kit mods` → `F9.1 board=2/1/1 nach=1/1/2`, `F9.2 validate=OK test=22`, `MODS_OK`; гейт — F9; marketplace; строка шаблона Environment и профиль кита — «нет»/false до установки. `/code-review` дельты (7 находок, 4 починены) и воркфлоу (25 мутантов, ревью; выжившие закрыты сторонами) — `5c7529a`…`f117594`.
**Следующий шаг оператора:** `STOP-INPUT` ниже — шаги 1–2 сделаны 08.11 (`claude plugin list`: spec-board 0.1.0, scope user, enabled, читается из `mods/spec-board`); осталась новая сессия вкладки.
**Когда закончим:** после установки — evidence F9, строка профиля кита `true`, точечный `bin/verify-phase F1 F2 F9`, `bin/phase-report`, `bin/gate-v3.4`, `make ci`, `bin/check-budget` → `STOP-TL «Leg 3»` ≈ 1 ч.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`, `195bef0`, `4656dea`, `6b089d2`): голый `bin/check-harness` → `GATE_HOOK_OK` (и `ENV_OK HARNESS_OK HOOKS_OK ITEMS_OK COMMIT_OK`) — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`, `80e0e2e`, `d49e78e`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`, `2ba0dcb`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`, `e6c1958`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.
- **F5 Paar & Metriken** (`b2fbce2`, `d2b7961`, `d49e78e`, `502f935`): `bin/check-kit paar` → `PAAR_OK`; F5.3 `n=2 fon=7`: 2.1.316 — max 1216 с, 2.1.319 — max 1422 с, лимит 1800 с держит.
- **F6 Desktop** (`10875bd`, `4b7c87e`): `bin/check-harness --desktop` → `HARNESS_OK`; **F7 Risk & Evals** (`749c6e9`, `7344ceb`): `bin/check-verify` → `VERIFY_OK`; **F8 Dokumente, Mods & Gate** (`e145112`, `7344ceb`): `bin/gate-v3.4` → `GATE_OK`.
- **F9 Spec-board** (`5c7529a`, `745481f`, `f117594`): `bin/check-kit mods` → `MODS_OK` — evidence после установки (STOP-INPUT).
- Круги плеча 2: `verify-265eaa4-F6-F8.txt` — PASS, 1422 с, 259 522 токена, named 9; `verify-502f935-F5-F7.txt` — PASS, 1394 с, 285 593 токена, named 5. Отчёт фазы — `docs/evidence/phase-report.md`: пунктов 38, без пробы только F9.1–F9.2 (плечо 3).

## Next — один айтем
1. После установки: `bin/evidence F9 check-kit -- bin/check-kit mods`, строка профиля и шаблона «да»/true, `bin/verify-phase F1 F2 F9`, отчёт, гейт, `make ci` → `STOP-TL «Leg 3»`.

## Open stop — STOP-INPUT «Leg 3 — Resume из новой сессии вкладки (spec-board)»
STOP: STOP-INPUT «Leg 3 — Resume из новой сессии вкладки (spec-board)» — шаги 1–2 сделаны 08.11; прежнюю строку отпустил ход другой сессии этой папки (журнал spec-gate, 08:41:55), работа ждёт Resume оператора.
Вопрос оператору: команды ниже выполнены и новая сессия вкладки открыта?
Resume: Продолжай по SPEC-v3.4 плечом 3 с evidence F9: spec-board установлен у пользователя, новая сессия открыта, строка профиля кита — true.
**Оператору, по порядку:**
1. `claude plugin marketplace update two-tier-mods` — сделано 08.11.
2. `claude plugin install spec-board@two-tier-mods --scope user` — сделано 08.11.
3. Новая сессия вкладки Code на папке `two-tier-dev`; `/board` должен открыть панель.
**Тимлиду (файлы его, код не ждёт):** строка `spec-board` в `docs/PROCESS.md` и `"spec-board@two-tier-mods": true` в `.claude/launch.settings.json` — после установки; находка 400: модель подагентов профилем вкладки через `env` не выбирается — решение для профиля telefon.

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
- Из кругов: F1.1 `Monitor` → block (тип сравнивается точно); F1.2 `caps.same_list` 0 и 1 — значение вне нормы в файле тимлида; F3.4 `exit N` в `DEPLOY_CMD`; F4.2 нечисловой `latency_ms`; F5.5 `utilization` true или отрицательная — start; F6.1 `.built-head` не в UTF-8 — трассировка, короткий sha — ложный WARN; F6.4 журнал после обрезанной строки; F7.4 не-ASCII имена evidence в кавычках git; F5.2 колонка «инструмент замера» раньше «инструмент» — ложный OK.
