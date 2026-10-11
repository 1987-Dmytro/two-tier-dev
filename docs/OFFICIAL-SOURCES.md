# Официальные источники — критерий самоулучшения системы

Правило харнеса, кита или скилла меняется только по этим источникам (или по повтору одной ошибки не меньше двух раз — и без спора с ними). Свип — на каждом ретро фазы, при новой модели и при мажорном релизе Claude Code. Найденное — строкой в CHANGELOG: цитата, URL, дата.

**Последняя сверка:** 10.10.2026 (исполнитель v3.3 перечитал цитаты свипа 09.10; Claude Code v2.1.296 у оператора; найденное — CHANGELOG v3.3, «Source sweep 09.10»). Таблица — стартовый список, а не граница: факты берутся из всей документации code.claude.com/docs (индекс `llms.txt`).

## Claude Code — документация (code.claude.com/docs/en/…)
| Страница | Что из неё берём |
|---|---|
| [best-practices](https://code.claude.com/docs/en/best-practices) | Проверка, которую Claude может запустить, — главный рычаг. Раздутый CLAUDE.md игнорируется («Would removing this cause Claude to make mistakes?»). Эмфаза — на одну строку. Спека самодостаточна и кончается сквозной проверкой. Ревьюер, которого просят искать дыры, найдёт их и в здоровой работе: в работу идёт только то, что влияет на корректность. |
| [goal](https://code.claude.com/docs/en/goal) | Оценщик — малая быстрая модель, сам ничего не запускает: условие должно доказываться выводом в транскрипте. Хорошее условие = одно измеримое состояние + названный чек + важные ограничения; до 4000 знаков; лимит ходов — частью условия («or stop after N turns»). Без присмотра — `/goal` в auto mode. |
| [workflows](https://code.claude.com/docs/en/workflows) | `ultracode` строит воркфлоу на каждую задачу (дороже и дольше); в рутине выключать. Воркфлоу — для задач больше одного окна или одного шага по многим объектам. Сохранённый воркфлоу принимает вход через `args`. В `claude -p` на лимите подписки воркфлоу не ждёт сброса — агент падает. |
| [skills](https://code.claude.com/docs/en/skills) | Скилл проекта с именем `verify` Claude запускает перед каждым коммитом, кроме правок документов и тестов (с v2.1.286). SKILL.md — до 500 строк. |
| [permission-modes](https://code.claude.com/docs/en/permission-modes) | bypassPermissions — только изолированные контейнеры и VM. `defaultMode: "auto"` из `.claude/settings.json` проекта не действует; флаг `--permission-mode auto` перекрывает настройки. Три блока подряд или двадцать всего — в интерактивной сессии auto mode переходит к вопросам; в `-p` действие не выполняется, а работа идёт дальше. Push в любую ветку своего репо, включая основную, разрешён; force push блокируется по умолчанию. |
| [auto-mode-config](https://code.claude.com/docs/en/auto-mode-config) | `autoMode.environment` (доверенные репо, домены, сервисы) читается из `~/.claude/settings.json`, managed или `--settings`, но не из настроек проекта. `/auto-mode-setup` готовит черновик записей. Записи — проза для классификатора, с `"$defaults"`. Классификатор не видит результатов инструментов: разрешение должно стоять в сообщении пользователя. |
| [permissions](https://code.claude.com/docs/en/permissions) | Правила `Edit(path)` действуют на все встроенные инструменты правки, включая Write; правила `Write(path)` не проверяются и дают предупреждение на старте. Deny на Edit не покрывает подпроцессы (python, `git mv`) — нужен ещё lint. |
| [hooks](https://code.claude.com/docs/en/hooks) | PreToolUse отклоняет через `hookSpecificOutput.permissionDecision: "deny"` с `permissionDecisionReason` (или код выхода 2); deny работает в любом режиме. `continue: false` со `stopReason` останавливает Claude целиком. `additionalContext` пишется фактами, а не приказами. Таймауты — в секундах: по умолчанию 600 у `command`, `http` и `mcp_tool`, 30 у `prompt`, 60 у `agent`. С v2.1.295 — `onFailure: "block"`: хук, который не стартовал или вышел по таймауту, блокирует действие. Фильтр `if` — best-effort. |
| [githooks](https://git-scm.com/docs/githooks) (git) | Каталог хуков git меняет `core.hooksPath`: судьи коммита кита — `.githooks/commit-msg` и `.githooks/pre-push`, ставят `bin/two-tier-init` и `bin/two-tier-upgrade`. `--no-verify` хуки git обходит — его держит статический страж Bash кита. |
| [settings-reference](https://code.claude.com/docs/en/settings-reference) | `model` принимает полный id (`claude-opus-5-5`); `effortLevel`: low…xhigh; `ultracode`: boolean. `autoMemoryEnabled`: не задан — auto memory включён; `false` в ките — рабочее поле. `disableClaudeAiConnectors: true` — коннекторы claude.ai не грузятся. |
| [memory](https://code.claude.com/docs/en/memory) | Auto memory включён по умолчанию; MEMORY.md грузится в каждую сессию (первые 200 строк или 25 КБ) — это чтение на старте, мимо бюджета S2, если не выключить. |
| [mcp](https://code.claude.com/docs/en/mcp) | Коннекторы claude.ai приходят в Claude Code сами при входе через claude.ai. Выключить: `disableClaudeAiConnectors: true` или `ENABLE_CLAUDEAI_MCP_SERVERS=false`; только явные серверы — `--strict-mcp-config` с `--mcp-config`. |
| [cli-reference](https://code.claude.com/docs/en/cli-reference) | `--settings` — путь к файлу или inline JSON; `--permission-mode auto`; `--model`; `--effort`; `--add-dir`; `--setting-sources`; `--allowedTools`; `--max-turns`; `--max-budget-usd` (только `-p`); `--remote-control`; `--name`. `claude doctor` — диагностика установки и настроек без сессии. |
| [headless](https://code.claude.com/docs/en/headless) | `claude -p` без хоста: запросы разрешений отклоняются. `--max-turns` завершает с ошибкой на лимите; `--bare` пропускает хуки — для проверки хуков не годится, а в будущем релизе станет дефолтом `-p` (парный прогон F4 это поймает). В `-p` при заданном `ANTHROPIC_API_KEY` всегда используется ключ (errors) — контрольные прогоны на подписке идут с `env -u ANTHROPIC_API_KEY`. |
| [model-config](https://code.claude.com/docs/en/model-config) | Алиас `opus` = Opus 5.5 и меняется сам; закреплять полным id. Opus 5.5 всегда работает с окном 1M. Effort Opus 5.5 по умолчанию — medium: «day-to-day engineering work with a clear scope, such as implementing a new feature»; Opus 5.5 на medium не хуже Opus 5 на high; «при переходе с Opus 5 начинать с medium». High — где важна проверка и вероятны пограничные случаи; xhigh — глубже и дороже. Порядок: `CLAUDE_CODE_EFFORT_LEVEL` → `--effort` → настройки → дефолт модели. `ultracode` — не уровень effort. |
| [agent-teams](https://code.claude.com/docs/en/agent-teams) | Экспериментальная функция. Для последовательных задач, правок одного файла и работы с зависимостями эффективнее одна сессия или субагенты. |
| [cross-session-messaging](https://code.claude.com/docs/en/cross-session-messaging) | Сессии пишут друг другу (v2.1.224+). Команды в сообщении не исполняются. Сессия в bypass по умолчанию держит входящие на одобрение. |
| [statusline](https://code.claude.com/docs/en/statusline) | `rate_limits.*.used_percentage` (0–100) окон 5 ч и 7 дней приходят только в статус-строку идущей сессии: их показывает мод `limits`; документированного входа до старта сессии нет. |
| [agent-sdk](https://code.claude.com/docs/en/agent-sdk/typescript#sdkratelimitevent) | `rate_limit_event` в потоке `claude -p --output-format stream-json`; `utilization` (0.0–1.0) документирован, но в замере 10.10 не пришёл — `bin/check-window` читает `unifiedWindows`, единственное исключение C2. |
| [mods overview](https://code.claude.com/docs/en/plugins/mods/overview) | Мод — плагин с хуками-функциями и статус-строкой (`mods/limits`, `mods/handoff`); с v2.1.287 `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` игнорируется — переменная ушла из строки запуска. |
| [changelog](https://code.claude.com/docs/en/changelog) | Что поменялось с прошлого свипа. 2.1.293 — откат сообщения отказа auto mode: отказанное действие может вернуться в другой форме (`pre-push` судит, что push делает, а не как записан). 2.1.294 — хук `prompt`/`agent`, написанный инструкцией, больше не пропускает то, что должен блокировать. 2.1.295 — `onFailure: "block"` у command- и HTTP-хуков; хуки кита на своей ошибке пропускают. |

## Модели — гайды по промптингу (platform.claude.com/docs/en/build-with-claude/prompt-engineering/…)
| Страница | Что берём |
|---|---|
| [prompting-claude-opus-5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5) | Полная спека заранее, дальше — «left to run». Явные инструкции перепроверки и устаревший верификационный харнес дают over-verification. Жёсткие пределы — env-переменные и `max_budget_usd`, а не текст. |
| [prompting-claude-opus-5-5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5) | Длинную автономную работу ведёт лучше Opus 5. Без присмотра — чек-лист в файле, подтверждение рискованного. Меньше думать — понижать effort, а не писать инструкции. |
| [prompting-claude-fable-5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) | Скиллы под прошлые модели «часто слишком предписывающие и ухудшают результат». Свежий проверяющий лучше самокритики. Пауза — только на необратимое, смену объёма и вход человека. Понимание намерения улучшает работу. |
| [prompting-claude-fable-5-1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1) | Долгие задачи без подсказок по методу, когда цель ясна. Объём — это результат: не сужать, не расширять, не подменять. Стоп — только на разрушительном и на реальной смене объёма. |
| [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | «Claude is already very smart». Степени свободы (узкий мост / открытое поле). SKILL.md — оглавление, детали по требованию. Сначала оценки, потом инструкции; базовая линия без скилла. |

## Anthropic — engineering и research
| Публикация (дата) | Что берём |
|---|---|
| [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) (29.09.2025) | «Правильная высота»: ни зашитой хрупкой логики, ни размытых слов. Минимальный набор высокосигнальных токенов. |
| [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) (26.11.2025) | Одна фича за раз, файл прогресса, git, чистое состояние в конце сессии. |
| [Demystifying evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) (09.01.2026) | Оценивать результат, а не путь; частичный зачёт; pass@k и pass^k; модель-судью калибровать по людям; читать транскрипты. |
| [Measuring agent autonomy](https://www.anthropic.com/research/measuring-agent-autonomy) (18.02.2026) | Обязательные паттерны вмешательства создают трение без выигрыша в безопасности. |
| [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps) (24.03.2026) | Ограничивать результат, путь оставлять агенту. Каждая деталь харнеса — допущение о слабости модели: при новой модели снимать то, что больше не несёт нагрузку. Агент, который оценивает свою работу, завышает оценку. |
| [How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude) (25.05.2026) | У вероятностной защиты ненулевая доля пропусков: жёсткий запрет держит код, а не модель-судья. |
| [Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode) (25.03.2026) | Что разрешено — задаёт промпт; классификатор останавливает остальное. |
| [Seeing like an agent](https://claude.com/blog/seeing-like-an-agent) (10.04.2026) | Инструменты, которые были нужны прошлым моделям, начинают сковывать новые. |
| [Quality postmortem](https://www.anthropic.com/engineering/april-23-postmortem) (23.04.2026) | Одна строка системного промпта стоила −3 %. Абляция по строкам — до выкатки. |
| [Managed Agents: outcomes](https://claude.com/blog/new-in-claude-managed-agents) (19.05.2026) | Рубрика и отдельный грейдер в своём контексте. |

## Сторонний вендор слоя Jev (поле харнеса по C2; не критерий самоулучшения)
Сверено 09.10.2026; сводка и остальные ссылки — `claude/research-2026-10-09-jev-integration.md`, §1.
| Источник | Что берём |
|---|---|
| [docs.typesafe.ai — quickstart](https://docs.typesafe.ai/introduction/quickstart) | `POST https://api.typesafe.ai/v1/systemone`, `Authorization: Bearer`; запрос — `state` и словарь `questions`. Алиас `jev-latest` плавает, ответ называет версию — закреплять полным именем (`jev-1.13.0`; замер 09.10: на `jev-1.13` API отвечает 400 «Unknown model»). |
| [docs.typesafe.ai — agent skill](https://docs.typesafe.ai/agent-skill) | Официальный скилл `typesafe@typesafe-ai`: три типа вопросов (`choice`, `score`, `noul`), батч вопросов по одному state. |
| [vals.ai — independent evaluation of Jev](https://vals.ai/blogs/independent-evaluation-of-jev) | Проверка утверждений по документу — на уровне фронтира; на связках суждений модель слаба. Гейт тестировать на своих размеченных случаях: порог ставить на части данных, ошибку мерить на остатке. Отсюда — пороги `spec-gate` и Abide по журналу первого плеча telefon (SPEC-v3.2 §6). |

## Практики (вторичный источник — не критерий сам по себе)
- Борис Черный: главное — проверка (качество в 2–3 раза выше); пересказывать путь — частая ошибка; «раз в полгода удалить CLAUDE.md, скиллы и хуки и посмотреть, что сделает модель».
- Андрей Карпатый: «give it success criteria and watch it go»; autoresearch — одна метрика, фиксированный бюджет, keep/discard, человек правит только program.md. С мая 2026 Карпатый работает в Anthropic.
- Intent и спека (основа D3): GitHub Spec Kit — «что и зачем», сценарии, измеримые критерии успеха без технологий, маркер `[NEEDS CLARIFICATION: …]`; Kiro — требования → дизайн → задачи с трассировкой; Б. Бёкелер (martinfowler.com, 15.10.2025) — spec-first, spec-anchored, spec-as-source и риск перегруза ревью; Э. Османи (13.01.2026) — спека как живой документ, «что и зачем» раньше «как».

## Как делать свип (15–20 минут)
1. Открыть changelog Claude Code с даты последней сверки; выписать изменения, которые касаются /goal, хуков, прав, воркфлоу, моделей.
2. Открыть гайд по промптингу текущих моделей исполнителя и тимлида.
3. Сверить каждую строку скилла и поля кита с выписанным. Расхождение — правка по §8 team-lead: механизм, абляция, «одно вошло — одно вышло».
4. Обновить дату сверки в этом файле; строка в CHANGELOG.
