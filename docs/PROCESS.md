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
| Graphify | скилл | `graphify` | да | база; скиллы пользователя приходят через `--add-dir /tmp/two-tier-v3` (подготовка — в разделе запуска); доставку в кит строит F4 | подготовка запуска | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| typesafe | плагин | `typesafe@typesafe-ai` | да | F1, F2: исполнитель пишет вызовы Jev | `claude plugin install typesafe@typesafe-ai` | фаза без вызовов Jev |
| Jev Belay | плагин | `jev-belay@jev-belay` | да | F2: второй судья конца хода, тень (только журнал) | `claude plugin install jev-belay@jev-belay` | по ретро |
| Steer-or-Queue | плагин | `jev-steer-or-queue@jev-steer-or-queue` | да | F4: тень (только журнал) | `claude plugin install jev-steer-or-queue@jev-steer-or-queue` | по ретро |
| Compact Adviser | плагин | `compact-adviser@compact-adviser` | да | F4: режим `hint` | `claude plugin install compact-adviser@compact-adviser` | по ретро |
| handoff | плагин | `handoff@two-tier-mods` | да | F6: хендофф и свежий контекст на 70 % окна | `claude plugin install handoff@two-tier-mods` | строка таблицы |
| Quicksilver | скилл | `quicksilver` | да | по задаче: корпус больше grep-удобного; доставка — как у Graphify; проба — F4 | подготовка запуска | — |
| Abide | CLI | `abide` | да | F3: четыре хука Abide — в `.claude/launch.settings.json` (заметка, конец хода не блокирует); рубрика — шаг 0 фазы; в кит переносит F3 | `npm i -g @coldtea/abide`, `abide login` | по ретро |
| Toolgate | CLI | `toolgate` | да | F5: «только отказ» — PreToolUse-хук в `.claude/launch.settings.json` поверх `toolgate decide`, печатает только `deny`; в кит переносит F5 | `npm i -g @riskaverse/toolgate`, `toolgate init` | по ретро |
| Jev SEO | скилл | `jev-seo` | да | по задаче: фаза WEB; на этом плече — проба F4 | подготовка запуска | — |
| Jev Browser | MCP | `jev-browser` | да | F4: шаблон `bin/check-ui`; по задаче — фазы с UI | `--mcp-config` строки запуска, stdio `npx -y -p jev-browser@0.1.2 jev-browser-mcp`; `npx playwright install chromium` | из строки запуска |
| jev-mcp | MCP | `jev` | нет | инструмент тимлида в Claude Desktop | — | — |
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
Из корня репо, на ветке `v3.2`, в терминале, где задан `TYPESAFE_API_KEY` (ключ — только в окружении, не в репо). Подготовка — каталог фикстур и ссылки на скиллы пользователя (`/tmp` чистится при перезагрузке):

`mkdir -p /tmp/two-tier-v3/.claude/skills && for s in graphify quicksilver jev-seo; do ln -sfn ~/.claude/skills/$s /tmp/two-tier-v3/.claude/skills/$s; done`

```sh
ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --no-chrome --setting-sources project,local --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]},"jev-browser":{"command":"npx","args":["-y","-p","jev-browser@0.1.2","jev-browser-mcp"]}}}' --add-dir /tmp/two-tier-v3
```

Фаза стартует без `/goal` (D5): в конец строки добавляются `--` и стартовый запрос аргументом — `-- "$(cat docs/PROMPT.txt)"`. Без `--` запрос забирает `--add-dir`, и фаза стартует без запроса (проба тимлида 09.10: без `--` — «Input must be provided», с `--` — ответ). Файл стартового запроса — `docs/PROMPT.txt` (тимлид перенёс его с `docs/GOAL.txt` на приёмке v3.2-2); по его `Read first:` `bin/check-budget` находит SPEC фазы. Зачем каждый флаг — `docs/LAUNCH.md`.

## Деньги
1. **Потолок проекта:** платное — только Jev (TypeSafe, D6). Отдельных потолков на плечо и на фазу нет — оператор снял их 09.10 в 11:06 («убери лимиты»), чтобы плечо не вставало на полпути. Потолок — предоплаченный остаток на счёте TypeSafe. Оценка плеча — ~0,2 € (таблица SPEC-v3.2 §2). Остальное — подписка, usage credits выключены.
2. **Расход:** меряет F8 по журналам инструментов слоя; число тимлид пишет в STATUS на приёмке.
3. **Порог платного шага:** платных шагов, кроме Jev, нет; STOP-PAY не нужен.
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
- **(i) Deny тимлида накрывает файл, который фаза велит править** (09.10: `Edit(./CLAUDE.md)` и `Edit(./budgets.json)` — правило без каталога действует на любой глубине: проба только с deny — `kit/CLAUDE.md` отказ, `kit/docs/LAUNCH.md` правка) — пути «готово» каждой фичи тимлид сверяет с deny и политикой Toolgate до выдачи фазы; блок на плече — STOP-INPUT, правку вносит тимлид коммитом «Тимлид: …».
- **(j) Инструмент перевода зелёный на фикстуре, но не на живом проекте** (09.10: `two-tier-upgrade` на клоне projekt_1_telefon — rc 0, шесть файлов кита остались прежними, Stop-хука в настройках нет) — до выдачи фазы перевода тимлид гоняет инструмент на свежем клоне живого проекта во `/tmp/two-tier-v3`; сам проект не трогается (C4).
