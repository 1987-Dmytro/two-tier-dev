# PLAN-v3.2 — two-tier-dev, Jev-слой без `/goal`

**Спека:** `docs/SPEC-v3.2.md` · **база фазы:** `main` @ `dd78ad6` (локально; `origin/main` — `d2ca390`), SPEC — `0a64d07`, проводка тимлида — `3560bc3`, `35d0419` · **дата:** 09.10.2026 · только текущий план; отклонение по ходу — правка этого файла тем же коммитом.

## Файлы
Раскладка v3.1 остаётся: всё, что получает проект, — в `kit/`; инструменты проекта — в `kit/bin/` с symlink в `bin/`; только в репо — `bin/two-tier-init`, `bin/check-docs`, `bin/check-verify`, `bin/gate-v3.2`, `Makefile`. Новые файлы кита — в `KIT_FILES` апгрейда (его self-test сверяет список с китом).
- **Шаг 0a (`5a1913f`):** `git mv` PROGRESS v3.1 → `docs/archive/PROGRESS-v3.1.md`, evidence v3.1 → `docs/archive/evidence-v3.1/`, `accept-*.txt` (приёмки v3) → `docs/archive/evidence-v3/`; пути в записи v3.1 CHANGELOG — следом. «До» харнеса — `docs/evidence/F4-harness-v3.1-baseline.txt`.
- **F1:** `kit/bin/jev` — Node без зависимостей: `POST /v1/systemone` (docs.typesafe.ai/api), пин `jev-1.13.0` (алиас — отказ), таймаут `JEV_TIMEOUT_MS`, журнал расхода `docs/evidence/jev.jsonl` (время, кто звал, модель, HTTP, мс, токены; без state и ключа); `--self-test` — фейковый сервер на 127.0.0.1 и живой вызов при ключе. В `make ci`.
- **F2:**
  - `kit/.claude/hooks/spec-gate.mjs` — Stop-хук по SPEC §1; `kit/.claude/spec-gate.json` — режим, капы, вопросы и пороги (файл тимлида: owner и deny кита); регистрация — `Stop` в `kit/.claude/settings.json`;
  - `kit/bin/check-harness` — раздел `GATE_HOOK`: прямые вызовы хука на фикстурах фазы (свой git и origin во `/tmp/two-tier-v3`) и два живых `claude -p`; пары и пробы HOOKS — с `SPEC_GATE=off`; `kit/bin/verify-phase` — `SPEC_GATE=off`.
- **F3:**
  - `kit/.claude/hooks/abide.mjs` — обёртка четырёх хуков Abide (риск 3): ключ `TYPESAFE_AI_API_KEY` ← `TYPESAFE_API_KEY`, `ABIDE_HOME_DIR` во `/tmp/two-tier-v3`, блок на Stop → заметка оператору, просьба скомпилировать рубрику → заметка оператору; нет Abide — тишина;
  - `kit/.claude/settings.json` — `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`; `kit/budgets.json` — `abide_rules: 15`, `.abide/rubric.json` в owner, deny `Edit`;
  - `kit/bin/check-budget` — правило `abide_rules`; `kit/bin/check-harness` — раздел `ABIDE` с рубрикой-фикстурой; `kit/CLAUDE.md` — раздел правил тимлида.
- **F5:**
  - `kit/.claude/hooks/toolgate-deny.mjs` — `toolgate decide --policy` со своим сроком 8 с (на зависшем адресе `decide` не выходит), печатает только `deny`; PreToolUse в `kit/.claude/settings.json`;
  - политика исполнителя `kit/.claude/toolgate.yaml` (файл тимлида: owner и deny): модель `jev-1.13.0`, `fail_mode: passthrough`, `unattended.ask: ask` (под `dontAsk` решает поток прав), без контекста задачи, аудит без входа — во `/tmp/two-tier-v3/toolgate/`, ledger выключен;
  - раздел `TOOLGATE` в `check-harness`: пин модели (`toolgate check`), прямые вызовы (безобидное, `git push --force`, без ключа, срок), p95 задержки, живой `git push --force`.
- **F4:**
  - `kit/docs/PROCESS.template.md` — строки слоя (node, abide, toolgate, typesafe, Belay — тень, Steer-or-Queue — тень, Compact Adviser — `hint`, Quicksilver, Jev SEO, Jev Browser — «по задаче»), флаг `--setting-sources project,local`, подготовка `--add-dir`;
  - `kit/.claude/launch.settings.json` — `enabledPlugins`, `pluginConfigs` по таблице;
  - `kit/bin/check-harness` — режимы `pluginConfigs` против таблицы (обе стороны фикстурами в `--self-test`), живая проба тени Belay, пробы «по задаче» (`qs status`, `jevseo doctor`, `bin/check-ui`);
  - `kit/bin/check-ui` — шаблон: сценарий Jev Browser на `file://`-странице → `UI_OK`.
- **F6:** строка `handoff@two-tier-mods` и `pluginConfigs` (70 %, `/clear`) — шаблон PROCESS и launch settings кита; `handoffs/` — в `.gitignore`; `bin/two-tier-init` печатает команду установки; `kit/bin/check-kit` — раздел `HANDOFF` (`claude plugin validate` и `test` мода).
- **F7:**
  - `kit/docs/PROMPT.template.txt` — стартовый запрос; `git mv kit/docs/GOAL.template.txt docs/archive/GOAL.template-v3.1.txt`;
  - `kit/budgets.json` — `prompt_chars` вместо `goal_chars`, `docs/PROMPT.txt` вместо `docs/GOAL.txt` в owner; deny кита — так же;
  - `kit/bin/check-budget` — `Read first:` из `docs/PROMPT.txt` (нет — `docs/GOAL.txt`), `prompt_chars` (нет — `goal_chars`), проверка END STATE снята, контракт шаблона запроса, `/goal` в ките — FAIL;
  - строка запуска шаблона PROCESS — запрос аргументом `"$(cat docs/PROMPT.txt)"`; `check-harness` — пара стартует запросом из файла;
  - без `/goal`: `kit/CLAUDE.md`, скиллы `plan-phase` и `accept`, шаблон SPEC, `kit/docs/LAUNCH.md`;
  - `kit/bin/two-tier-upgrade` — новый список кита, шаблон GOAL — в выведенные, `docs/GOAL.txt` → `docs/PROMPT.txt` отдельным коммитом «Тимлид: …» (отклонение 9);
  - `verify-phase` (лаунчер и воркфлоу, копия в `.claude/workflows/`), `bin/check-verify` — запрос из `docs/PROMPT.txt`, иначе `docs/GOAL.txt`.
- **F8:** `kit/bin/check-spend` — журналы слоя за плечо (`--since`, по умолчанию — первый коммит после merge-base с `main`): вызовы, токены, $ и € (курс — константа с датой); `--self-test` — фикстура журналов с известной суммой, в `make ci`.
- **F9:** `CHANGELOG.md` (v3.2: поле — источник, до, после; моды — `hooks:` и `calls:`), `README.md`, `docs/README.md`, `docs/dev-system.ru.md`, `kit/docs/LAUNCH.md`, `bin/check-docs`.
- **F10:** `bin/gate-v3.2`; `git mv bin/gate-v3 bin/gate-v3.1 docs/archive/`; голова PROGRESS.

Не создаётся: `fix-until-green.js` (Named SPEC), правка рубрики и `CLAUDE.md` корня (файлы тимлида). Фикстуры, клоны и копии харнеса — только во `/tmp/two-tier-v3`; в evidence — обезличенная сводка.

## Порядок
- 0a → 0 → F1 → F2 → F3 → F5 → F4 → F6 → F7 → F8 → F9 → F10 → `/verify-phase` → правки → финальный гейт. `after:` спеки соблюдены.
- Чего SPEC не говорит:
  - F3 и F5 раньше F4: таблица и t3 F4 проверяют уже готовые хуки кита; пары харнеса идут той же строкой.
  - F8 после F7: журналы всех хуков слоя на месте.
  - F7 трогает те же `check-budget` и `check-harness`, что F2–F4, — после них.
- Push — после каждой фичи; CI — на каждый push.

## Риски
1. **UNVERIFIED: `pluginConfigs` из `--settings`.** Док: «User or managed», записи проекта и local игнорируются; `--settings` «может задать любой ключ пользователя». Не дойдёт — Belay блокирует Stop по-настоящему (`exit 2`). → живая проба F4: правка без чека и «готово» → решение `shadow` в журнале Belay для этой сессии; иначе — `JEV_BELAY_SHADOW=1` строкой запуска и строка тимлиду.
2. **Toolgate пишет под домашним каталогом** (аудит и ledger — `~/.toolgate`; ledger без `toolgate post` ещё и поднимает «запись, потом запуск» до `ask`). → политика кита: аудит во `/tmp/two-tier-v3/toolgate/`, ledger выключен; проба F5 находит сессию пробы в этом аудите.
3. **Abide против правил репо.** `jev-latest` зашит, ключ — `TYPESAFE_AI_API_KEY`, сессии — в `~/.abide/sessions`, `decision: block` на Stop, просьба компилировать рубрику, которую исполнитель не правит. → обёртка F3 (Файлы); пин модели невозможен — долг в CHANGELOG (отклонение 5).
4. **Блок во время фоновой работы.** Ход кончается, пока воркфлоу идёт в фоне. → `background_tasks` и `session_crons` из входа Stop — пропуск без блока (hooks, Stop input).
5. **Петля блоков.** → капы 12 блоков и 3 ч на сессию, три одинаковых списка подряд — `no-progress`; у Claude Code свой кап — 8 продолжений подряд, сброс на вызове инструмента.
6. **Стохастика.** Ответы Jev (STOP, голова, evidence), требование Abide, отказ Toolgate. → пороги 0,75 на вопросах-нарушениях; до 3 прогонов на сторону фикстуры, keep/discard через git, строка в журнале ниже.
7. **Время харнеса и гейта.** Новые живые `claude -p` (spec-gate, Abide, Toolgate, Belay). → разделы параллельно в гейте; `/verify-phase` ≤ 30 мин с гейтом в клоне.
8. **Утечка в публичный репо.** Журналы Belay, Toolgate, Steer-or-Queue, Compact Adviser несут промпты и вход инструментов. → `check-spend` берёт только числа, время и модель; в evidence — счётчики.
9. **CI без `claude`, `abide`, `toolgate`.** → в `make ci` — только чеки без них: `bin/jev --self-test`, `check-spend --self-test`, `check-harness --self-test`, `check-budget`, `check-kit` (раздел HANDOFF без `claude` — пропуск без маркера), `check-docs`.

## Доказательство
Идиом: `( set -o pipefail; { <КОМАНДА>; } 2>&1 | tee "$PWD/docs/evidence/F<n>-<check>-result.txt" ); rc=$?`. Доказательство — маркер в файле, а не существование файла.

| Фича | Команда SPEC | Маркер | Evidence | Дополнение PLAN |
|---|---|---|---|---|
| F1 | `bin/jev --self-test` | `JEV_OK` | `F1-jev-result.txt` | живой вызов: HTTP 200, `jev-1.13.0` |
| F2 | `bin/check-harness` | `GATE_HOOK_OK` | `F2-harness-result.txt` | прямые пробы и два живых `claude -p` |
| F3 | `bin/check-harness` | `ABIDE_OK` | `F3-harness-result.txt` | рубрика-фикстура, правка с секретом и чистая |
| F4 | `bin/check-harness` | `ENV_OK` | `F4-harness-result.txt` | на корне репо и на t3; «до» — `F4-harness-v3.1-baseline.txt` |
| F5 | `bin/check-harness` | `TOOLGATE_OK` | `F5-harness-result.txt` | p95 `toolgate decide` ≤ 2 с |
| F6 | `bin/check-kit` | `HANDOFF_OK` | `F6-kit-result.txt` | `claude plugin validate` и `test` |
| F7 | `bin/check-budget --templates` | `BUDGET_OK` | `F7-templates-result.txt` | `/goal` в ките — 0; апгрейд с `docs/GOAL.txt` — `UPGRADE_OK` |
| F8 | `bin/check-spend` | `SPEND_OK` | `F8-spend-result.txt` | фикстура журналов и итог плеча |
| F9 | `bin/check-docs` | `DOCS_OK` | `F9-docs-result.txt` | — |
| F10 | `bin/gate-v3.2` | `GATE_OK` | `F10-gate-result.txt` | финальный прогон после push — в транскрипте |
| фаза | `bin/verify-phase` | `VERDICT: PASS` | `verify-<sha>.txt` | свежий клон запушенного HEAD |

## Отклонения от SPEC и документации
1. `stop_hook_active`: док советует выйти при `true`; `spec-gate` держит конец хода и при нём — иначе блок один на промпт и фаза не держится; петлю режут капы SPEC §1 и кап Claude Code.
2. Фоновые задачи и cron сессии → пропуск без блока: сессия ждёт пробуждения (hooks, Stop input), как откладывал оценку `/goal`.
3. «Полный комплект» — код и Jev: список недостающего строит только код; Jev спрашивается, лишь когда код дал полный комплект или новую строку STOP с причиной §4.
4. Abide — обёрткой (риск 3): «конец хода не блокируется» — блок Stop становится заметкой оператору; требование починки правки (PostToolUse) доходит до Claude как есть.
5. Abide 0.0.9 и Compact Adviser 0.1.12 зовут `jev-latest` без настройки (abide `constants.ts:2`, compact `judge.ts:315`); пин — версией пакета; `jev-latest` = `jev-1.13.0` на 09.10 (docs.typesafe.ai/models). Steer-or-Queue — пин через `JEV_ROUTER_JEV_MODEL`, Quicksilver — `QUICKSILVER_MODEL`, Belay и Jev Browser — `JEV_MODEL`.
6. Compact Adviser в `-p` молчит (`isInteractive`) и без `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` молчит везде (`register.ts:147-159`): строка шаблона ставит переменную; режим `hint` — статикой; строке этого репо её добавляет тимлид.
7. В этом репо стартовый запрос — ещё `docs/GOAL.txt` (файл тимлида): `check-budget`, `spec-gate`, `verify-phase` читают `docs/PROMPT.txt`, иначе `docs/GOAL.txt`.
8. Корневой `budgets.json` — файл тимлида: новые ключи (`prompt_chars`, `abide_rules`) и записи owner (`docs/PROMPT.txt`, `.abide/rubric.json`, `.claude/spec-gate.json`, `.claude/toolgate.yaml`) — только в `kit/budgets.json`; `check-budget` читает прежнее имя с WARN, `check-kit` принимает ровно эту названную дельту, пока её не внесёт тимлид.
9. Проверка END STATE — код, не файл: «в архив» = уходит из `check-budget`, прежняя версия — в истории git и в архиве шаблона GOAL. Апгрейд переносит `docs/GOAL.txt` отдельным коммитом «Тимлид: …»: это файл тимлида, перенос велит SPEC.

## Журнал прогонов (стохастика)
| # | проба | итог | keep/discard |
|---|---|---|---|
| 1 | `GATE_HOOK`, фикстуры | 6 FAIL: время транскрипта не читалось (`"timestamp": "…"` с пробелом) — старая строка STOP считалась новой; голова PROGRESS живого «ok» тронута до сессии | discard — регэксп и проба «ok» правит голову сама |
| 2 | `GATE_HOOK`, фикстуры и живые | 13/13 OK; живой блок — 4 решения (block ×3, pass `no-progress`), полный комплект — `SPEC_GATE_OK` за один ответ | keep |
