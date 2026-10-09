# LAUNCH — строка запуска исполнителя и парный контрольный прогон

## Запуск исполнителя
Строка запуска фазы — в `docs/PROCESS.md` проекта, раздел «Строка запуска исполнителя»; её пишет тимлид по таблице Environment. Из корня проекта; последний аргумент строки — стартовый запрос `"$(cat docs/PROMPT.txt)"` (шаблон `docs/PROMPT.template.txt`): фаза стартует без ручного набора — `claude "query"` открывает интерактивную сессию со стартовым запросом (cli-reference). Флаги:
- `--permission-mode auto` (D2): `defaultMode: "auto"` из `.claude/settings.json` не действует, флаг перекрывает настройки (permission-modes);
- `--model claude-opus-5-5` — полным id: алиас `opus` меняется сам (model-config);
- `--effort ultracode` — `xhigh` и ultracode на сессию: Claude сам планирует воркфлоу на каждую существенную задачу (workflows, model-config). Нужен Claude Code 2.1.203+ и модель с `xhigh`. В `system/init` ultracode не виден — его доказывает флаг в строке;
- `--settings .claude/launch.settings.json` — файл тимлида: `autoMode.environment` (доверенная инфраструктура: из настроек проекта `autoMode` не читается, из `--settings` — читается, auto-mode-config), `enabledPlugins` и `skillOverrides` по таблице Environment;
- `--strict-mcp-config --mcp-config '<json>'` — MCP ровно из строки: срезаются MCP пользователя и плагинов (замер тимлида 07.10);
- `ENABLE_CLAUDEAI_MCP_SERVERS=false` — коннекторы claude.ai не грузятся; кит выключает их и сам (`disableClaudeAiConnectors`), auto memory — тоже (`autoMemoryEnabled: false`);
- `--setting-sources project,local` (v3.2) — настройки, хуки, плагины и скиллы пользователя в сессию исполнителя не входят: его инструменты — из репо, launch settings и таблицы Environment (Agent SDK settingSources, cli-reference);
- `--no-chrome` — встроенный MCP `claude-in-chrome` (настоящий Chrome оператора) в сессии исполнителя выключен (cli-reference);
- `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` — Claude Code с 2.1.287 её не читает, а мод Compact Adviser 0.1.12 без неё молчит (`register.ts:147-159`);
- `--add-dir /tmp/two-tier-v3/skills` — скиллы пользователя со строкой «да»: из каталога `--add-dir` скиллы грузятся источником `project` (skills, permissions); ещё — если фаза работает вне репо.

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
