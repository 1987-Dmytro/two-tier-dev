# LAUNCH — строка запуска исполнителя и парный контрольный прогон

## Запуск исполнителя
Строка запуска фазы — в `docs/PROCESS.md` проекта, раздел «Строка запуска исполнителя»; её пишет тимлид по таблице Environment. Из корня проекта, затем `/goal ` и текст `docs/GOAL.txt` целиком. Флаги:
- `--permission-mode auto` (D2): `defaultMode: "auto"` из `.claude/settings.json` не действует, флаг перекрывает настройки (permission-modes);
- `--model claude-opus-5-5` — полным id: алиас `opus` меняется сам (model-config);
- `--effort ultracode` — `xhigh` и ultracode на сессию: Claude сам планирует воркфлоу на каждую существенную задачу (workflows, model-config). Нужен Claude Code 2.1.203+ и модель с `xhigh`. В `system/init` ultracode не виден — его доказывает флаг в строке;
- `--settings .claude/launch.settings.json` — файл тимлида: `autoMode.environment` (доверенная инфраструктура: из настроек проекта `autoMode` не читается, из `--settings` — читается, auto-mode-config), `enabledPlugins` и `skillOverrides` по таблице Environment;
- `--strict-mcp-config --mcp-config '<json>'` — MCP ровно из строки: срезаются MCP пользователя и плагинов (замер тимлида 07.10);
- `ENABLE_CLAUDEAI_MCP_SERVERS=false` — коннекторы claude.ai не грузятся; кит выключает их и сам (`disableClaudeAiConnectors`), auto memory — тоже (`autoMemoryEnabled: false`);
- `--add-dir <каталог>` — только если фаза работает вне репо.

Харнес кита — `.claude/settings.json`: `worktree.baseRef: "head"` (worktree агента воркфлоу ветвится от HEAD, а не от ветки по умолчанию), `workflowSizeGuideline: "medium"` (<10 агентов — совет модели, не потолок), узкие `permissions.allow` на `bin/check-*`, `bin/gate-*`, `make ci`.

## Контрольный прогон — парный
`bin/check-harness` берёт строку из `docs/PROCESS.md` (нет его — из шаблона кита) и гоняет её как есть с `-p` на копии харнеса — свой каталог на запуск во `/tmp/two-tier-v3`:
`env -u ANTHROPIC_API_KEY` (только подписка), `--max-turns 3`, `--output-format stream-json --verbose`, без `--bare` (он пропускает хуки).
- run1 — заметка в `STEER.md` с маркером: маркер оказывается в файле-пробе;
- run2 — с `AGENT_STOP`: пробы нет, прогон остановлен на первом вызове, в выводе причина kill-switch;
- allow — под `dontAsk`, правила `permissions.allow` кита — через `--allowedTools`: в `-p` папка не доверена, и правила из `.claude/settings.json` не действуют (permissions, «What runs before you trust a folder»), в интерактивной сессии — после диалога доверия. `bin/check-*` идёт, команда вне правил — отказ;
- плюс: в `system/init` режим `auto` и `apiKeySource none`; поля settings по SPEC; `claude doctor` без ошибок настроек.

Гонять при смене модели, релизе Claude Code и правке харнеса или таблицы; итог «до и после» — строкой в CHANGELOG кита.
