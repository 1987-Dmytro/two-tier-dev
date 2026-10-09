# PROCESS — <проект> — механика проекта (файл тимлида; исполнитель читает и не правит)

## Environment
Базовый набор оператора — всегда. Сверх него инструмент входит только под названный чек или фичу и уходит, когда его не называет ни одна фича фазы; дельту «поставить/убрать» пишет PLAN шага 0. Таблица — источник для `.claude/launch.settings.json` (`enabledPlugins`, `skillOverrides`) и строки запуска ниже (`--effort`, MCP — `--strict-mcp-config` и `--mcp-config`). Сверка — `bin/check-harness` по `system/init` пары этой строкой: плагины (кроме встроенных `@builtin`), MCP со статусом `connected`, скиллы строк таблицы, CLI, флаги; режим плагина из колонки «фича или чек» («тень», `hint`, «N %») — против `pluginConfigs` launch settings; нет, лишнее, не `connected` или другой режим — FAIL с именем. Колонка `id` — как в `system/init`, «…» и `*` — glob. Инструменты исполнителя приходят из репо и этой таблицы: `--setting-sources project,local` срезает настройки, хуки и скиллы пользователя; скилл пользователя со строкой «да» — через `--add-dir` (подготовка — в разделе запуска). Строки «по задаче» в сессию не входят: их наличие на машине доказывает проба `bin/check-harness`.

| инструмент | форма | id | вкл | фича или чек | установка | удаление |
|---|---|---|---|---|---|---|
| git, gh | CLI | `git`, `gh` | да | всегда: коммиты, push ветки, CI | — | — |
| python3 | CLI | `python3` | да | всегда: `bin/check-*` | — | — |
| node | CLI | `node` | да | всегда: `bin/jev`, хуки кита (`spec-gate`, Abide, Toolgate) | — | — |
| ultracode | флаг | `--effort ultracode` | да | все фичи (D4) | строка запуска | — |
| источник настроек | флаг | `--setting-sources project,local` | да | настройки, хуки и скиллы пользователя в сессию исполнителя не входят | строка запуска | — |
| без Chrome | флаг | `--no-chrome` | да | встроенный `claude-in-chrome` в сессии исполнителя выключен | строка запуска | — |
| Ponytail | плагин | `ponytail@ponytail` | да | база | `/plugin install ponytail@ponytail` | строка таблицы |
| Context7 | MCP | `context7` | да | база: доки библиотек | `--mcp-config` строки запуска, stdio `npx -y @upstash/context7-mcp` | из строки запуска |
| Graphify | скилл | `graphify` | да | база, где корпус больше grep-удобного; приходит через `--add-dir /tmp/two-tier-v3/skills` | подготовка запуска | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| typesafe | плагин | `typesafe@typesafe-ai` | нет | по задаче: фаза пишет вызовы Jev | `claude plugin install typesafe@typesafe-ai` | строка таблицы |
| Jev Belay | плагин | `jev-belay@jev-belay` | да | второй судья конца хода — тень (только журнал) | `claude plugin install jev-belay@jev-belay` | по ретро |
| Steer-or-Queue | плагин | `jev-steer-or-queue@jev-steer-or-queue` | да | заметка оператора посреди хода — тень (только журнал) | `claude plugin install jev-steer-or-queue@jev-steer-or-queue` | по ретро |
| Compact Adviser | плагин | `compact-adviser@compact-adviser` | да | совет компактить осевший ход — режим `hint`; мод ждёт `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` в строке | `claude plugin install compact-adviser@compact-adviser` | по ретро |
| handoff | плагин | `handoff@two-tier-mods` | да | хендофф и свежий контекст на 70 % окна, затем `/clear`; файлы — `handoffs/` (в `.gitignore` публичного репо) | marketplace `<two-tier-dev>/mods`, плагин `handoff@two-tier-mods` (команда — в выводе `bin/two-tier-init`) | строка таблицы |
| Abide | CLI | `abide` | да | хуки кита: правила каждой правки по рубрике тимлида — заметка | `npm i -g @coldtea/abide@0.0.9` | по ретро |
| Toolgate | CLI | `toolgate` | да | хук кита «только отказ» по политике `.claude/toolgate.yaml` | `npm i -g @riskaverse/toolgate@0.16.0` | по ретро |
| Quicksilver | скилл | `quicksilver` | нет | по задаче: корпус больше grep-удобного; проба `qs status` | `npx github:UditAkhourii/quicksilver` | — |
| Jev SEO | скилл | `jev-seo` | нет | по задаче: фаза с сайтом; проба `jevseo doctor` | клон `AgriciDaniel/jev-seo`, venv, симлинк в `~/.claude/skills` | — |
| Jev Browser | MCP | `jev-browser` | нет | по задаче: фаза с UI — чек `bin/check-ui` (CLI); проба — сценарий на локальной странице | `npx playwright install chromium`; MCP — `--mcp-config` строки | из строки запуска |
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
Пишет тимлид по таблице Environment; из корня проекта, в терминале, где задан `TYPESAFE_API_KEY` (ключ — только в окружении). Зачем каждый флаг — `docs/LAUNCH.md`; `bin/check-harness` гоняет пару этой строкой. Подготовка — скиллы пользователя со строкой «да» для `--add-dir` (`/tmp` чистится при перезагрузке):

`mkdir -p /tmp/two-tier-v3/skills/.claude/skills && for s in graphify; do ln -sfn ~/.claude/skills/$s /tmp/two-tier-v3/skills/.claude/skills/$s; done`

```sh
ENABLE_CLAUDEAI_MCP_SERVERS=false CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --no-chrome --setting-sources project,local --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}' --add-dir /tmp/two-tier-v3/skills
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
