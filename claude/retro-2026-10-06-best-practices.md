# Ретро two-tier-dev против лучших практик — 06.10.2026

**Вопрос оператора:** не пережали ли мы исполнителя в Claude Code жёсткими лимитами и ограничениями в спеках и `/goal`. Сравнение с рекомендациями Anthropic, Карпатого и Бориса Черного на октябрь 2026.

**Что прочитано:**
- живой скилл `team-lead` v5.2 (05.10) и роли `role-*` v1.0–1.1, `grilling`;
- кит v2 (копия из пакета скиллов Cowork);
- `projekt_1_telefon`: SPEC-1, PLAN-1, PROGRESS, PROCESS, 14 ревью-файлов, 215 коммитов, `.claude/settings.json` и текст последнего `/goal` (передача тимлида 05.10);
- архив `two-tier-dev`: v3.20 и v3.23, intent v2 от 18.09.

Источники: официальные страницы Anthropic, проверенные 06.10.2026, и посты Бориса и Карпатого. Где цитата взята из вторичного источника, это помечено.

---

## 0. Вердикт

**Да, исполнителя пережали. Но не в тексте `/goal`.** Сам предикат сделан по документации: 3 835 знаков, конечное состояние, названный чек, ограничения. Давление сидит вокруг него, в трёх местах.

1. **Объём.** `/goal` требует прочитать «in full first» 18 файлов — около 633 тыс. знаков. Всего процессных документов фазы около 670 тыс. знаков, а кода продукта около 127 тыс. (≈5:1).
2. **Путь вместо результата.** Ревью тимлида задают исполнителю `файл:строку`, порядок правок, число итераций и готовые тест-кейсы. «Готово» фичи — в медиане ≈1,9 тыс. знаков, у F1 и F4 — 2,8–3,5 тыс.
3. **Механизм роста.** Правило «на каждом стопе — правка скилла» сильнее правила самого скилла «новое правило — только при повторе, сначала хуком». За 17 дней скилл вырос с 4,8 до 34,3 тыс. знаков (×7). Это уровень v3.20–v3.23, от которого лечили v2.

Вариант «всё правильно, ты просто торопишься» данные не подтверждают. Это системная проблема, и та же самая, что записана в intent v2 от 18.09: «скилл вырос до 385 строк, оператор стал шиной, интеллект тратился на рулинги вместо решений». Ядро системы верное и совпадает с практиками. Лечить нужно объём, путь и механизм роста. Бюджеты при этом должны держаться механикой, а не прозой.

Отдельная слабость — intent (§9): «зачем» проекта устарело после трёх разворотов и жило в поправках SPEC и ревью, а не в одном файле с версией.

Не всё в сроках — механика. 23–29.09 ждали интервью, 30.09 развернули пилот, 02.10 добавили F8–F10. Часть красных прогонов — настоящие дефекты продукта, и приёмка находила их по делу. Вывод о системной проблеме держится на структурных фактах: объём чтения, путь в ревью, правило роста. От этих оговорок он не зависит.

---

## 1. Что измерено

| Что | Число | Где |
|---|---|---|
| Скилл `team-lead` | v4.0: 4 755 знаков / 52 стр (18.09) → v4.8: 18 816 (28.09) → v4.10: 24 302 (30.09) → **v5.2: 34 264 знака / 242 стр (05.10)**. Для сравнения v1: v3.20 — 33 112, v3.23 — 39 561 | `_archive/`, `two-tier-dev/docs/archive/`, синхронизированная копия |
| Роли и `grilling` | `role-checker` 9 571 · `role-research` 9 555 · generator 5 965 · judge 4 678 · `grilling` 3 095. Вместе со скиллом ≈67 тыс. знаков | синхронизированные копии |
| README пакета | описывает v4.7 «~80 строк»; живой скилл — v5.2, 242 строки | README пакета скиллов |
| Процессные документы фазы 1 | SPEC-1 135 стр · PLAN-1 558 стр (шаблон — 40 строк и четыре раздела) · PROGRESS 828 стр (шаблон: «Cap 60 строк») · PROCESS 155 стр · 14 ревью. Итого **≈670 тыс. знаков** | `projekt_1_telefon/docs` |
| Код продукта | `src/*.py`: 17 файлов, 2 977 строк, ≈127 тыс. знаков. Тесты 6 580 строк, чеки 2 653 строки | там же |
| Чтение на старте сессии | «Read in full first» по последнему `/goal`: 18 файлов, ≈633 тыс. знаков по их текущим размерам (грубая оценка — 150–250 тыс. токенов) | `goal-body-prev.txt` |
| «Готово» фичи | 11 фич: медиана 1 939 знаков, от 476 до 3 493 (F4); F1 — 2 830. Предел всего `/goal` — 4 000 | SPEC-1 §2 |
| Поправки и решения | R1…R142 и решения до №138 за 16 дней фазы | git log, ревью |
| Коммиты | 215 всего. Продукт (код, деплой, скрипты, автоматизации, веб, схемы, профили) трогают 56 (26 %). 90 — только `docs/`, из них 44 — только результаты прогонов в `docs/evidence`. Из 74 поправок по ревью (`R…`) 46 не трогают продукт: только чеки, тесты, документы | git log --name-only |
| Цена одного стопа | STOP-2 (05.10): предохранитель считал по оценкам до старта ($2.49 + $0.51 > $2.50) и не пустил прогон. Оценки в разы выше факта: полный прогон — оценка $0.61–0.69, факт $0.17–0.19. Приёмка на этом стопе — 1 ч 51 мин и 11 поправок R121–R131, из них два настоящих блокирующих дефекта новых чеков | ревью STOP-2 (05.10) |
| Приёмка против работы | STOP-5 (05.10): плечо 1 ч 26 мин и 26 коммитов, окно приёмки 2 ч 04 мин (включая ожидание ответа оператора ≈15:40Z) | ревью STOP-5 (05.10) |
| Инертный харнес | `verify-gate.sh` охраняет `test-results.json`. Такого файла в проекте нет, `RESULTS_FILE` не задан, блокировать хуку нечего. При этом `/accept` велит читать evidence только через Read «ради verify-gate» | `.claude/settings.json`, `hooks/` |
| Режимы исполнителя | `"model": "opus"`. По трейлерам коммитов исполнитель 20–21.09 работал на Opus 5, с 30.09 — на Opus 5.5: алиас сменил модель сам. Харнес и правила писались под Opus 5. `ultracode: true` всегда, bypassPermissions | settings, git log, docs Model config |
| Слоистые поправки | `/goal`: «§0 overrides the rest», «newest wins», «amendment sections override the rest». Действующую версию правил исполнитель собирает сам из 6+ документов | `goal-body-prev.txt` |

Про сроки честно. Фазу 1 планировали на неделю. По календарю идёт 16-й день, а дней с работой исполнителя около 9. 23–29.09 ждали интервью (STOP-0), были развороты пилота 22.09, 28.09 и 30.09, 02.10 добавились F8–F10. Часть задержки — эти причины, часть — механика.

---

## 2. Сравнение с лучшими практиками

✅ совпадает · ⚠️ частично или с перебором · ❌ противоречит

| # | Практика и источник | У нас | Оценка |
|---|---|---|---|
| 1 | Интервью → спека → свежая сессия на исполнение (Claude Code Best practices: «have Claude interview you… start a fresh session to execute it») | `grilling` → SPEC → `/goal` в свежей сессии | ✅ |
| 2 | Проверка — главный рычаг (Борис: «2–3x the quality»; Карпатый: «give it success criteria and watch it go») | чек и маркер на каждую фичу, evidence на диске, гейт оператора | ✅ |
| 3 | Независимый проверяющий в свежем контексте (Fable 5 guide: «fresh-context verifier subagents tend to outperform self-critique»; Harness design 24.03) | есть, но слоёв проверки до семи (§3, п. 5). Opus 5 guide: явные инструкции проверки дают over-verification | ⚠️ |
| 4 | Задавать результат, а не путь (Карпатый: «imperative → declarative»; Harness design: «constrain the agents on the deliverables… let them figure out the path»; Борис: «trying to over-specify» — частая ошибка) | ревью задают `файл:строку`, порядок R-правок, «итерация одна, каким бы ни был её итог», тест-кейсы | ❌ |
| 5 | Краткость инструкций (Best practices: «Bloated CLAUDE.md files cause Claude to ignore your actual instructions!»; Skills: «Claude is already very smart»; Борис: «every 6 months delete your Claude MD… skills… hooks») | `CLAUDE.md` 2,9 КБ — ✅. Но чтение на старте ≈633 тыс. знаков, скилл ×7 | ❌ |
| 6 | Правила добавляются по данным (Skills: evaluation-driven development; Anthropic 23.04: одна строка про длину ответов стоила −3 %, вывод — абляции по строкам) | новое правило на каждом стопе, без абляции и без удаления | ❌ |
| 7 | `/goal`: одно измеримое конечное состояние, названный чек, ограничения, ≤4 000 знаков (docs `/goal`) | 3 835 знаков, A/B-конец, чек, ограничения | ✅ |
| 8 | Пауза только на необратимое, на реальную смену объёма или на вход, который даёт только человек (Fable 5 и 5.1 guides) | плюс стопы на долларовых потолках плеча и на счёте красных прогонов | ⚠️ |
| 9 | Жёсткие пределы держит харнес, а не проза (Opus 5 guide: caps — env vars, `max_budget_usd`; Best practices: «hooks are deterministic») | guard расходов в коде, deny-правила — ✅. Рядом дублирующая проза и инертный `verify-gate` | ⚠️ |
| 10 | Оценка агента: код-грейдеры для жёстких правил; частичный зачёт и pass^k там, где поведение стохастическое; чтение транскриптов («Demystifying evals», 09.01) | чек F1 — детерминированный код по ответам бота, для жёстких правил (фразы, путь, запреты) это правильно. Но планка — все 29 сценариев в одном свежем прогоне без частичного зачёта, и после 3–5 красных прогонов исполнитель обязан остановиться | ⚠️ |
| 11 | Безнадзорный режим — auto mode вместе с `/goal` (docs `/goal`: «To let goal turns run unattended, run /goal in auto mode»; Best practices: auto mode — стартовый режим с v2.1.283) | bypassPermissions | ⚠️ |
| 12 | `ultracode` — для параллельных задач, в рутине выключать (docs Workflows: «Turn it off… when you return to routine work») | включён постоянно, а работа фазы в основном последовательная | ⚠️ |
| 13 | Вышла новая модель → пересмотреть харнес (Harness design: «stripping away pieces that are no longer load-bearing»; Opus 5.5 guide: длинную автономную работу ведёт лучше Opus 5) | с 30.09 исполнитель на Opus 5.5 (алиас `opus` сменил модель сам), харнес и правила остались от Opus 5 | ⚠️ |
| 14 | Человек вне внутреннего цикла (Карпатый, интервью, март 2026, по пересказам: «remove yourself as the bottleneck»; Anthropic 18.02: обязательные паттерны вмешательства «create friction without necessarily producing safety benefits») | оператор нужен на каждом стопе, приёмка тимлида дольше плеча | ⚠️ |
| 15 | Роли — отдельные свежие субагенты, автор ≠ судья (Multi-agent research system, 13.06.2025) | так и сделано | ✅ (протокол тяжёлый) |
| 16 | Эмфаза — на одну строку, не на многие (Best practices) | в скилле 11 слов капсом | ✅ |

---

## 3. Где именно пережато — шесть механизмов

1. **Чтение на старте.** «Read in full first» — это 18 файлов и ≈633 тыс. знаков, включая весь PLAN-1 и PROGRESS. Best practices: «LLM performance degrades as context fills». Шаблоны говорят «PROGRESS — одна страница, Cap 60 строк» и «PLAN — 40 строк». В деле 828 и 558 строк: шаблонный лимит без механики не держится.

2. **Путь в ревью.** R132 называет файл и диапазон строк кода, предписывает, как принимать решение («только если модель приводит дословную цитату… и код находит её»), и даёт готовые тест-кейсы. §6 того же файла задаёт порядок «R136 → R139 → R138 → R134 → R132…» и «итерация одна, каким бы ни был её итог». Формально §7 пишет «шагов реализации нет», но фактически это дизайн за исполнителя. Harness design 24.03: «if the planner tried to specify granular technical details upfront and got something wrong, the errors in the spec would cascade».

3. **Правила подсчёта в прозе.** В «готово» F1 сидят правила полного прогона, исключение «решение 136», счёт «пять, после решения 137 — три», лимит «не больше 6 новых». Это логика чека, а живёт она в тексте SPEC. Context engineering 29.09.2025 называет это крайностью: «hardcoding complex, brittle logic in their prompts to elicit exact agentic behavior… creates fragility». Best practices советуют детерминированное переносить из инструкций в хуки и код: «delete it or convert it to a hook», «hooks are deterministic». Место правилам подсчёта — код `check-dialog`.

4. **Стопы на центах.** STOP-2 — ложный стоп: предохранитель считал по оценкам до старта, которые в разы выше факта, и остановил плечо на $0.51 при потолке $2.50. Приёмка на этом стопе нашла и два настоящих дефекта — значит, нужна проверка, но не остановка всего плеча из-за центов. Время оператора и тимлида на порядки дороже предотвращённого перерасхода. Деньги стоит держать одним потолком проекта и лимитом на стороне вендора: лимит консоли вендора уже есть.

5. **Слои проверки.**
   - Opus 5 проверяет себя сам: «verifies its own work without being told to».
   - `ultracode` сам строит воркфлоу «понять / изменить / проверить».
   - Правила evidence в `CLAUDE.md`.
   - evaluator `/accept`.
   - `role-checker` до выдачи задачи: два прохода и сверка.
   - Свой прогон тимлида в другой оболочке и локали.
   - «Тест обеих сторон» и статика мутаций по классу форм (R126, R138 — 35 случаев).

   Opus 5 guide: явные инструкции проверки и «legacy harness scaffolding that adds separate verification steps» дают over-verification. Best practices: «A reviewer prompted to find gaps will usually report some, even when the work is sound… Chasing every finding leads to over-engineering». Итог: из 215 коммитов фазы продукт трогают 56, а 46 из 74 поправок по ревью идут мимо продукта — в чеки, тесты и документы.

6. **Рост правил.** Скилл §8: «Новое правило — при повторе той же ошибки… сначала как hook». Тот же §8 и стоящее правило оператора от 04.09 требуют «на каждом стопе предлагать правку скилла». Второе побеждает: ×7 за 17 дней, и ни одно правило не удалено. Skills best practices требуют baseline без скилла и минимальные инструкции. Anthropic 23.04 показал, что одна строка может стоить −3 %, отсюда абляции по строкам. Борис советует «delete your skills… see what the model does».

Отдельно — **цикл на стохастике.** F1 закрывается одним полным прогоном, где зелёные все 29 сценариев. Чек — детерминированный код по ответам бота, и для жёстких правил (фразы, путь, запреты) это правильно. Проблема в другом: после 3–5 красных полных прогонов исполнитель обязан остановиться и ждать тимлида и оператора. В прогонах 1–3 часть красного давал стенд (звонящего играет модель), и под это выросли правила валидности SV1–SV4. В прогонах 4–6 красное шло уже от продукта. Карпатый в autoresearch решает ту же задачу без человека в цикле: одна метрика, фиксированный бюджет, keep/discard через git, «NEVER STOP», «simpler is better». Demystifying evals советует частичный зачёт и pass^k там, где поведение стохастическое.

---

## 4. Что оставить — это сильные стороны

- `grilling` → SPEC → `/goal` в свежей сессии. Таблицы посадки числовых планок (на 700 мс они сработали), но лёгкие.
- Чек с маркером и evidence на диске. Гейт, где оператор сам запускает продукт. Карпатый: «you can outsource your thinking, but you can't outsource your understanding».
- Независимый evaluator в свежем контексте — на гейте фазы.
- «Узкий мост» держится механикой: deny-правила на файлы тимлида, guard расходов в коде, `check-eu`, секреты без вывода, файрвол с автооткатом. Это ровно «low freedom» из Skills best practices.
- Один коммит на фичу, PROGRESS как состояние, свежая сессия на плечо (Effective harnesses, 26.11.2025).
- Красная заранее зарегистрированная планка принимается спокойно. У оператора три решения.
- Предикат `/goal` по документации. Фраза «A fork SPEC leaves open → simplest reading plus a line in Notes; not a stop» совпадает с Fable 5.1: «make routine judgment calls yourself».
- В `CLAUDE.md` кита уже стоят формулировки из Opus 5 guide («do not use subagents to verify your own work», «Deliver what was asked…»). Официальные гайды здесь уже применены.
- Роли: автор ≠ судья, свежие субагенты, протокол в файлах.

---

## 5. Что менять — по приоритету

**P1. Бюджеты механикой, не прозой.**
- `team-lead` SKILL.md — не больше 80 строк (как в intent v2) и ≈12 тыс. знаков, чтобы строки не росли вширь. Роли — не больше ≈6 тыс. знаков каждая, детали протоколов уходят в reference-файлы рядом (progressive disclosure).
- Проверку `check-budget` положить в CI `two-tier-dev`: превышение валит сборку.
- SPEC: строка фичи — не больше 600 знаков (наблюдаемый результат, команда чека, маркер). Правила подсчёта прогонов и исключения живут в коде чека.
- `/goal`: «Read first» — не больше 3 файлов и ≈50 тыс. знаков (SPEC, PROGRESS, текущий ревью-файл). Остальное — «читать по необходимости».
- PROGRESS — не больше 60 строк, история уходит в git. PLAN — только текущий план, а не журнал поправок. Чек длины в `check-budget` проекта.
- Документы переписываются целиком, слоистых «действует поверх» нет.

**P2. Сменить механизм роста.** Это меняет правило оператора от 04.09, поэтому решать ему.
- На стопе паттерн называется и записывается строкой в каталог развилок проекта (PROCESS).
- В скилл паттерн попадает только на ретро фазы, по принципу «одно вошло — одно вышло», и после абляции: тот же случай прогоняется со строкой и без неё.
- Правило, не сработавшее за фазу, удаляется. Для каталога PROCESS это уже есть — распространить на скилл.
- С каждой новой моделью — «удалить и посмотреть» (Борис): один реальный айтем прогоняется на голом ките, результат сравнивается.

**P3. Ревью — это находки, а не рецепты.**
- Формат находки: симптом · доказательство (файл evidence, строка лога) · нарушенный критерий SPEC · чек приёмки.
- Блокирующих — не больше 5. Остальное идёт в «Named, not built».
- Без `файл:строка`, без порядка правок, без числа итераций. Как чинить, решает исполнитель в PLAN.

**P4. Стопы — только по четырём причинам.**
- Необратимое или платное выше осмысленного порога.
- Реальная смена объёма.
- Внешний вход, который даёт только оператор.
- «Нет прогресса»: метрика не растёт k прогонов подряд, а не «N красных подряд». Так формулирует и пример в docs Workflows: «keep fixing… until the type check passes or two rounds in a row make no progress».
- Поплечевые потолки в доллары убрать. Оставить один потолок проекта и лимит вендора.

**P5. Цикл на стохастике.**
- Жёсткие правила (фразы, путь, запреты) оставить как есть — детерминированным кодом.
- Главное изменение: исполнитель итерирует сам в фиксированном бюджете (время и €), с одной метрикой, keep/discard через git и журналом прогонов. Без обязательного стопа после N красных прогонов; стоп — по P4.
- Решение оператора: критические сценарии (список — в SPEC-1 проекта) — нулевой допуск, для остальных — доля прохождения вместо «все 29 в одном прогоне».
- На гейте оператор читает транскрипты провалов. Если понадобится судья-модель для качества речи — откалибровать его на метках оператора или заказчика.

**P6. Диета проверки.**
- Оставить три слоя: детерминированные чеки, один независимый проход на гейте фазы, гейт оператора.
- Свой прогон тимлида «в другом окружении» заменить CI на push: GitHub Actions, `make check`, $0, ноль часов.
- Двухпроходный `role-checker` до выдачи задачи — только для платных и необратимых задач.
- `verify-gate` и `track-read` убрать или привязать к реальному файлу. Правило §8 «инертное поле убирается» применить к себе.
- Убрать из промптов исполнителя инструкции перепроверки (Opus 5 guide). Требование «вывод чека в транскрипте» оставить: на нём стоит оценщик `/goal`.

**P7. Харнес на октябрь 2026.** Каждое переключение — отдельным контрольным айтемом.
- Модель исполнителя зафиксировать явным id вместо алиаса `opus`: с 30.09 он молча перевёл исполнителя на Opus 5.5. Харнес под Opus 5.5 пересмотреть контрольным айтемом.
- auto mode вместо bypass, плюс deny-правила и лимит вендора.
- `ultracode` по умолчанию выключен. Включать ключевым словом на параллельные айтемы: аудит, миграция, сверка источников.
- Cross-session messaging (Claude Code v2.1.224+) и Remote Control — чтобы «отчёт готов» и resume шли между сессиями без оператора. Учесть: у сессии в bypass входящие по умолчанию держатся на одобрение; команды вроде `/goal`, присланные текстом, не исполняются, для них нужен headless `claude -p "/goal …"`.

---

## 6. Заранее заявленные планки диеты

Мерить на следующей фазе. Красное принимаем спокойно.

| Метрика | Планка |
|---|---|
| `team-lead` SKILL.md | ≤ 80 строк и ≤ 12 тыс. знаков |
| «Read first» у `/goal` | ≤ 3 файла и ≤ 50 тыс. знаков |
| Блокирующих поправок на стоп | ≤ 5 |
| Время приёмки тимлида | ≤ время плеча исполнителя |
| Коммиты | правок продукта ≥ правок по ревью |
| Стопов на фазу (кроме внешних входов) | ≤ 3 |

---

## 7. «Треды» и оркестрация в Claude Code — что есть на октябрь 2026

Фичи с названием «threads» в документации нет. Что есть:
- **Subagents** — GA.
- **Dynamic workflows** (`ultracode`) — GA. Для задач, «larger than one agent can hold in context», или одного шага по многим объектам.
- **Agent teams** — экспериментальная, выключена по умолчанию. Документация: «For sequential tasks, same-file edits, or work with many dependencies, a single session or subagents are more effective».
- **Agent View** и фоновые сессии (`claude agents`) — research preview.
- **Cross-session messaging** — сессии пишут друг другу, в том числе через Remote Control и облако.
- **`/loop`**, routines, desktop scheduled tasks.
- **В API — Managed Agents** (19.05.2026): outcomes (рубрика и отдельный грейдер в своём контексте), multiagent orchestration, dreaming.

Для нашей последовательной работы по фичам подходят одна сессия и субагенты. Workflows — на параллельные айтемы. Agent teams — не сейчас.

---

## 8. Ограничения анализа

- `/context` и токены исполнителя не мерил. Оценка 150–250 тыс. токенов на «Read first» грубая, по знакам. На момент запуска того `/goal` эти файлы были ≈555 тыс. знаков, сейчас ≈633 тыс.
- Часть срока фазы — развороты пилота и ожидание внешних входов, не механика. Окно приёмки STOP-5 включает ожидание ответа оператора.
- «Только `docs/`» среди коммитов наполовину — результаты прогонов (`docs/evidence`), то есть выход проверки, а не процессный текст.
- Фраза Бориса «You don't need /goal» — о том, что главное верификация, а не отказ от `/goal`. Документация рекомендует `/goal` + auto mode для безнадзорных прогонов.
- Карпатый хочет детальную спеку, Борис — минимум инструкций. Противоречия нет, если детальность относится к результату, ограничениям и критериям выхода, а не к пути.
- Цитаты Бориса из интервью Y Combinator (Diana Hu) — по SEJ (30.07.2026) и расшифровке. Цитаты Карпатого с Sequoia и из мартовского интервью — по пересказам. Остальное — первичные страницы, проверены вторым, независимым проходом.

## 9. Intent — где у нас слабо и как его держат

**Что нашли (projekt_1_telefon).**
- Бриф проекта в `intent/` — от 19.09, с метрикой по 20 звонкам. После разворотов 22.09, 28.09 (отозван) и 30.09 он не обновлялся.
- Развороты жили в поправках SPEC и в ревью-файлах (витрина 30.09, решения 01–05.10). «Зачем» фазы исполнитель собирал из 18 обязательных файлов.
- Пина нет: SPEC не говорит, от какой версии intent он подписан, и расхождение intent со SPEC ничем не ловится.
- `intent/` смешивает «зачем» с эталонными входами (профили, сценарии, записи). У них разный цикл жизни: «зачем» меняется на развороте, эталоны замораживаются.
- В v2 цепочка intent → SPEC → PLAN была (`intent/two-tier-dev-v2.md`), но без механизма свежести.

**Что говорят источники.**
- Anthropic, Fable 5: «Claude Fable 5 tends to perform better when it understands the intent behind a request». Fable 5.1: «the scope is the deliverable: don't quietly narrow, widen, or swap it»; длинные задачи без подсказок по методу — «especially when the goal is clear». `/goal` — одно измеримое конечное состояние.
- GitHub Spec Kit: обязательные секции — сценарии, требования и Success Criteria (измеримые исходы, без технологий); неясное помечается `[NEEDS CLARIFICATION: …]` до реализации.
- Kiro: requirements (EARS: «WHEN … THE SYSTEM SHALL …») → design → tasks; требования трассируются до реализации, спека правится по ходу.
- Бёкелер (martinfowler.com, 15.10.2025): уровни spec-first, spec-anchored (спека живёт после задачи и ведёт эволюцию), spec-as-source. Риск — гора markdown на ревью: «I'd rather review code than all these markdown files».
- Османи (13.01.2026): спека — живой документ («Don't write it and forget it»), «что и зачем» раньше «как»; много директив разом снижают качество по всем.

**Что делает v3 (решение D3).**
- Один живой `intent/INTENT.md` на проект, до ~6 тыс. знаков. В нём: проблема, результат, сигналы успеха `S…` (измеримые, без технологий), жёсткие ограничения, не-цели, решено и открыто с маркерами, эталонные входы (заморожены, отдельными файлами) и журнал разворотов.
- SPEC несёт выжимку intent в 3–5 строк и пин `intent/INTENT.md @ <hash>`. Каждая фича — `служит: S…`; фича без сигнала уходит в `Named, not built`.
- Механика вместо памяти: `check-budget` краснеет на расхождении пина, на маркере в SPEC и на фиче без сигнала. Маркер в INTENT — предупреждение.
- Разворот — строка журнала, новый пин и переподпись SPEC по затронутому фронтиру, а не слой поправок.
- Гейт оператора судит по сигналам `S…` из intent, а не по списку фич.
- Уровень по Бёкелер — spec-anchored: intent и SPEC живут после фазы. Spec-as-source не берём: код остаётся первичным артефактом исполнителя. Против горы markdown — бюджеты: INTENT до 6 тыс. знаков, фича до 600, `Read first` до 50 тыс.
- Исполнитель читает intent только тогда, когда развилке нужно «зачем»; остальное закрывает выжимка в SPEC §0.

**Перевод telefon.** Первый шаг сессии перевода: тимлид с оператором собирают `INTENT.md` проекта из брифа 19.09, решений витрины 30.09 и решений 01–05.10. Журнал разворотов восстанавливается задним числом.

---

## Ключевые цитаты

- Prompting Claude Opus 5: «it performs best when given the complete task specification up front and left to run.» · «Claude Opus 5 verifies its own work without being told to. If your prompt contains explicit verification instructions…, remove them: instructions like these cause over-verification… The same applies to legacy harness scaffolding that adds separate verification steps.»
- Prompting Claude Fable 5: «Skills developed for prior models are often too prescriptive for Claude Fable 5 and can degrade output quality.» · «Pause for the user only when the work genuinely requires them: a destructive or irreversible action, a real scope change, or input that only they can provide.»
- Prompting Claude Fable 5.1: «can execute very long tasks without much guidance on methodology, especially when the goal is clear.»
- Prompting Claude Opus 5.5: «sustains long-running autonomous work better than Claude Opus 5… with parallel subagents and little oversight.»
- Claude Code Best practices: «If you emphasize many lines, none of them stands out.» · «The over-specified CLAUDE.md… Ruthlessly prune. If Claude already does something correctly without the instruction, delete it or convert it to a hook.»
- `/goal`: «It doesn't run commands or read files independently, so write the condition as something Claude's own output can demonstrate.» · «To let goal turns run unattended, run /goal in auto mode.»
- Harness design (24.03.2026): «Every component in a harness encodes an assumption about what the model can't do on its own».
- Seeing like an agent (10.04.2026): «As model capabilities increase, the tools that your models once needed might now be constraining them.»
- Борис, интервью Y Combinator (SEJ, 30.07.2026): «people tend to over-engineer… trying to over-specify… And that's just not the way the model works.» · «You don't need /goal, you don't need /loop. These help. But really all you need is give the model the task, give it a way to verify the output of its work…» · по расшифровке: «We deleted 80% of the system prompt» (про Opus 5), «every 6 months delete your Claude MD. Delete your skills. Delete your hooks. See what the model does».
- Борис, 11.09.2026: «Production code written by Claude should have a higher bar than if it was written by a human.» Ограждения: lint, тесты, e2e силами Claude, фаззеры, автоматическое код-ревью и ревью безопасности.
- Карпатый, 26.01.2026: «Don't tell it what to do, give it success criteria and watch it go.» · 02.10.2026: «As LLMs get better, they will do more and more of the legwork autonomously, and a lot more of our work will rise up the abstractions into oversight and understanding.» С мая 2026 Карпатый работает в Anthropic.

## Источники

- Claude Code — Best practices: https://code.claude.com/docs/en/best-practices
- Claude Code — `/goal`: https://code.claude.com/docs/en/goal
- Claude Code — Dynamic workflows: https://code.claude.com/docs/en/workflows
- Claude Code — Cross-session messaging: https://code.claude.com/docs/en/cross-session-messaging
- Claude Code — Agent teams: https://code.claude.com/docs/en/agent-teams
- Claude Code — Model configuration (алиас `opus` → Opus 5.5; `ultracode` — не уровень effort): https://code.claude.com/docs/en/model-config
- Prompting Claude Opus 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
- Prompting Claude Opus 5.5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
- Prompting Claude Fable 5: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5
- Prompting Claude Fable 5.1: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1
- Skill authoring best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Effective context engineering for AI agents (29.09.2025): https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Effective harnesses for long-running agents (26.11.2025): https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Demystifying evals for AI agents (09.01.2026): https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- Measuring AI agent autonomy in practice (18.02.2026): https://www.anthropic.com/research/measuring-agent-autonomy
- Harness design for long-running application development (24.03.2026): https://www.anthropic.com/engineering/harness-design-long-running-apps
- Seeing like an agent (10.04.2026): https://claude.com/blog/seeing-like-an-agent
- An update on recent Claude Code quality reports (23.04.2026): https://www.anthropic.com/engineering/april-23-postmortem
- New in Claude Managed Agents (19.05.2026): https://claude.com/blog/new-in-claude-managed-agents
- How we built our multi-agent research system (13.06.2025): https://www.anthropic.com/engineering/multi-agent-research-system
- Борис Черный, интервью Y Combinator — SEJ (30.07.2026): https://www.searchenginejournal.com/head-of-anthropics-claude-code-says-prompt-engineering-not-that-important/584286/ · расшифровка: https://sozai.app/transcript/boris-cherny-cut-80-percent-claude-code-prompt/
- Борис Черный, 11.09.2026 — Simon Willison: https://simonwillison.net/2026/Sep/11/boris-cherny/
- Карпатый, 26.01.2026: https://threadreaderapp.com/thread/2015883857489522876.html
- Карпатый, autoresearch `program.md`: https://github.com/karpathy/autoresearch/blob/master/program.md
- Карпатый, интервью март 2026 (пересказ): https://the-decoder.com/andrej-karpathy-says-humans-are-now-the-bottleneck-in-ai-research-with-easy-to-measure-results
- Карпатый, 02.10.2026: https://threadreaderapp.com/thread/2105819303471976479.html
- Карпатый в Anthropic: https://news.bloomberglaw.com/esg/openai-founding-member-andrej-karpathy-takes-role-at-anthropic
- GitHub Spec Kit — шаблон спеки: https://github.com/github/spec-kit/blob/main/templates/spec-template.md
- Kiro — Specs: https://kiro.dev/docs/specs/concepts
- Б. Бёкелер, Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl (15.10.2025): https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- Э. Османи, How to write a good spec for AI agents (13.01.2026): https://addyosmani.com/blog/good-spec/
