# PROCESS — two-tier-dev — механика проекта (файл тимлида; исполнитель читает и не правит)

## Environment
Базовый набор оператора — всегда; сверх него инструмент входит только под названную фичу или чек и стоит там, где есть его событие (D6). Таблица — источник для `.claude/launch.settings.json` и строки запуска ниже; сверка — `bin/check-harness` по `system/init`. Инструменты исполнителя приходят из репо и этой таблицы, личные настройки оператора действуют только в его сессиях — `--setting-sources project,local`. Встроенные MCP (`claude-in-chrome`, `computer-use`) в `-p` не грузятся и в `system/init` не видны: их держат строки таблицы и флаг `--no-chrome`; `/mcp` смотрит оператор на гейте.

| инструмент | форма | id | вкл | фича или чек | установка | удаление |
|---|---|---|---|---|---|---|
| git, gh | CLI | `git`, `gh` | да | всегда: коммиты, push ветки, CI | — | — |
| python3 | CLI | `python3` | да | всегда: `bin/check-*` | — | — |
| node | CLI | `node` | да | `bin/jev`, `spec-gate`, хуки кита | — | — |
| ultracode | флаг | `--effort ultracode` | да | все фичи (D4) | строка запуска | — |
| источник настроек | флаг | `--setting-sources project,local` | да | настройки и хуки пользователя в сессию исполнителя не входят | строка запуска | — |
| Ponytail | плагин | `ponytail@ponytail` | да | база | `/plugin install ponytail@ponytail` | строка таблицы |
| Context7 | MCP | `context7` | да | база: доки библиотек | `--mcp-config` строки запуска, stdio `npx -y @upstash/context7-mcp` | из строки запуска |
| Graphify | скилл | `graphify` | да | база; скилл пользователя приходит через `--add-dir /tmp/two-tier-v3` (подготовка — в разделе запуска) | подготовка запуска | — |
| pr-review-toolkit | плагин | `pr-review-toolkit@claude-plugins-official` | да | база: ревью диффа ветки | `claude plugin install pr-review-toolkit@claude-plugins-official` | строка таблицы |
| pyright-lsp | плагин | `pyright-lsp@claude-plugins-official` | да | Python: `bin/check-*` | — | когда в фазе нет Python |
| typesafe | плагин | `typesafe@typesafe-ai` | да | F1: исполнитель пишет вопросы к Jev | `claude plugin install typesafe@typesafe-ai` | фаза без вызовов Jev |
| Jev Belay | плагин | `jev-belay@jev-belay` | да | конец хода: второй судья — тень (только журнал); сравнение со `spec-gate` — ретро telefon | `claude plugin install jev-belay@jev-belay` | по ретро |
| handoff | плагин | `handoff@two-tier-mods` | да | хендофф и свежий контекст на 70 % окна; ниже — Jev-граница задачи (0.3.0): у оператора `jev: hint`, в строке запуска `jev: off` | `claude plugin install handoff@two-tier-mods` | строка таблицы |
| Abide | CLI | `abide` | да | коммит: `abide check` по рубрике тимлида (F2.4); хуков на правку и ход нет | `npm i -g @coldtea/abide`, `abide login` | по ретро |
| без Chrome | флаг | `--no-chrome` | да | выключает встроенный `claude-in-chrome` в сессии исполнителя (cli-reference) | строка запуска | — |
| limits | плагин | `limits@two-tier-mods` | нет | статус-строка окон подписки: сессии оператора; в фазе — пункт F6.4 | `claude plugin install limits@two-tier-mods` | — |
| Steer-or-Queue | плагин | `jev-steer-or-queue@jev-steer-or-queue` | нет | событие — сообщение человека посреди хода: только сессии оператора | — | — |
| Compact Adviser | плагин | `compact-adviser@compact-adviser` | нет | влит в `handoff` 0.3.0 (Jev-граница); 0.1.12 молчит: ждёт переменную ранних модов, которую Claude Code 2.1.287+ не читает (mods overview); у оператора выключен 10.10 | — | — |
| Toolgate | CLI | `toolgate` | нет | судья-модель на каждое действие: только сессии оператора; force-push у исполнителя держит код (F2.3) | — | — |
| Quicksilver | скилл | `quicksilver` | нет | по задаче: корпус больше grep-удобного; на этом плече корпуса нет; тимлиду — журналы на приёмке | — | — |
| Jev SEO | скилл | `jev-seo` | нет | исполнителю — по задаче: фаза WEB; тимлиду — CLI на Mac оператора через оболочку и скилл Cowork `jev-seo` (копия — `docs/drafts/jev-seo-cowork.md`) | — | — |
| Jev Browser | MCP | `jev-browser` | нет | исполнителю — по задаче: фазы с UI, `bin/check-ui`; тимлиду — MCP в Claude Desktop: гейт и приёмка страниц | — | — |
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
| Claude in Chrome | MCP | `claude-in-chrome` | нет | встроенный MCP: настоящий Chrome оператора с его входами | — | флаг выше |
| computer-use | MCP | `computer-use` | нет | встроенный MCP: экран и приложения Mac оператора; по умолчанию выключен | — | — |

## Строка запуска исполнителя — фаза v3.3
Из корня репо, на ветке `v3.3`, в терминале, где задан `TYPESAFE_API_KEY` (ключ — только в окружении, не в репо). Строка начинается с предохранителя окна `bin/check-window && ` (F5.1): запуск — при окне 5 ч не выше 40 % и неделе не выше 85 %, иначе отказ с числами и сбросом; обход — `bin/check-window --override && …`, только словом оператора. Подготовка — каталог фикстур и ссылка на скилл пользователя (`/tmp` чистится при перезагрузке):

`mkdir -p /tmp/two-tier-v3/.claude/skills && ln -sfn ~/.claude/skills/graphify /tmp/two-tier-v3/.claude/skills/graphify && rm -f /tmp/two-tier-v3/.claude/skills/quicksilver /tmp/two-tier-v3/.claude/skills/jev-seo`

```sh
bin/check-window && ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --no-chrome --setting-sources project,local --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}' --add-dir /tmp/two-tier-v3 -- "$(cat docs/PROMPT.txt)"
```

Фаза стартует без `/goal` (D5): строка кончается `--` и стартовым запросом аргументом. Без `--` запрос забирает `--add-dir`, и фаза стартует без запроса. Файл стартового запроса — `docs/PROMPT.txt`; по его `Read first:` `bin/check-budget` находит SPEC фазы. Stop-хук `spec-gate` этого репо — в `.claude/launch.settings.json`: `kit/.claude/hooks/spec-gate.mjs` рабочего дерева, режим `active` (настройки — `kit/.claude/spec-gate.json` по ссылке `.claude/spec-gate.json`). Перевод в тень — словом оператора: `SPEC_GATE=shadow` перед `claude` в строке. Зачем каждый флаг — `docs/LAUNCH.md`.

## Деньги
1. **Потолок проекта:** платное — только Jev (TypeSafe, D6). Отдельных потолков на плечо и на фазу нет — оператор снял их 09.10 в 11:06 («убери лимиты»). Потолок — предоплаченный остаток на счёте TypeSafe. Оценка плеча v3.3 — ~0,15 € (суд коммитов `abide check`: ~45 коммитов, меньше цента на коммит) и вопросы `spec-gate` в тени. Остальное — подписка, usage credits выключены.
2. **Расход:** `bin/check-spend` по журналам инструментов слоя; число тимлид пишет в STATUS на приёмке.
3. **Порог платного шага:** платных шагов, кроме Jev, нет; STOP-PAY не нужен.
4. **Лимиты подписки:** плечо стартует при окне 5 ч не выше 40 % и неделе не выше 85 %; плечо починки и точечная приёмка — при окне не выше 70 % (оператор, 09.10, Q6). Числа — ключи `window_five_hour_pct`, `window_seven_day_pct`, `window_repair_pct` в `budgets.json` кита (F5.4); в корневой `budgets.json` тимлид вносит их на приёмке — его defaults повторяют кит, это сверяет `bin/check-kit`. Обход — только словом оператора. До F5 окна снимает тимлид одним ходом `claude -p` из события `rate_limit_event` (`unifiedWindows` — наблюдаемое поле, исключение из C2 в журнале intent) — до стройки, после неё и после круга приёмки.
5. **Данные вендору (Q6 грилинга v3.2):** хуки и скрипты с Jev работают только там, где нет реальных персональных данных; проект с такими данными называет в своём PROCESS пути, которые хуки не читают. В этом репо таких данных нет.

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
- **(k) Тимлид пушит в ветку плеча, пока исполнитель работает** (09.10: push исполнителя отклонён, слияние `9f8f4bc`) — пока плечо идёт, тимлид коммитит в свою ветку `tl/<тема>`; идёт ли плечо — по времени записи транскрипта сессии и по локальным коммитам репо, а не по номеру процесса.
- **(l) Апгрейд зелёный, а чек самого проекта после него красный** (09.10, приёмка v3.2-3: в telefon `project.owner_add` несёт `docs/archive/`, коммит апгрейда кладёт туда архив без «Тимлид:» — `bin/check-budget` проекта rc 1) — на клоне живого проекта тимлид после инструмента перевода гоняет чеки самого проекта (`bin/check-budget`, CI), а не только сверяет файлы; порядок шагов перевода с правкой `owner_add` — в SPEC перевода.
- **(m) Deny тимлида в файле `--settings`** (проба 10.10, три формы): правило без каталога (`Edit(./CLAUDE.md)`) действует на любой глубине и накрывает `kit/CLAUDE.md`; `Edit(/X)` в таком файле не действует вовсе; в настройках проекта `Edit(/X)` держит только корень, но `.claude/settings.json` в корне этого репо переключает `bin/check-harness` с кита на корень. В deny строки запуска — только пути с каталогом; `CLAUDE.md` и `budgets.json` корня держит lint владения в CI.
- **(n) Вход Claude Code истёк перед плечом** (10.10: `claude auth status` — `loggedIn: false`, `claude -p` — ошибка OAuth) — до запуска тимлид делает один ход `claude -p`: он же даёт окна подписки; вход восстанавливает оператор — `claude auth login`.
- **(o) Правило рубрики, чей красный образец судья не ловит** (10.10: удаление мимо `git mv` — 0,40 при пороге 0,8) — правило уходит из рубрики в код; рубрика держит только то, что код проверить не может.
