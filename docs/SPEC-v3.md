# SPEC-v3 — two-tier-dev — кит v3

**intent:** `intent/INTENT.md @ e5e66199712a` · **дата:** 06.10.2026 · **одна фаза = один SPEC = один `/goal`**

## 0. Контекст
- **Выжимка intent.** v2 разросся снова: скилл ×7, около 0,6 млн знаков обязательного чтения на старте исполнителя, приёмка дольше плеча, intent проекта устарел после разворотов. v3 — это бюджеты механикой, результат вместо пути, харнес по официальной документации, живой intent с пином.
- **Сигналы этой фазы:** S1, S2, S3, S5. S6 — инструментом (`two-tier-upgrade` на фикстуре); сам перевод живого проекта — следующая фаза.
- **Исходная точка.** `main` @ `e0b5f6e` (кит v2), origin совпадает. Сид тимлида лежит неотслеживаемым в рабочем дереве. Первым коммитом ветки `v3` — «Тимлид: seed v3» — исполнитель кладёт его как есть:
  - `intent/INTENT.md`, `docs/SPEC-v3.md`, `docs/GOAL.txt`, `docs/OFFICIAL-SOURCES.md`;
  - `docs/drafts/team-lead-v6.md`, `docs/drafts/team-lead-brief.md`, `docs/drafts/INTENT.template.md`, `docs/drafts/SPEC.template.md`, `docs/drafts/GOAL.template.txt`;
  - `docs/archive/team-lead-v5.2.md`;
  - `claude/retro-2026-10-06-best-practices.md`, `claude/handoff-2026-10-06-v3-transition.md`, `claude/evals-2026-10-06/` (README, три сценария, `assertions.json`).

  Неотслеживаемый `goal-v2.txt` из корня переезжает в `docs/archive/goal-v2.txt`.
- **Решения:** D1–D3 из intent.
- **Факты о Claude Code** — официальная документация code.claude.com/docs (индекс `llms.txt`), начиная со страниц из `docs/OFFICIAL-SOURCES.md`. Если деталь дока расходится со спекой, прав док, а отклонение — строка в PLAN-v3. Если документированного способа достичь «готово» нет — STOP-SCOPE.

## 1. Дизайн высокого уровня
- **`bin/check-budget`** (python3, без зависимостей) читает `budgets.json`: дефолты кита, проект может только ужесточать. На каждое правило печатает строку OK, WARN или FAIL; в конце — `BUDGET_OK` или выход ≠0.
  - Знаки — символы Unicode (длина строки, прочитанной как UTF-8), не байты.
  - Правила SPEC, пина и PLAN действуют на файлы текущей фазы: SPEC — первый файл `Read first:` в `docs/GOAL.txt`, PLAN — с тем же суффиксом. Прежние SPEC и PLAN — история, их не проверяют.

  | Что | Предел | Вес |
  |---|---|---|
  | `docs/drafts/team-lead-v6.md` (копия скилла Cowork) | 80 строк, 12 000 знаков | FAIL |
  | `docs/drafts/team-lead-brief.md` | 150 строк, 15 000 знаков | FAIL |
  | Копии ролей / `grilling`, если есть | 10 000 / 3 500 знаков | FAIL |
  | Скилл кита `kit/.claude/skills/*/SKILL.md` | 4 000 знаков каждый | FAIL |
  | `$` с цифрой — в скиллах кита и в двух копиях выше | ни одного | FAIL |
  | `CLAUDE.md` кита | 40 строк | FAIL |
  | `intent/INTENT.md` | 6 000 знаков | WARN |
  | Строка фичи SPEC | 600 знаков; поле сигнала ссылается на существующий S | FAIL |
  | Маркер неясности: regex `\[NEEDS CLARIFICATION:[^\]]+\]` вне обратных кавычек | — | в SPEC — FAIL, в INTENT — WARN |
  | Пин в SPEC | первые 12 знаков `git hash-object intent/INTENT.md` | FAIL |
  | `docs/PROGRESS.md` / PLAN фазы | 60 / 150 строк | FAIL |
  | `docs/GOAL.txt` | 4 000 знаков; `Read first:` — до 3 файлов и 50 000 знаков вместе с CLAUDE.md | FAIL |
  | Ревью `docs/reviews/*` | блокирующих — до 5 | FAIL |
  | Владение | коммиты после merge-base с `main`, меняющие файлы тимлида, — только с префиксом «Тимлид:», их список — в evidence F2; файл, названный в END STATE `docs/GOAL.txt`, не из списка файлов тимлида | FAIL |

  Файлы тимлида — один список в `budgets.json`, пути от корня репо: `intent/`, `docs/SPEC-*.md`, `docs/GOAL.txt`, `docs/STATUS.md`, `docs/PROCESS.md`, `docs/reviews/`, `docs/drafts/`, `claude/`, `.claude/launch.settings.json`. Репо кита добавляет `docs/OFFICIAL-SOURCES.md` и `docs/archive/team-lead-*.md`. GOAL этой фазы и шаблон GOAL повторяют список дословно.
- **CI** — `.github/workflows/two-tier.yml` на push и PR: `check-budget` плюс `make ci`, если такая цель есть. `bin/check-ci <ветка>` ждёт прогон этого workflow для коммита `git rev-parse HEAD` (`gh run list --commit <sha>`, затем `gh run watch --exit-status`) и печатает `CI_OK`. Прогона ещё нет — это ожидание, а не красное; прогон прошлого коммита не засчитывается.
- **Харнес кита** — `kit/.claude/settings.json` v3, поля по settings-reference:
  - `model: "claude-opus-5-5"`. `effortLevel` не задаётся: у Opus 5.5 по умолчанию medium, и по model-config это «day-to-day engineering work with a clear scope». Effort фазы — в строке запуска;
  - `autoMemoryEnabled: false` — рабочее поле: auto memory по умолчанию включён и грузит MEMORY.md в каждую сессию;
  - `disableClaudeAiConnectors: true` — коннекторы claude.ai (почта, диск, календарь) исполнителю не грузятся;
  - `ultracode` убран. Остальные поля v2 сверяются с settings-reference: документированное и нужное остаётся, инертное уходит в архив с причиной в CHANGELOG;
  - deny `Edit(…)` на файлы тимлида. Edit покрывает и Write; правила `Write(…)` не проверяются;
  - хуки PreToolUse в документированном формате:
    - kill-switch при `AGENT_STOP` отвечает `continue: false` со `stopReason`: вызов не выполняется, Claude останавливается. `permissionDecision: "deny"` с той же причиной — запасной рубеж;
    - steer передаёт строки `STEER.md` через `additionalContext` фактами («Operator note <время>: …»), а не приказами;
  - verify-gate и track-read — `git mv` в `docs/archive/kit-v2/`;
  - `kit/.claude/launch.settings.json` — шаблон `autoMode.environment` с `"$defaults"` и плейсхолдерами проекта. В проекте это файл тимлида: передаётся через `--settings`, deny `Edit`;
  - `docs/LAUNCH.md` — строка запуска исполнителя и парный контрольный прогон.
- **`bin/check-harness`** гоняет пару контрольных `claude -p` во `/tmp/two-tier-v3` в режиме и с настройками из LAUNCH.md. Условия запуска:
  - `env -u ANTHROPIC_API_KEY -u ENABLE_CLAUDEAI_MCP_SERVERS`: только подписка, а коннекторы выключает сам кит, не окружение исполнителя;
  - только настройки project и local;
  - не больше 3 ходов; JSON-вывод (`system/init` есть в `stream-json` или с `--verbose`); без `--bare`.

  Чек печатает имена `mcp_servers` из `system/init`. Сервер `claude.ai …` — FAIL; сервер, которого нет в таблице Environment шаблона PROCESS, — WARN с именем. Если вложенный запуск отказан — STOP-INPUT с точной командой для оператора.
- **Шаблоны v3:** INTENT, SPEC, GOAL — дословно из `docs/drafts/`; PLAN, PROGRESS, STATUS, PROCESS, REVIEW — переписываются под эту спеку. В PROCESS §Деньги: потолок проекта, лимит вендора, порог платного шага (€), предохранитель по факту.
- **`bin/two-tier-upgrade <путь>`:**
  - в целевом проекте создаёт ветку `kit-v3` и ставит механику v3;
  - remotes не трогает и ничего не пушит: push делает исполнитель проекта по своему GOAL;
  - раздутые PROGRESS и PLAN уводит в `docs/archive/` с датой, свежие кладёт из шаблонов со ссылкой на архив;
  - пишет отчёт: что осталось тимлиду, исполнителю и оператору;
  - повторный запуск ничего не меняет;
  - `--self-test` работает на синтетической фикстуре во `/tmp/two-tier-v3`: тестовый клон без origin, раздутые PROGRESS и PLAN, харнес v2. Живые проекты в этой фазе не трогаются.

## 2. Фичи
- **F1 Бюджеты** · оператор видит нарушение бюджета раньше, чем оно стоит часов · готово: `budgets.json` с дефолтами §1; `--self-test` проходит зелёную и красную фикстуры по каждому правилу; на репо и ките — `BUDGET_OK` · чек: `bin/check-budget --self-test && bin/check-budget` → `BUDGET_OK` · служит: S1, S2 · after: —
- **F2 Intent, пин, владение** · разворот проекта и правка чужого файла не проходят молча · готово: красное, если пин SPEC ≠ `git hash-object` INTENT; если в SPEC остался маркер неясности; если фича не ссылается на существующий сигнал S; если файл тимлида изменён коммитом без «Тимлид:» или назван в END STATE; список коммитов «Тимлид:» — в evidence · чек: `bin/check-budget --self-test intent owner` → `INTENT_OK` · служит: S1 · after: F1
- **F3 CI** · проверка идёт без рук тимлида · готово: workflow на push и PR; ветка `v3` запушена; прогон workflow для её HEAD — success · чек: `bin/check-ci v3` → `CI_OK` · служит: S1 · after: F1
- **F4 Харнес** · исполнитель работает в auto mode на документированных полях, стоп-кран и подсказка проверены делом · готово: settings v3 по §1; пара запусков из LAUNCH.md: без `AGENT_STOP` файл-проба создан, с ним — не создан, прогон остановлен на первом вызове, в выводе `stopReason` kill-switch; по строке `STEER.md` модель пишет заданный маркер в файл; коннекторов claude.ai нет; `claude doctor` без ошибок настроек · чек: `bin/check-harness` → `HARNESS_OK` · служит: S1, S3 · after: F1
- **F5 Шаблоны** · документы рождаются внутри бюджета · готово: шаблоны v3 по §1, каждый с примером проходит `check-budget`; REVIEW — находки, до пяти блокирующих, секция `Named, not built`; PROCESS — Environment, Деньги (потолок, лимит вендора, порог платного шага, предохранитель по факту), каталог развилок · чек: `bin/check-budget --templates` → `BUDGET_OK` · служит: S2, S3 · after: F2
- **F6 Скиллы кита** · план и приёмка в новом режиме · готово: plan-phase v3 — для фаз с платными или необратимыми шагами (только текущий план, в бюджете, дельта Environment); accept v3 — свежий evaluator на каждой приёмке, вердикт в `docs/evidence/accept-<sha>.txt`, STATUS не пишет; team-lead и grilling из `kit/.claude/skills/` — в архив · чек: `bin/check-kit` → `KIT_OK` · служит: S3 · after: F5
- **F7 Upgrade** · живой проект перейдёт без потери истории · готово: на синтетической фикстуре во `/tmp/two-tier-v3` — ветка `kit-v3`, механика v3, архив PROGRESS и PLAN, отчёт; повторный прогон без изменений; у тестового клона нет origin, push нет · чек: `bin/two-tier-upgrade --self-test` → `UPGRADE_OK` · служит: S6 · after: F4, F5
- **F8 Документы** · v3 понятен за 10 минут · готово: README, `docs/dev-system.ru.md` (цикл v3, intent, бюджеты, самоулучшение), CHANGELOG (каждое поле харнеса — ссылка на док и итог прогона до и после), `docs/LAUNCH.md`; ссылки на файлы живые · чек: `bin/check-docs` → `DOCS_OK` · служит: S5 · after: F7
- **F9 Гейт** · кит v3 работает на пустом репо · готово: `bin/two-tier-init /tmp/two-tier-v3/t3`, там `check-budget` → `BUDGET_OK`; оттуда повторены маркеры F1, F2, F4, F5, F6, F7; F3 и F8 — из корня ветки; `bin/gate-v3` печатает маркеры с номером фичи (`F1 BUDGET_OK` … `F8 DOCS_OK`) · чек: `bin/gate-v3` → `GATE_OK` · служит: S1 · after: F8

## 3. Инварианты и границы
- C1: из репо ничего не удаляется. Вывод из кита — `git mv` в `docs/archive/kit-v2/`; v2 PROGRESS и PLAN — в `docs/archive/PROGRESS-v2.md` и `docs/archive/PLAN-v2.md`. Работа идёт на ветке `v3`; `main` меняет только оператор после приёмки.
- C4: живые проекты не трогаются; работа — только в репо и во `/tmp/two-tier-v3`; F7 — синтетическая фикстура.
- Файлы тимлида после коммита сида не правятся (список — §1, строка «Владение»).
- Ничего платного: контрольные `claude -p` — на подписке (`env -u ANTHROPIC_API_KEY`), не больше 3 ходов каждый. Секреты и токены не печатаются.
- Репо публичный: evidence и сообщения коммитов — это счётчики, коды выхода, маркеры и пути от корня репо или от `/tmp/two-tier-v3`. Без почты, id аккаунтов и организаций, имён клиентов и путей домашнего каталога.
- Каждый чек — команда и её вывод в транскрипте и в `docs/evidence/<F>-<check>-result.txt`.
- Вне объёма: перевод живого проекта, правка ролей брифа, передача между сессиями без оператора.

## 4. Стопы
Стоп — это выполненный goal: `STOP: <id>` новой строкой в `docs/PROGRESS.md`, рядом вопрос и resume-строка.
- **STOP-SCOPE** — реальная смена объёма или нет документированного способа достичь «готово»: цитата дока, альтернатива, вопрос. Расхождение деталей с доком — не стоп, а строка в PLAN-v3.
- **STOP-INPUT** — нужен вход оператора: блок auto mode без обходного пути, отказ вложенного `claude -p`, нет прав `gh`. Строка STOP пишется, только когда закрыты и запушены все фичи, которым этот вход не нужен.
- **STOP-NP** — нет прогресса: чек красный три попытки подряд без изменения вывода. Ожидание CI попыткой не считается.
- STOP-PAY в этой фазе не нужен: платных и необратимых шагов нет, push в `main` делает только оператор.

## 5. Артефакт закрытия
- Ветка `v3` запушена, `bin/check-ci v3` → `CI_OK`. `bin/two-tier-init /tmp/x && cd /tmp/x && bin/check-budget` → `BUDGET_OK`.
- Голова `docs/PROGRESS.md`: что сделано, следующий шаг оператора, когда можно закончить переход. STATUS пишет тимлид на приёмке.
- Гейт оператора — по сигналам S1, S2, S3, S5. S6 — после перевода живого проекта.

## 6. Открытые вопросы (вне фазы)
1. Перевод живого projekt_1_telefon — после приёмки кита: сессия тимлида плюс один `/goal` в проекте.
2. Политика планки F1 telefon — решение оператора на STOP-5.
3. Хватит ли auto mode для ssh и деплоя на сервер проекта — контрольный прогон при переводе.
4. Передача между сессиями без оператора — эксперимент после гейта.
