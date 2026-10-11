# PROCESS — <проект> — механика проекта (файл тимлида; исполнитель читает и не правит)

## Environment
Базовый набор оператора — всегда. Сверх него инструмент входит только под названный чек или фичу и уходит, когда его не называет ни одна фича фазы; дельту «поставить/убрать» пишет PLAN шага 0. Инструмент стоит там, где есть его событие: у исполнителя заявления — коммит и конец хода, судьи на каждое действие и на сообщение человека — только в сессиях оператора; хук на действие, который ходит в сеть или зовёт модель, — красный в `bin/check-harness`. Таблица — источник для `.claude/launch.settings.json` (`enabledPlugins`, `skillOverrides`) и строки запуска ниже (`--effort`, MCP — `--strict-mcp-config` и `--mcp-config`). Сверка — `bin/check-harness` по `system/init` пары этой строкой: плагины (кроме встроенных `@builtin`), MCP со статусом `connected`, скиллы строк таблицы, CLI, флаги; режим плагина из колонки «фича или чек» («тень», `hint`, «N %») — против `pluginConfigs` launch settings; нет, лишнее, не `connected` или другой режим — FAIL с именем. Колонка `id` — как в `system/init`, «…» и `*` — glob. Инструменты исполнителя приходят из репо и этой таблицы: `--setting-sources project,local` срезает настройки, хуки и скиллы пользователя; скилл пользователя со строкой «да» — через `--add-dir` (подготовка — в разделе запуска). Строки «по задаче» в сессию не входят: их наличие на машине доказывает проба `bin/check-harness`.

| инструмент | форма | id | вкл | фича или чек | установка | удаление |
|---|---|---|---|---|---|---|
| git, gh | CLI | `git`, `gh` | да | всегда: коммиты, push ветки, CI | — | — |
| python3 | CLI | `python3` | да | всегда: `bin/check-*` | — | — |
| node | CLI | `node` | да | всегда: `bin/jev`, `spec-gate`, хуки кита | — | — |
| ultracode | флаг | `--effort ultracode` | да | все фичи (D4) | строка запуска | — |
| источник настроек | флаг | `--setting-sources project,local` | да | настройки, хуки и скиллы пользователя в сессию исполнителя не входят | строка запуска | — |
| без Chrome | флаг | `--no-chrome` | да | встроенный `claude-in-chrome` в сессии исполнителя выключен | строка запуска | — |
| Ponytail | плагин | `ponytail@ponytail` | да | база | `/plugin install ponytail@ponytail` | строка таблицы |
| Context7 | MCP | `context7` | да | база: доки библиотек | `--mcp-config` строки запуска, stdio `npx -y @upstash/context7-mcp` | из строки запуска |
| Graphify | скилл | `graphify` | да | база, где корпус больше grep-удобного; приходит через `--add-dir /tmp/two-tier-v3/skills` | подготовка запуска | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| typesafe | плагин | `typesafe@typesafe-ai` | нет | по задаче: фаза пишет вызовы Jev | `claude plugin install typesafe@typesafe-ai` | строка таблицы |
| Jev Belay | плагин | `jev-belay@jev-belay` | да | конец хода: второй судья — тень (только журнал); сравнение со `spec-gate` — на ретро | `claude plugin install jev-belay@jev-belay` | по ретро |
| handoff | плагин | `handoff@two-tier-mods` | да | хендофф и свежий контекст на 70 % окна, затем `/clear`; ниже — Jev-граница задачи (0.3.0): у оператора `jev: hint`, в строке запуска `jev: off`; файлы — `handoffs/` (в `.gitignore` публичного репо) | marketplace `<two-tier-dev>/mods`, плагин `handoff@two-tier-mods` (команда — в выводе `bin/two-tier-init`) | строка таблицы |
| Abide | CLI | `abide` | да | коммит: `abide check` по рубрике тимлида `.abide/rubric.json` из хука `.githooks/commit-msg`; хуков на правку и ход нет | `npm i -g @coldtea/abide@0.0.9`; ключ — `TYPESAFE_API_KEY` в окружении | по ретро |
| limits | плагин | `limits@two-tier-mods` | нет | статус-строка окон подписки (5 ч, неделя, время до сброса, контекст, цена сессии) — только сессии оператора | marketplace `<two-tier-dev>/mods`, плагин `limits@two-tier-mods` | — |
| Steer-or-Queue | плагин | `jev-steer-or-queue@jev-steer-or-queue` | нет | событие — сообщение человека посреди хода: только сессии оператора | — | — |
| Compact Adviser | плагин | `compact-adviser@compact-adviser` | нет | влит в `handoff` 0.3.0 (Jev-граница); 0.1.12 молчит: ждёт переменную ранних модов, которую Claude Code 2.1.287+ не читает (mods overview); у оператора выключен 10.10 | — | — |
| Toolgate | CLI | `toolgate` | нет | судья-модель на каждое действие: только сессии оператора; force-push у исполнителя держит код (`.githooks/pre-push`) | — | — |
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
bin/check-window && ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --no-chrome --setting-sources project,local --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}' --add-dir /tmp/two-tier-v3/skills -- "$(cat docs/PROMPT.txt)"
```

Строка начинается с предохранителя окна `bin/check-window`: при окне 5 ч выше `window_five_hour_pct` или неделе выше `window_seven_day_pct` из `budgets.json` он отказывает до старта сессии, печатает оба числа и время сброса, и `&&` не пускает `claude`. Плечо починки — `bin/check-window --repair && …` (порог окна 5 ч — `window_repair_pct`). Обход — только `bin/check-window --override && …` словом оператора; обход печатается. Фаза стартует без ручного набора: последний аргумент строки — стартовый запрос `docs/PROMPT.txt` после `--` (шаблон `docs/PROMPT.template.txt`, пишет тимлид). Коммит судят хуки `.githooks/` кита и `abide check`, конец хода — Stop-хук `spec-gate` по пунктам SPEC; режимы и ключ в окружении — `docs/LAUNCH.md`.

## Деньги
1. **Потолок проекта:** <€> — слово оператора и константа предохранителя.
2. **Лимиты подписки:** планка на фазу исполнителя — <N> % недели (обычная фаза — 15 %, D4 two-tier-dev); исполнитель работает под ultracode, его веер воркфлоу ест лимиты быстрее. Плечо стартует при окне 5 ч не выше `window_five_hour_pct` (40 %) и неделе не выше `window_seven_day_pct` (85 %), плечо починки и `bin/verify-phase` — при окне 5 ч не выше `window_repair_pct` (70 %): это держит `bin/check-window` строки запуска, обход — флагом `--override` словом оператора. `/usage` до и после плеча записывает тимлид в STATUS; превышение — на ретро, ultracode сгоряча не выключается.
3. **Лимит вендора:** <где выставлен, сколько>; проверен на экране до первого платного вызова.
4. **Порог платного шага:** <€>. Выше порога или необратимо — STOP-PAY и отдельный запуск после «да» оператора; мелкие вызовы ниже порога внутри потолка идут без стопов.
5. **Предохранитель по факту:** <команда или файл> считает факт расхода (или оценку, откалиброванную по счёту вендора); журнал только дописывается; второй рубеж после лимита вендора.

## Каталог развилок
Ответы на повторяющиеся развилки — до первого айтема, чтобы они не стоили стопа. Урок стопа — строкой сюда; скилл на стопе не правится. Строка, ни разу не сработавшая за фазу, уходит на ретро.
- **(a) Развилка, которую SPEC не закрыл** — простейшее прочтение и строка в `## Notes` PROGRESS. Не стоп.
- **(b) Деталь документации расходится со SPEC** — прав док; строка в PLAN. Не стоп.
- **(c) UI-развилка** — дизайн-бриф, работа идёт дальше. Не стоп.
- **(d) Стохастический чек красный** — итерации в бюджете SPEC §4 (время, €): одна метрика, keep/discard через git, строка на прогон в журнале. Стоп — только STOP-NP.
- **(e) Ждём вход оператора** — STOP-INPUT; независимые фичи идут дальше, строка STOP — после них.
- **(f) Пойман дефект продукта** — один тест, обе стороны, в коммите починки. Не стоп.
