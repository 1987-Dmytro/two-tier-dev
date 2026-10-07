# PROCESS — two-tier-dev — механика проекта (файл тимлида; исполнитель читает и не правит)

## Environment
Базовый набор оператора — всегда; сверх него инструмент входит только под названную фичу или чек. Таблица — источник для `.claude/launch.settings.json` и строки запуска ниже; сверка — `bin/check-harness` по `system/init` (с v3.1, F2). Замер тимлида 07.10 строкой ниже: MCP — только `context7` (connected); плагины — ponytail, pyright-lsp, pr-review-toolkit и встроенные `cc-plugin-*`; скиллов Cowork — 0; режим `auto`. Встроенные MCP (`claude-in-chrome`, `computer-use`) в `-p` не грузятся и в `system/init` не видны: их держат строки таблицы — флаг `--no-chrome` в строке запуска сверяет `check-harness`, `/mcp` смотрит оператор на гейте.

| инструмент | форма | id | вкл | фича или чек | установка | удаление |
|---|---|---|---|---|---|---|
| git, gh | CLI | `git`, `gh` | да | всегда: коммиты, push ветки, CI | — | — |
| python3 | CLI | `python3` | да | всегда: `bin/check-*` | — | — |
| ultracode | флаг | `--effort ultracode` | да | все фичи (D4) | строка запуска | — |
| Ponytail | плагин | `ponytail@ponytail` | да | база | `/plugin install ponytail@ponytail` | строка таблицы |
| Context7 | MCP | `context7` | да | база: доки библиотек | `--mcp-config` строки запуска, stdio `npx -y @upstash/context7-mcp` | из строки запуска |
| Graphify | скилл | `graphify` | да | база; граф строит тимлид до `/goal`, где корпус больше grep-удобного — в ките нет | — | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| Context7 (плагин) | плагин | `context7@claude-plugins-official` | нет | удалённый MCP требует OAuth (`needs-auth`); вместо него — stdio-сервер выше | — | — |
| commit-commands | плагин | `commit-commands@claude-plugins-official` | нет | коммиты и PR мимо дисциплины | — | — |
| security-guidance | плагин | `security-guidance@claude-plugins-official` | нет | по задаче: сеть и ввод пользователя; его ревью на Stop ест лимиты | — | — |
| frontend-design | плагин | `frontend-design@claude-plugins-official` | нет | по задаче: UI | — | — |
| code-review | плагин | `code-review@claude-plugins-official` | нет | PR в `main` | — | — |
| serena | плагин | `serena@claude-plugins-official` | нет | — | — | — |
| brain-init | скилл | `brain-init` | нет | харнес v2 | — | — |
| memory-protocol | скилл | `memory-protocol` | нет | — | — | — |
| скиллы Cowork | скилл | `anthropic-skills:*` — 20, поимённо в `.claude/launch.settings.json` | нет | скиллы тимлида и Cowork исполнителю не нужны | — | — |
| ref, blockscout | MCP | `ref`, `blockscout` | нет | вне таблицы; blockscout — по задаче (DeFi) | — | — |
| коннекторы claude.ai | MCP | `claude.ai …` | нет | почта, диск, календарь | — | — |
| Claude in Chrome | MCP | `claude-in-chrome` | нет | встроенный MCP: настоящий Chrome оператора с его входами; в `-p` не грузится, в сессии — при «Enabled by default» у оператора (гейт v3.1, `/mcp`: 22 инструмента) | — | флаг ниже |
| без Chrome | флаг | `--no-chrome` | да | выключает встроенный `claude-in-chrome` в сессии исполнителя (cli-reference) | строка запуска | — |
| computer-use | MCP | `computer-use` | нет | встроенный MCP: экран и приложения Mac оператора; по умолчанию выключен (`○` в `/mcp`) | — | — |

## Строка запуска исполнителя — фаза v3.1
Из корня репо, после `mkdir -p /tmp/two-tier-v3`:

```sh
ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --no-chrome --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}' --add-dir /tmp/two-tier-v3
```

Затем `/goal ` и текст `docs/GOAL.txt` целиком. Зачем каждый флаг — `docs/LAUNCH.md`.

## Деньги
1. **Потолок проекта:** 0 € — только подписка (C3); usage credits выключены.
2. **Лимиты подписки:** планка на фазу исполнителя — 15 % недели, v3.1 — 40 % (D4). `/usage` до и после плеча записывает тимлид в STATUS; превышение разбирается на ретро.
3. **Порог платного шага:** платных шагов нет; STOP-PAY не нужен.

## Каталог развилок
Ответы на повторяющиеся развилки — до первого айтема, чтобы они не стоили стопа. Урок стопа — строкой сюда; скилл на стопе не правится.
- **(a) Развилка, которую SPEC не закрыл** — простейшее прочтение и строка в `## Notes` PROGRESS. Не стоп.
- **(b) Деталь документации расходится со SPEC** — прав док; строка в PLAN. Не стоп.
- **(c) UI-развилка** — дизайн-бриф, работа идёт дальше. Не стоп.
- **(d) Стохастический чек красный** — итерации в бюджете SPEC §4: одна метрика, keep/discard через git, строка на прогон в журнале. Стоп — только STOP-NP.
- **(e) Ждём вход оператора** — STOP-INPUT; независимые фичи идут дальше, строка STOP — после них.
- **(f) Пойман дефект продукта** — один тест, обе стороны, в коммите починки. Не стоп.
- **(g) Окружение расходится с таблицей** (плагин не установлен, MCP не `connected`) — STOP-INPUT с точной командой для оператора; таблицу и строку запуска правит тимлид.
