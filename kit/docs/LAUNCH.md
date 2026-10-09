# LAUNCH — строка запуска исполнителя и парный контрольный прогон

## Запуск исполнителя
Строка запуска фазы — в `docs/PROCESS.md` проекта, раздел «Строка запуска исполнителя»; её пишет тимлид по таблице Environment. Из корня проекта; последний аргумент строки — стартовый запрос `"$(cat docs/PROMPT.txt)"` после `--` (шаблон `docs/PROMPT.template.txt`): фаза стартует без ручного набора — `claude "query"` открывает интерактивную сессию со стартовым запросом (cli-reference). Флаги:
- `--permission-mode auto` (D2): `defaultMode: "auto"` из `.claude/settings.json` не действует, флаг перекрывает настройки (permission-modes);
- `--model claude-opus-5-5` — полным id: алиас `opus` меняется сам (model-config);
- `--effort ultracode` — `xhigh` и ultracode на сессию: Claude сам планирует воркфлоу на каждую существенную задачу (workflows, model-config). Нужен Claude Code 2.1.203+ и модель с `xhigh`. В `system/init` ultracode не виден — его доказывает флаг в строке;
- `--settings .claude/launch.settings.json` — файл тимлида: `autoMode.environment` (доверенная инфраструктура: из настроек проекта `autoMode` не читается, из `--settings` — читается, auto-mode-config), `enabledPlugins` и `skillOverrides` по таблице Environment;
- `--strict-mcp-config --mcp-config '<json>'` — MCP ровно из строки: срезаются MCP пользователя и плагинов (замер тимлида 07.10);
- `ENABLE_CLAUDEAI_MCP_SERVERS=false` — коннекторы claude.ai не грузятся; кит выключает их и сам (`disableClaudeAiConnectors`), auto memory — тоже (`autoMemoryEnabled: false`);
- `--setting-sources project,local` (v3.2) — настройки, хуки, плагины и скиллы пользователя в сессию исполнителя не входят: его инструменты — из репо, launch settings и таблицы Environment (Agent SDK settingSources, cli-reference);
- `--no-chrome` — встроенный MCP `claude-in-chrome` (настоящий Chrome оператора) в сессии исполнителя выключен (cli-reference);
- `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` — Claude Code с 2.1.287 её не читает, а мод Compact Adviser 0.1.12 без неё молчит (`register.ts:147-159`);
- `--add-dir /tmp/two-tier-v3/skills` — скиллы пользователя со строкой «да»: из каталога `--add-dir` скиллы грузятся источником `project` (skills, permissions); ещё — если фаза работает вне репо;
- `--` перед стартовым запросом — конец флагов: `--add-dir` и `--mcp-config` берут по нескольку значений, и без `--` запрос уходит к ним лишним каталогом — сессия стартует без запроса (замер 09.10: `claude -p --add-dir <каталог> "<запрос>"` — «Input must be provided», с `--` — ответ).

Ключ Jev — `TYPESAFE_API_KEY` в окружении терминала, из которого идёт строка (не в репо, не в evidence, не в журналах); строку его длины печатать можно, значение — нельзя. Без ключа молчит Jev-часть слоя: Abide и Belay пропускают, Toolgate решает только статическими правилами (force-push — отказ), `spec-gate` решает кодом (комплект по файлам держит ход и без ключа), `bin/jev` выходит с кодом 2.

## Конец хода — `spec-gate`
Stop-хук кита `.claude/hooks/spec-gate.mjs` держит конец хода по файлам: у каждой фичи SPEC фазы — `docs/evidence/F<n>-*-result.txt` с маркером, ветка запушена, голова `docs/PROGRESS.md` (раздел «## Голова») переписана в этой сессии — не та, что в коммите до неё, `VERDICT: PASS` `/verify-phase` для HEAD. Комплект судится по запушенному HEAD: стартовый запрос, SPEC фазы, PROGRESS, evidence фич SPEC и файлы вердикта читаются из HEAD, и любой из них, который `git status` называет изменённым, неотслеживаемым или удалённым, держит ход по имени (журналы `jev.jsonl` и `spec-gate.jsonl` — не комплект); строки STOP считаются на диске, до коммита. Полный комплект — `SPEC_GATE_OK`, ход кончается; новая строка `STOP: <id>` с причиной SPEC §4 — тоже, один раз: та же строка (её первые 60 знаков; «— снят» в конце и пункт списка не в счёт) ход больше не кончает — ни в этой сессии, ни в следующей; иначе ход продолжается, причина — список недостающего. Нечёткое (вопрос и resume-строка у STOP, голова PROGRESS, evidence против «готово») — один вызов `bin/jev`; ошибка Jev — решает код.
- Режимы: `SPEC_GATE=off · shadow · active` в окружении, иначе `mode` в `.claude/spec-gate.json` (вопросы, пороги и капы — файл тимлида). `off` — молчит; `shadow` — только строка журнала; `active` — блок. `claude -p` приёмки и пар `check-harness` идут с `SPEC_GATE=off`.
- Предохранители: 12 блоков и 3 ч на сессию, один список три раза подряд — пропуск `no-progress`, фоновые задачи и `AGENT_STOP` — пропуск. Каждое решение — строка журнала `spec-gate.jsonl` в `docs/evidence/` проекта.

## Слой Jev в харнесе кита
- Abide — `.claude/hooks/abide.mjs` на четырёх событиях: правила раздела `## Rules for every edit` в `CLAUDE.md`, рубрика `.abide/rubric.json` (компилирует тимлид); требование починки правки доходит до Claude, конец хода не держит.
- Toolgate — `.claude/hooks/toolgate-deny.mjs`: `toolgate decide` по политике `.claude/toolgate.yaml`, печатает только `deny`; на `allow` и `ask` молчит — решает поток прав.
- Плагины слоя — `enabledPlugins` и `pluginConfigs` launch settings по таблице Environment; пины моделей — `env` launch settings.

Харнес кита — `.claude/settings.json`: `worktree.baseRef: "head"` (worktree агента воркфлоу ветвится от HEAD, а не от ветки по умолчанию), `workflowSizeGuideline: "medium"` (<10 агентов — совет модели, не потолок), узкие `permissions.allow` на `bin/check-*`, `bin/gate-*`, `make ci`.

## Контрольный прогон — парный
`bin/check-harness` берёт строку из `docs/PROCESS.md` (нет его — из шаблона кита) и гоняет её как есть с `-p` на копии харнеса — свой каталог на запуск во `/tmp/two-tier-v3`:
`env -u ANTHROPIC_API_KEY` (только подписка), `--max-turns 3`, `--output-format stream-json --verbose`, без `--bare` (он пропускает хуки).
- run1 — заметка в `STEER.md` с маркером: маркер оказывается в файле-пробе;
- run2 — с `AGENT_STOP`: пробы нет, прогон остановлен на первом вызове, в выводе причина kill-switch;
- allow — под `dontAsk`, правила `permissions.allow` кита — через `--allowedTools`: в `-p` папка не доверена, и правила из `.claude/settings.json` не действуют (permissions, «What runs before you trust a folder»), в интерактивной сессии — после диалога доверия. `bin/check-*` идёт, команда вне правил — отказ;
- плюс: в `system/init` режим `auto` и `apiKeySource none`; поля settings по SPEC; `claude doctor` без ошибок настроек.
- копия харнеса несёт свой CLAUDE.md, где оператор авторизует пробы. Правила кита («`git add` по точным путям») агент воркфлоу ставит выше промпта скрипта и иначе сам не пробует то, что должен отказать хук.

Гонять при смене модели, релизе Claude Code и правке харнеса или таблицы; итог «до и после» — строкой в CHANGELOG кита.
