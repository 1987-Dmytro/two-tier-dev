# LAUNCH — строка запуска исполнителя и парный контрольный прогон

## Запуск исполнителя
Из корня проекта. Effort фазы ставит тимлид в этой строке: `medium` — дефолт Opus 5.5, `high` — где важна проверка и вероятны пограничные случаи (model-config).

```sh
claude --permission-mode auto --model claude-opus-5-5 --effort medium --settings .claude/launch.settings.json
```

Затем `/goal ` и текст `docs/GOAL.txt` целиком. Почему так:
- auto mode (D2): `defaultMode: "auto"` из `.claude/settings.json` не действует, флаг перекрывает настройки (permission-modes);
- модель — полным id: алиас `opus` меняется сам (model-config);
- доверенная инфраструктура — `autoMode.environment` в `.claude/launch.settings.json`: из настроек проекта `autoMode` не читается, из `--settings` — читается (auto-mode-config). Файл тимлида, deny `Edit`;
- коннекторы claude.ai выключает сам кит (`disableClaudeAiConnectors` в `.claude/settings.json`), auto memory — тоже (`autoMemoryEnabled: false`).

## Контрольный прогон — парный
`bin/check-harness` берёт строку выше и гоняет её с `-p` на копии харнеса во `/tmp/two-tier-v3/harness`:
`env -u ANTHROPIC_API_KEY -u ENABLE_CLAUDEAI_MCP_SERVERS` (только подписка; коннекторы выключает кит, а не окружение), `--setting-sources project,local`, `--max-turns 3`, `--output-format stream-json --verbose`, без `--bare` (он пропускает хуки).
- Прогон 1 — без `AGENT_STOP`, в `STEER.md` заметка с маркером: маркер оказывается в файле-пробе.
- Прогон 2 — с `AGENT_STOP`: пробы нет, прогон остановлен на первом вызове, в выводе причина kill-switch.
- Плюс: в `system/init` режим `auto` и нет серверов `claude.ai …`; поля settings по SPEC; `claude doctor` без ошибок настроек.

Гонять при смене модели, релизе Claude Code и правке харнеса; итог «до и после» — строкой в CHANGELOG кита.
