# PROCESS — two-tier-dev — механика проекта (файл тимлида; исполнитель читает и не правит)

## Environment
Базовый набор оператора — всегда; сверх него инструмент входит только под названную фичу или чек. Таблица — источник для `.claude/launch.settings.json` и строки запуска ниже; сверка — `bin/check-harness` по `system/init`. Решение оператора 09.10 (грилинг v3.2, Q3): инструменты исполнителя приходят из репо и этой таблицы, личные настройки оператора действуют только в его сессиях — `--setting-sources project,local`. Замер тимлида 09.10 — в `claude/grill-2026-10-09-v3.2.md`. Встроенные MCP (`claude-in-chrome`, `computer-use`) в `-p` не грузятся и в `system/init` не видны: их держат строки таблицы и флаг `--no-chrome`; `/mcp` смотрит оператор на гейте.

| инструмент | форма | id | вкл | фича или чек | установка | удаление |
|---|---|---|---|---|---|---|
| git, gh | CLI | `git`, `gh` | да | всегда: коммиты, push ветки, CI | — | — |
| python3 | CLI | `python3` | да | всегда: `bin/check-*` | — | — |
| node | CLI | `node` | да | v3.2: `bin/jev`, `spec-gate`, проводка хуков | — | — |
| ultracode | флаг | `--effort ultracode` | да | все фичи (D4) | строка запуска | — |
| источник настроек | флаг | `--setting-sources project,local` | да | Q3: настройки и хуки пользователя в сессию исполнителя не входят | строка запуска | — |
| Ponytail | плагин | `ponytail@ponytail` | да | база | `/plugin install ponytail@ponytail` | строка таблицы |
| Context7 | MCP | `context7` | да | база: доки библиотек | `--mcp-config` строки запуска, stdio `npx -y @upstash/context7-mcp` | из строки запуска |
| Graphify | скилл | `graphify` | нет | на этом плече — нет: корпус репо grep-удобный, а скиллы пользователя срезаны вместе с его настройками (замер 09.10); доставку скиллов в проект строит F4 | F4 | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| typesafe | плагин | `typesafe@typesafe-ai` | да | F1, F2: исполнитель пишет вызовы Jev | `claude plugin install typesafe@typesafe-ai` | фаза без вызовов Jev |
| Jev Belay | плагин | `jev-belay@jev-belay` | да | F2: второй судья конца хода, тень (только журнал) | `claude plugin install jev-belay@jev-belay` | по ретро |
| Steer-or-Queue | плагин | `jev-steer-or-queue@jev-steer-or-queue` | да | F4: тень (только журнал) | `claude plugin install jev-steer-or-queue@jev-steer-or-queue` | по ретро |
| Compact Adviser | плагин | `compact-adviser@compact-adviser` | да | F4: режим `hint` | `claude plugin install compact-adviser@compact-adviser` | по ретро |
| handoff | плагин | `handoff@two-tier-mods` | да | F6: хендофф и свежий контекст на 70 % окна | `claude plugin install handoff@two-tier-mods` | строка таблицы |
| Quicksilver | скилл | `quicksilver` | нет | на этом плече — нет (та же причина, что у Graphify); по задаче: корпус больше grep-удобного; доставка и проба — F4 | F4 | — |
| Abide | CLI | `abide` | нет | на этом плече — нет: хуки пользователя срезаны; проводку в кит строит F3 | F3 | — |
| Toolgate | CLI | `toolgate` | нет | на этом плече — нет: хук пользователя срезан; режим «только отказ» строит F5 | F5 | — |
| Jev SEO | скилл | `jev-seo` | нет | по задаче: фаза WEB; проба — F4 | — | — |
| Jev Browser, jev-mcp | MCP | `jev-browser`, `jev` | нет | Jev Browser — по задаче: фаза с UI, проба — F4; jev-mcp — тимлид | — | — |
| Context7 (плагин) | плагин | `context7@claude-plugins-official` | нет | удалённый MCP требует OAuth; вместо него — stdio-сервер выше | — | — |
| commit-commands | плагин | `commit-commands@claude-plugins-official` | нет | коммиты и PR мимо дисциплины | — | — |
| security-guidance | плагин | `security-guidance@claude-plugins-official` | нет | по задаче: сеть и ввод пользователя | — | — |
| frontend-design | плагин | `frontend-design@claude-plugins-official` | нет | по задаче: UI | — | — |
| code-review | плагин | `code-review@claude-plugins-official` | нет | PR в `main` | — | — |
| serena, rust-analyzer-lsp, improve, drawio | плагин | `serena@claude-plugins-official`, `rust-analyzer-lsp@claude-plugins-official`, `improve@improve`, `drawio@365-skills` | нет | — | — | — |
| brain-init | скилл | `brain-init` | нет | харнес v2 | — | — |
| memory-protocol | скилл | `memory-protocol` | нет | — | — | — |
| скиллы Cowork | скилл | `anthropic-skills:*` — 20, поимённо в `.claude/launch.settings.json` | нет | скиллы тимлида и Cowork исполнителю не нужны | — | — |
| ref, blockscout | MCP | `ref`, `blockscout` | нет | вне таблицы; blockscout — по задаче (DeFi) | — | — |
| коннекторы claude.ai | MCP | `claude.ai …` | нет | почта, диск, календарь | — | — |
| Claude in Chrome | MCP | `claude-in-chrome` | нет | встроенный MCP: настоящий Chrome оператора с его входами | — | флаг ниже |
| без Chrome | флаг | `--no-chrome` | да | выключает встроенный `claude-in-chrome` в сессии исполнителя (cli-reference) | строка запуска | — |
| computer-use | MCP | `computer-use` | нет | встроенный MCP: экран и приложения Mac оператора; по умолчанию выключен | — | — |

## Строка запуска исполнителя — фаза v3.2
Из корня репо, на ветке `v3.2`, после `mkdir -p /tmp/two-tier-v3`. В терминале, где задан `TYPESAFE_API_KEY` (ключ — только в окружении, не в репо).

```sh
ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --no-chrome --setting-sources project,local --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}' --add-dir /tmp/two-tier-v3
```

Фаза стартует без `/goal` (D5): в конец строки добавляется стартовый запрос аргументом — `"$(cat docs/GOAL.txt)"`. На этом плече файл стартового запроса ещё носит имя v3.1 (`docs/GOAL.txt` — по нему `bin/check-budget` находит SPEC фазы); имя и шаблон меняет F7. Зачем каждый флаг — `docs/LAUNCH.md`.

## Деньги
1. **Потолок проекта:** платное — только Jev (TypeSafe, D6): 5 € на фазу v3.2, 1 € на плечо исполнителя (решение оператора 09.10; таблица посадки — SPEC-v3.2 §2). Остальное — подписка, usage credits выключены.
2. **Лимит на стороне вендора:** оператор читает остаток и лимит с экрана консоли TypeSafe до запуска плеча; число — в STATUS.
3. **Порог платного шага:** расход Jev за плечо выше 1 € по журналам инструментов — STOP-PAY. Вызовы внутри потолка идут без стопов.
4. **Лимиты подписки:** планок нет (07.10). Окна 5 ч и недели до и после плеча тимлид снимает сам из `rate_limit_event` потока `claude -p` и пишет в STATUS.
5. **Данные вендору (Q6):** хуки и скрипты с Jev работают только там, где нет реальных персональных данных; проект с такими данными называет в своём PROCESS пути, которые хуки не читают. В этом репо таких данных нет.

## Каталог развилок
Ответы на повторяющиеся развилки — до первого айтема, чтобы они не стоили стопа. Урок стопа — строкой сюда; скилл на стопе не правится.
- **(a) Развилка, которую SPEC не закрыл** — простейшее прочтение и строка в `## Notes` PROGRESS. Не стоп.
- **(b) Деталь документации расходится со SPEC** — прав док; строка в PLAN. Не стоп.
- **(c) UI-развилка** — дизайн-бриф, работа идёт дальше. Не стоп.
- **(d) Стохастический чек красный** — итерации в бюджете SPEC §4: одна метрика, keep/discard через git, строка на прогон в журнале. Стоп — только STOP-NP.
- **(e) Ждём вход оператора** — STOP-INPUT; независимые фичи идут дальше, строка STOP — после них.
- **(f) Пойман дефект продукта** — один тест, обе стороны, в коммите починки. Не стоп.
- **(g) Окружение расходится с таблицей** (плагин не установлен, MCP не `connected`) — STOP-INPUT с точной командой для оператора; таблицу и строку запуска правит тимлид.
- **(h) Сторонний хук пользователя меняет поведение харнеса** (09.10: `allow` хука расширил узкий allow, `ask` остановил агентов воркфлоу) — в сессию исполнителя он входит только проводкой кита с пробой в `check-harness`; установка на уровне пользователя — для сессий оператора.
