# PLAN-v3.1 — two-tier-dev, ultracode по полной

**Спека:** `docs/SPEC-v3.1.md` · **база фазы:** `main` @ `7957d68`, сид — `3bf348a`, хендофф — `2049438` · **дата:** 07.10.2026 · только текущий план; отклонение по ходу — правка этого файла тем же коммитом.

## Файлы
Раскладка v3 остаётся: всё, что получает проект, — в `kit/`; инструменты проекта — в `kit/bin/` с symlink в `bin/`; только в репо — `bin/two-tier-init`, `bin/check-docs`, `bin/check-verify`, `bin/gate-v3`, `bin/gate-v3.1`, `Makefile`.
- **Шаг 0b — архив v3** (`git mv`, C1): `docs/evidence/F*-result.txt` и `F4-harness-v2-baseline.txt` → `docs/archive/evidence-v3/` (номера фич v3 и v3.1 совпадают, `accept` читает `docs/evidence/*-result.txt`); `docs/PROGRESS.md` → `docs/archive/PROGRESS-v3.md`, новый PROGRESS по шаблону. `accept-*.txt` остаются: SPEC ссылается на `accept-8f1d232.txt`. Пути в CHANGELOG v3, README, `docs/README.md` — следом.
- **F1:**
  - `kit/.claude/settings.json` — `worktree.baseRef: "head"`, `workflowSizeGuideline: "medium"`, `permissions.allow`: `Bash(bin/check-*)`, `Bash(bin/gate-*)`, `Bash(make ci)`;
  - `kit/docs/LAUNCH.md` — флаги строки запуска, строка — ссылкой на PROCESS;
  - строка запуска шаблона PROCESS с `--effort ultracode`;
  - `kit/bin/check-harness`: статика новых полей; пара — строкой из `docs/PROCESS.md` (нет его — из шаблона) как есть: префикс `VAR=…` → env, без `--setting-sources`; прогон `allow` под `dontAsk`; копия харнеса — своя на запуск (`mkdtemp`);
  - CHANGELOG v3.1 — строка на поле: док, до, после;
  - разовый замер `baseRef` («до» `fresh` / «после» `head`) — `docs/evidence/F1-baseref-result.txt`.
- **F2:** `kit/bin/check-harness` — разбор таблицы Environment и сверка `system/init` чистой функцией, `--self-test` (фикстуры обеих сторон, без `claude`) в `make ci`; `kit/docs/PROCESS.template.md` — таблица в форме §1 (база оператора); `kit/.claude/launch.settings.json` — `enabledPlugins`, `skillOverrides` по таблице шаблона. Правило «`mcp_servers` 0» снято: `claude.ai …` — строка таблицы «нет».
- **F3:** `kit/.claude/hooks/steer.sh` — при `agent_id` во входе хука выход без доставки; `refuse_sweeping_commands.py` — текст отказа без ссылки на файл; `kill-switch.sh` — по замеру риска 1; пробы в `check-harness`.
- **F4:**
  - `kit/.claude/workflows/verify-phase.js` + копия `.claude/workflows/verify-phase.js` в корне репо — равенство сверяет `check-kit`;
  - `kit/bin/verify-phase` + symlink — запуск;
  - `bin/check-verify` — фикстуры во `/tmp/two-tier-v3`.
- **F5:** `kit/.claude/skills/accept/SKILL.md` v3.1; `kit/bin/check-kit` — контракт accept и воркфлоу.
- **F6:** `kit/docs/GOAL.template.txt`, `kit/docs/PROCESS.template.md` (§Деньги — лимиты, % недели), `kit/CLAUDE.md`; контракт фраз в `check-budget --templates`.
- **F7:** `kit/bin/check-budget` (`rule_owner`, фикстуры); `budgets.json` в `defaults.owner` обоих `budgets.json`; `Edit(/budgets.json)` — deny в `kit/.claude/settings.json`.
- **F8:** `CHANGELOG.md`, `README.md`, `docs/README.md`, `docs/dev-system.ru.md`, `kit/docs/LAUNCH.md`, `bin/check-docs`.
- **F9:** `bin/gate-v3.1`; `bin/gate-v3` — `check-ci` текущей ветки, свои `t3` и логи на запуск; голова PROGRESS.

Не создаётся: `fix-until-green.js` (Q4); копии харнеса, клоны и фикстуры — только во `/tmp/two-tier-v3`, в evidence — обезличенная сводка.

## Порядок
- 0 → 0b → F1 → F2 → F3 → F7 → F4 → F5 → F6 → F8 → F9 → `/verify-phase` фазы → правки → финальный гейт. `after:` спеки соблюдены.
- Чего SPEC не говорит:
  - F7 раньше F4: правка `budgets.json` должна попасть в один коммит с новой семантикой lint (риск 4).
  - F2 до F3: пары хуков идут той же строкой запуска.
  - F1 пишет строку запуска в шаблон PROCESS, F2 — таблицу.
- Push — после 0b, после каждой фичи; CI — на каждый push.

## Риски
1. **UNVERIFIED: `continue:false` kill-switch на агенте воркфлоу.** Неизвестно, останавливает ли он только агента или всю `-p` сессию. Различающий тест: первый вызов агента — `touch AGENT_STOP`, второй — запись пробы. «Остановлен» = проба не создана. Если создана — `exit 2`.
2. **Триггеры проб на агентах — от агента.** `AGENT_STOP` или `STEER.md` до запуска остановят или накормят главную сессию раньше агента. Поток родителя не несёт вызовов агента — судим по файлам и git:
   - `STEER.md` пережил второй вызов агента;
   - `docs/STATUS.md`, созданный заранее, не изменён;
   - индекс пуст после `git add -A`.
   Узкие `--allowedTools` на безобидные команды агента — классификатор не путает итог.
3. **Ходы `-p` после воркфлоу.** Главная сессия просыпается на уведомление и упирается в `--max-turns 3` (rc 1, два `result`). Судим по событиям и файлам, не по rc; промпт — «после уведомления — без инструментов».
4. **Catch-22 владения.** Коммит, вносящий `budgets.json` в `defaults.owner`, сам красный при списке HEAD. → Lint коммитов берёт список владения на родителе коммита (`git show <sha>^:budgets.json`). Фикстуры: вносящий коммит — OK; поздняя правка `budgets.json` — FAIL; снятие записи и правка того же файла — FAIL.
5. **`/verify-phase` ≤ 30 мин.** Мешают вложенность (`gate-v3.1` → `check-verify` → `/verify-phase`) и потолок Bash агента 10 мин. →
   - Свежий прогон чеков делает лаунчер: гейт фазы в свежем клоне, лог — агентам через env `VERIFY_GATE_LOG`; агенты долгие чеки не перезапускают.
   - `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`, `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS=16` (8 CPU дают 6).
   - Гейты параллельны внутри.
6. **Столкновение путей.** Параллельные `check-harness`, гейты и фикстуры портят общий `/tmp/two-tier-v3/harness` и `t3`. → каталог на запуск (`mkdtemp`).
7. **Стохастика вердикта.** До 3 прогонов на сторону фикстуры, keep/discard через git, строка в журнале ниже. Чистая фикстура молчит, если «готово» точное и чек его покрывает целиком; блокирующую кандидата проверяет опровергатель.
8. **Утечка в публичный репо.** `system/init` и `output_file` содержат домашние пути — в вывод только `source`, имена, счётчики, маркеры.
9. **Лимиты: 40 % недели.** Ориентир — ~20 агентов на прогон фазы и ≤ 6 на фикстуру; урезать объём — STOP-SCOPE.
10. **150 ходов.** Запись, чек, `tee` и коммит — одним вызовом. К 140-му ходу не закрыто — чекпоинт (C).

## Доказательство
Идиом: `( set -o pipefail; { <КОМАНДА>; } 2>&1 | tee "$PWD/docs/evidence/F<n>-<check>-result.txt" ); rc=$?`. Доказательство — маркер в файле, а не существование файла.

| Фича | Команда SPEC | Маркер | Evidence | Дополнение PLAN |
|---|---|---|---|---|
| F1 | `bin/check-harness` | `HARNESS_OK` | `F1-harness-result.txt` | `F1-baseref-result.txt` — `head` против `fresh`; прогон `allow` под `dontAsk` |
| F2 | `bin/check-harness` | `ENV_OK` | `F2-harness-result.txt` | на t3 — та же команда; `--self-test` в `make ci` |
| F3 | `bin/check-harness` | `HOOKS_OK` | `F3-harness-result.txt` | пробы на главной сессии и на агенте |
| F4 | `bin/check-verify` | `VERIFY_OK` | `F4-verify-result.txt` | красная, чистая и `VERIFY_TIMEOUT` |
| F5 | `bin/check-kit` | `KIT_OK` | `F5-kit-result.txt` | — |
| F6 | `bin/check-budget --templates` | `BUDGET_OK` | `F6-templates-result.txt` | контракт фраз |
| F7 | `bin/check-budget --self-test intent owner` | `OWNER_OK` | `F7-owner-result.txt` | красная проба на правиле `8f1d232` → `OWNER_FAIL` |
| F8 | `bin/check-docs` | `DOCS_OK` | `F8-docs-result.txt` | — |
| F9 | `bin/gate-v3.1` | `GATE_OK` | `F9-gate-result.txt` | финальный прогон — в транскрипте |
| (A) | `bin/verify-phase` | `VERDICT: PASS` | `verify-<sha>.txt` | свежий клон запушенного HEAD |

## Отклонения от SPEC и документации
1. Ultracode в `system/init` не виден: полей effort и ultracode там нет. F1 доказывает его строкой таблицы «флаг» и флагом в строке, а не `system/init`.
2. Пара идёт без `--setting-sources project,local`: иначе плагины пользователя не грузятся, и `system/init` не равен окружению исполнителя (замер тимлида 07.10 — без него).
3. Allow-правила доказаны прогоном под `dontAsk`: в `auto` классификатор не различает «правило» и «одобрил сам» (permission-modes). В `-p` папка не доверена, и `permissions.allow` из `.claude/settings.json` не применяется (permissions, «What runs before you trust a folder»; замер 07.10: точное `Bash(bin/check-ci)` — отказ). Поэтому прогон `allow` передаёт те же правила через `--allowedTools`. У исполнителя в интерактивной сессии они действуют после диалога доверия.
4. Встроенные плагины `@builtin` (`cc-plugin-*`) в сверке плагинов не считаются: пользователь ими не управляет, PROCESS называет их прозой.
5. Вердикт `/verify-phase` лаунчер берёт из `task_notification.output_file`. Поле документировано (agent-sdk/typescript), формат JSON `{result, workflowProgress}` — замер 07.10.
6. Сам скрипт файлов не трогает и `Date.now()` не зовёт (workflows). Поэтому лимит 30 мин, свежий клон, гейт и запись `verify-<sha>.txt` — у лаунчера `bin/verify-phase`. Вердикт считает скрипт: `PASS` ⇔ блокирующих 0.
7. Репо кита — не установка кита: allow `bin/check-*`, `bin/gate-*`, `make ci` и `Workflow(verify-phase)` лаунчер передаёт `--allowedTools`; `baseRef: head` — из `.claude/launch.settings.json` тимлида.
8. `bin/gate-v3` правится: `check-ci` текущей ветки вместо `v3` (иначе красный на `v3.1`), свои каталоги на запуск.

## Журнал прогонов `/verify-phase`
| # | фикстура или фаза | итог | keep/discard |
|---|---|---|---|
| 1 | `bin/check-verify`: red, clean, limit | упал сам чек: эвристика meta приняла скобки в строке за вызов; у фикстуры не было `docs/evidence/` | discard — правка чека, воркфлоу не тронут |
| 2 | red (`a317efd`) | `NEEDS_WORK`: дефисы по краям и `'---'` → `-` с rc 0 — блокирующая; агентов 5, 87 с | keep |
| 2 | clean (`b558f1e`) | `PASS`, блокирующих 0; мутация `.strip("-")` → красный чек; агентов 3, 75 с | keep |
| 2 | limit, `--limit 20` | `VERIFY_TIMEOUT` на 25 с, файла вердикта нет | keep |
