# PROCESS — <проект> — механика проекта (файл тимлида; исполнитель читает и не правит)

## Environment
Базовый набор оператора — всегда. Сверх него инструмент входит только под названный чек или фичу и уходит, когда его не называет ни одна фича фазы; дельту «поставить/убрать» пишет PLAN шага 0. Таблица — источник для `.claude/launch.settings.json` (`enabledPlugins`, `skillOverrides`) и строки запуска ниже (`--effort`, MCP — `--strict-mcp-config` и `--mcp-config`). Сверка — `bin/check-harness` по `system/init` пары этой строкой: плагины (кроме встроенных `@builtin`), MCP со статусом `connected`, скиллы строк таблицы, CLI, флаги; нет, лишнее или не `connected` — FAIL с именем. Колонка `id` — как в `system/init`, «…» и `*` — glob.

| инструмент | форма | id | вкл | фича или чек | установка | удаление |
|---|---|---|---|---|---|---|
| git, gh | CLI | `git`, `gh` | да | всегда: коммиты, push ветки, CI | — | — |
| python3 | CLI | `python3` | да | всегда: `bin/check-*` | — | — |
| ultracode | флаг | `--effort ultracode` | да | все фичи (D4) | строка запуска | — |
| Ponytail | плагин | `ponytail@ponytail` | да | база | `/plugin install ponytail@ponytail` | строка таблицы |
| Context7 | MCP | `context7` | да | база: доки библиотек | `--mcp-config` строки запуска, stdio `npx -y @upstash/context7-mcp` | из строки запуска |
| Graphify | скилл | `graphify` | да | база; граф строит тимлид до `/goal`, где корпус больше grep-удобного | — | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| Context7 (плагин) | плагин | `context7@claude-plugins-official` | нет | удалённый MCP в `-p` — `needs-auth`; вместо него — stdio-сервер выше | — | — |
| commit-commands | плагин | `commit-commands@claude-plugins-official` | нет | коммиты и PR мимо дисциплины | — | — |
| security-guidance | плагин | `security-guidance@claude-plugins-official` | нет | по задаче: сеть и ввод пользователя | — | — |
| frontend-design | плагин | `frontend-design@claude-plugins-official` | нет | по задаче: UI | — | — |
| code-review | плагин | `code-review@claude-plugins-official` | нет | PR в `main` | — | — |
| serena | плагин | `serena@claude-plugins-official` | нет | — | — | — |
| brain-init | скилл | `brain-init` | нет | харнес v2 | — | — |
| memory-protocol | скилл | `memory-protocol` | нет | — | — | — |
| скиллы Cowork | скилл | `anthropic-skills:*` — поимённо в `.claude/launch.settings.json` | нет | скиллы тимлида и Cowork исполнителю не нужны | — | — |
| ref, blockscout | MCP | `ref`, `blockscout` | нет | вне таблицы; blockscout — по задаче (DeFi) | — | — |
| коннекторы claude.ai | MCP | `claude.ai …` | нет | почта, диск, календарь | — | — |
| <инструмент> | <форма> | <id> | <да/нет> | <фича/чек> | <команда> | <команда> |

## Строка запуска исполнителя — фаза <n>
Пишет тимлид по таблице Environment; из корня проекта. Зачем каждый флаг — `docs/LAUNCH.md`; `bin/check-harness` гоняет пару этой строкой.

```sh
ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}'
```

Затем `/goal ` и текст `docs/GOAL.txt` целиком.

## Деньги
1. **Потолок проекта:** <€> — слово оператора и константа предохранителя.
2. **Лимиты подписки:** планка на фазу исполнителя — <N> % недели (обычная фаза — 15 %, D4 two-tier-dev); исполнитель работает под ultracode, его веер воркфлоу ест лимиты быстрее. `/usage` до и после плеча записывает тимлид в STATUS; превышение — на ретро, ultracode сгоряча не выключается.
3. **Лимит вендора:** <где выставлен, сколько>; проверен на экране до первого платного вызова.
4. **Порог платного шага:** <€>. Выше порога или необратимо — STOP-PAY и отдельный `/goal` после «да» оператора; мелкие вызовы ниже порога внутри потолка идут без стопов.
5. **Предохранитель по факту:** <команда или файл> считает факт расхода (или оценку, откалиброванную по счёту вендора); журнал только дописывается; второй рубеж после лимита вендора.

## Каталог развилок
Ответы на повторяющиеся развилки — до первого айтема, чтобы они не стоили стопа. Урок стопа — строкой сюда; скилл на стопе не правится. Строка, ни разу не сработавшая за фазу, уходит на ретро.
- **(a) Развилка, которую SPEC не закрыл** — простейшее прочтение и строка в `## Notes` PROGRESS. Не стоп.
- **(b) Деталь документации расходится со SPEC** — прав док; строка в PLAN. Не стоп.
- **(c) UI-развилка** — дизайн-бриф, работа идёт дальше. Не стоп.
- **(d) Стохастический чек красный** — итерации в бюджете SPEC §4 (время, €): одна метрика, keep/discard через git, строка на прогон в журнале. Стоп — только STOP-NP.
- **(e) Ждём вход оператора** — STOP-INPUT; независимые фичи идут дальше, строка STOP — после них.
- **(f) Пойман дефект продукта** — один тест, обе стороны, в коммите починки. Не стоп.
