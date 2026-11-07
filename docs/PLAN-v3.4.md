# PLAN-v3.4 — two-tier-dev, кит под вкладкой Code

**Спека:** `docs/SPEC-v3.4.md` · **база фазы:** `tl/kit-v3.4` `42b0562`, SPEC — `b04aaad` · только текущий план; отклонение по ходу — правка этого файла тем же коммитом.

## Фикстуры
- **Проект-фикстура:** `git init` + `bin/two-tier-init` в свой каталог `/tmp/two-tier-v3/*` на каждую пробу (`check-harness`, `check-kit`, `gate-v3.4`); bare `origin` там же.
- **Клон telefon:** `/tmp/two-tier-v3/telefon-src` (ветка `linie-1`, `remote set-url --push origin DISABLED`) — образец, только чтение. Апгрейд идёт только на его копии `git clone` во `/tmp/two-tier-v3/telefon-up-*`. В скрипты и evidence адрес живого проекта не входит: чек берёт клон по `TELEFON_CLONE`, нет его — строка `offen`, не FAIL.
- **Журнал telefon 03–05.11:** проект его не коммитит; во `/tmp` копия, в репо — `checks/fixtures/telefon-spec-gate-0305.jsonl`: только `ts`, `decision`, класс причины, без сессий и списков.

## Файлы
Раскладка: продукт — в `kit/`, `bin/` и `checks/` корня — symlink на `kit/`; только в корне — `bin/two-tier-init`, `bin/check-docs`, `bin/check-verify`, `bin/gate-v3.4`, `checks/fixtures/`, `Makefile`.
- **Шаг 0:** `git mv` PROGRESS и evidence v3.3 в архив; этот файл; свежий PROGRESS.
- **F1:** `kit/.claude/hooks/spec-gate.mjs`, `kit/.claude/spec-gate.json`, `kit/bin/evidence` (новый, пишет `spec:`), `kit/bin/check-harness` (пробы F1, метки v3.3 → `v3.3-F1.*`, фикстуры с `spec:`), `bin/check-verify` (фикстуры с `spec:`), `kit/docs/SPEC.template.md` (STOP-TL), `checks/fixtures/telefon-spec-gate-0305.jsonl`.
- **F2:** `kit/bin/check-budget` (`planka-source`, `scope-growth`, `planken-inline`, `--lints`), `kit/bin/gate-test` (новый), `kit/checks/planken.json` (ключи без чисел), `kit/budgets.json` (`owner`: `checks/planken.json`, `frozen.json`), `kit/bin/check-kit` (дельта владения), `kit/bin/two-tier-upgrade` (`IF_ABSENT`).
- **F3:** `kit/frozen.json`, `kit/bin/check-frozen-diff` (судья и CI), `kit/.githooks/commit-msg` (`frozen-paths`), `kit/bin/check-passport`, `kit/docs/MODUL.template.md`, `kit/scripts/deploy.template.sh`, `kit/bin/check-kit` (раздел `frozen`).
- **F4:** `kit/scripts/deploy.template.sh` (строка отката), `kit/scripts/rollback.template.sh`, `kit/bin/check-fenster`, `kit/bin/check-live`, `kit/scripts/canary.template.py`, `kit/deploy/canary.service`, `kit/deploy/canary.timer`, `kit/docs/SPEC.template.md` §5, `kit/docs/GATE.template.md`, `kit/bin/check-budget` (`CONTRACT`), `kit/bin/check-kit` (раздел `fenster`).
- **F5:** `kit/checks/paired_stand.sh`, `kit/docs/SPEC.template.md` §2, `kit/bin/check-budget` (вендор), `kit/bin/verify-phase`, `kit/bin/phase-report`, `kit/bin/check-window`, `kit/bin/check-kit` (раздел `paar`, метки v3.3 → `v3.3-F5.*`).
- **F6:** `kit/bin/check-harness` (`--desktop`), `kit/.claude/settings.json`, `kit/.claude/launch.settings.json`, `kit/.claude/hooks/permission-denied.mjs`.
- **F7:** `kit/.claude/workflows/verify-phase.js` + копия в `.claude/workflows/`, `bin/check-verify`, `kit/bin/check-budget` (`risk-tier`), `docs/evals/`, `kit/bin/evidence` и чеки (`evidence geändert`), `GATE_SKIP` в гейте.
- **F8:** `CHANGELOG.md`, `docs/LAUNCH.md` (= `kit/docs/LAUNCH.md`), `README.md`, `docs/dev-system.ru.md`, шаблоны кита, `mods/window-guard/`, `mods/phase-start/`, `mods/.claude-plugin/marketplace.json`, `bin/gate-v3.4`, `bin/check-docs`, `git mv bin/gate-v3.3` → `docs/archive/gate-v3.3/`.
- Не создаётся: `.claude/settings.json` в корне; файлы тимлида (`budgets.json`, PROCESS, рубрика, `CLAUDE.md`) — их правки строкой в `## Notes`; корневой `frozen.json` (кит не замораживает себя).

## Пробы обеих сторон
Строка: пункт · зелёная сторона → красная сторона. Каждая проба печатает `F<n>.<k> <сырой вывод обеих сторон>`; маркер фичи — только после всех.
### F1 — `bin/evidence F1 check-harness -- bin/check-harness items` → `GATE_HOOK_OK`
- **F1.1** фикстура, неполный комплект: `monitor`, `workflow`, `shell` по одному → `pass background:<тип>` (3/3) → `subagent`, `MCP task` (и `teammate`, `cloud session`, задача без `type`) → `block` с id пункта (2/2+); смесь `subagent`+`monitor` → pass только `monitor`; журнал несёт типы.
- **F1.2** транскрипт старше 4 ч, неполный комплект → `block`, журнал `platform_cap=8`, ключа `hours` нет в `spec-gate.json` → тот же вход на хуке `b04aaad` → `pass cap-time`; 12 блоков сессии → новый `block`, старый `pass cap-blocks`; один список 3 раза → `no-progress` на 4-й.
- **F1.3** evidence с первой строкой `spec: SPEC-1` → SPEC_GATE_OK → первая строка `spec: SPEC-9`, `spec: SPEC-10`, без строки → `missing` с именем файла; вердикт другой SPEC не засчитан.
- **F1.4** `STOP: STOP-TL` + вопрос + Resume, запушен → `stop` (SPEC с §4 и без §4 — `STOP_IDS`) → без вопроса → `missing` «no question»; на диске без push → блок.
- **F1.5** 10 входов Stop точной формы вкладки (форма снята с журнала этой сессии) = ожидаемым решениям новым хуком → старый хук `b04aaad` на тех же входах < 10/10; `alt` — счёт `checks/fixtures/telefon-spec-gate-0305.jsonl` (срез ретро 61/78, весь день — другое число, печатаются оба). Живая вкладка: решения этой сессии в `docs/evidence/spec-gate.jsonl`, гейт §5 (1).
### F2 — `bin/evidence F2 budget -- bin/check-budget --lints` → `BUDGET_LINT_OK`
- **F2.1** строка посадки с `docs/evidence/<файл>`, `n=`, p50/p95 или с «ранняя» → OK → без них, до выдачи → `BUDGET_FAIL planka-source`; после выдачи (HEAD впереди коммита `docs/PROMPT.txt`, SPEC не менялась) → `WARN planka-source` (SPEC §1: «красная до выдачи»); итоговая строка не суммируется.
- **F2.2** новая `- **F<n>` против SPEC на коммите запроса без строки «Поправка» → `BUDGET_FAIL scope-growth F<n>` → со строкой «Поправка <решение>: слово оператора <дата>» → `поправок: k`; фичи не менялись → `поправок: 0`.
- **F2.3** `planken:<ключ>` при файле и ключе без чисел в блоке → OK → числа коридора рядом → `BUDGET_WARN planken-inline`; ключ без файла или нет ключа в файле → FAIL.
- **F2.4** `bin/gate-test <тест>`, красный, метка `flaky` в `checks/planken.json` (файл тимлида) → строка `FLAKY`, rc 0 → без метки → `TEST_FAIL`, rc 1; зелёный с меткой → ok.
### F3 — `bin/evidence F3 check-kit -- bin/check-kit frozen` → `FROZEN_OK`
- **F3.1** коммит в модуль, SPEC открывает `offen` → проходит → модуль не открыт или id вне `offen` → отказ с файлом; дифф > `diff_cap` → отказ с числом строк, в пределе → проходит.
- **F3.2** «Тимлид:» + `docs/STATUS.md` в проекте → проходит → «Тимлид:» + код модуля → отказ с файлом, с `offen: *` → проходит.
- **F3.3** отпечаток = паспорту → `PASSPORT_OK`, деплой идёт → расхождение без `<MODUL>_OFFEN` → `DEPLOY_FAIL step=passport`; с `<MODUL>_OFFEN=<текущая SPEC>` → идёт; чужая SPEC не открывает.
- **F3.4** заглушка `REGRESS_OK` → `DEPLOY_OK` → `REGRESS_FAIL` → `DEPLOY_FAIL step=regress`, `DEPLOY_OK` нет.
- **F3.5** копия клона telefon: `two-tier-upgrade` rc 0 → коммит в `src/` без `offen` → отказ с файлом, в `docs/` → проходит, `bin/check-budget` проекта зелёный → нет клона — строка `offen`, F3.5 не закрыт.
### F4 — `bin/evidence F4 check-kit -- bin/check-kit fenster` → `FENSTER_OK`
- **F4.1** деплой печатает `rollback: make rollback SHA=<prev>` (нет прежнего — `rollback: none`); `DEPLOY_OK linie=1`, затем `LIVE_OK`/`ROLLBACK_OK` → `bin/check-fenster` OK → без них → `FENSTER_ROT` с sha; `linie=0` строки окна не требует.
- **F4.2** свои синтетические фикстуры (без людей и номеров), решения 389–393: два зелёных звонка → `LIVE_OK` → `wiederholt`, `stumm`, `word_max`, `word_max_sicher`, `wartend`, один звонок при `--n 2` → `LIVE_FAIL` с причиной; `klang` снижает ход; значения ключей — из файла фикстуры.
- **F4.3** эталон в планке → `CANARY_OK` и письмо OK; выше жёлтой → GELB → красный или висящий → `CANARY_ROT` и письмо ROT, итог ≤ 60 с; письмо ловит локальный SMTP пробы.
- **F4.4** `bin/check-budget --templates` зелёный на ките → копия кита без каждой из строк §5 (окно, закрытие, регрессия, паспорт) и без п. 0 GATE → красный с именем строки.
### F5 — `bin/evidence F5 check-kit -- bin/check-kit paar` → `PAAR_OK`
- **F5.1** база/новый ×2 одним кодом → `PAIR_OK diff_p50 diff_p95` → заглушка +600 мс → `PAIR_FAIL`; правило печатается до прогона.
- **F5.2** шаблон §2 со строкой пары, звено вендора с `pair` или «ранняя» → OK → без → `planka-source` FAIL; шаблон без строки → `--templates` красный. Звено вендора — слово «вендор» в звене или слово `vendor_words` в звене и инструменте, целиком, без регистра; нет ключа — только «вендор» (398).
- **F5.3** `bin/verify-phase F<n>` n ≥ 2 на 2.1.316 и 2.1.318: секунды, команды в фоне из `run.jsonl`; судит и считается только `status: completed`, лимит — поле строки, `timeout=<k>` — счётчик → лимит по числам → CLI 2.1.318 нет → `F5.3 offen`.
- **F5.4** фикстура: вердикты, журнал окна, «Поправка» → три числа в отчёте → без данных — нули, не ошибка; мутация счёта ловится разницей чисел.
- **F5.5** порог кита 100 % (398): 99 % старт; на подставленном 85 ключ `seven_day` есть → судится: 84 % старт, 86 % отказ → `unifiedWindows` без ключа → `WINDOW_WARN seven_day=fehlt`, `WINDOW: start`, rc 0 (поправка 396: «нет обоих» больше нет); нет события, нет или пусто поле, ключ без числа, ошибка claude → отказ, как было.
- **Развилки F5:** звено вендора — как в F5.2; `PAAR_OK` печатается и при `F5.3 offen` (SPEC §4); `F5.3 n=<k>` — меньшее n сторон ≤2.1.316 и ≥2.1.318, 2.1.317 — ни одна; журнал заполнен назад только прогонами коммитов этого репо, `backfill: true`, `sec` там — от каталога клона до последней строки потока, без `check-window`; прогон другого проекта в журнале кита — не замер кита.
### F6 — `bin/evidence F6 check-harness -- bin/check-harness --desktop` → `HARNESS_OK`
- **F6.1** три версии, граф свежее HEAD → ok, брошенные worktree числом → граф старше HEAD → `HARNESS_WARN graph-age`.
- **F6.2** пара `claude -p` до/после поля в фикстуре: без поля запись вне → проходит, с полем → отказ; внутри → OK.
- **F6.3** `system/init` = таблице Environment → ok → подставное иное значение → красный; настоящий `.claude/settings.local.json`: нет → `HARNESS_WARN tab-profile profil=fehlt`, rc 0; та же суть → строки нет; иное → красный `tab-profile`; MCP «да» с 0 инструментов и статусом не connected и не pending → красный; deny: `docs/STATUS.md` → отказ, `kit/CLAUDE.md` → правка.
- **F6.4** три входа PermissionDenied формы документации → 3 строки счётчиков без `tool_input` → битый вход → 0 строк, rc 0.
### F7 — `bin/evidence F7 check-verify -- bin/check-verify` → `VERIFY_OK`
- **F7.1** `risk: high` → полный круг, ≥ 2 мутанта, `risk: low` → точечный → деплой на линию (токен или слово `deploy_words`, 398) без `high` → `BUDGET_FAIL risk-tier`; нет ключа — только токен; идущая фаза с правкой тимлида → WARN, черновик и правка на диске → FAIL.
- **F7.2** заглушки воркфлоу: прошлый вердикт в запросе, повторная находка → «повтор», класс и счёт — второй строкой вердикта (первая остаётся `VERDICT: …`) → без прошлого — без пометки.
- **F7.3** `docs/evals/` мутант паузы отката: проверяющий ловит → `EVAL_OK 1/1` → снятый мутант → не `EVAL_OK`.
- **F7.4** detached HEAD → `GATE_SKIP reason=detached` → на ветке прежний маркер; чек, сменивший файл evidence, печатает `evidence geändert <файл>`, не сменивший — молчит.
### F8 — `bin/evidence F8 gate -- bin/gate-v3.4` → `GATE_OK`
- **F8.1** `bin/check-docs`: строка CHANGELOG на поле с источником и на снятое (K30, P1-4, ultrareview, кап 12), 4 документа, `docs/README.md` называет текущей SPEC запроса → убрать строку на копии, старая фаза в указателе → красный.
- **F8.2** `--templates` зелёный, шаблоны = telefon по §2–§5 и (ae)–(ah) → расхождение на копии → красный.
- **F8.3** `claude plugin validate|test mods/window-guard`, окна выше порога → deny → `/window override` → проходит; ниже → проходит.
- **F8.4** `claude plugin validate|test mods/phase-start`: `/phase` на ветке SPEC → запрос уходит → чужая ветка → отказ; `/resume`, `/halt` по тестам мода.
- **F8.5** `gate-v3.4` на проекте из `two-tier-init`: маркеры F1–F7 + v3.3 → лог без маркера → FAIL разметки; клон telefon после апгрейда зелёный, нет клона — `offen`.

## Порядок
`шаг 0 → F1 → F2 → F3 → F4 → ревью и мутации → починка → /code-review → bin/verify-phase F1 F2 F3, F4 → STOP-TL «Leg 1» → слово оператора → F5 → F6 → F7 → F8 → STOP-TL «Leg 2»`.
- F2 раньше F3: `planken.json` и `IF_ABSENT` читает апгрейд. F3 раньше F4: шаблон деплоя. F1 первым: хук судит остальное.
- `spec-gate.mjs`, `commit-msg`, `check-budget` — главная сессия руками; мутации и ревью — воркфлоу в своих worktree, коммит — главная сессия. Push — после каждой фичи.

## Риски
1. **`bin/verify-phase` отказывает до клона:** `check-window --repair` без ключа `five_hour`, F5.5 — плечо 2, `--override-window` — только словом оператора. → попытка, вывод, `STOP-INPUT` с точной командой.
2. **`planka-source` на самой SPEC-v3.4:** её строки посадки без `n` и p50/p95, SPEC не правится. → до выдачи FAIL, после выдачи WARN (SPEC §1), строка в Notes и в вопросе STOP-TL; красная сторона — на фикстурах.
3. **Коллизии апгрейда telefon:** файл проекта на пути кита архивируется и заменяется; `commit-msg` кита заменит правило проекта. → судья читает схему `frozen.json` проекта (`module/pfade/offen/basis`), `frozen.json` и `checks/planken.json` — `IF_ABSENT`, новые файлы — имена `*.template*`; план апгрейда на клоне сразу после F2.
4. **`background_tasks[].type` на 2.1.316:** снято замером на этой вкладке: фоновый шелл — `pass background:shell`, фоновый подагент — `block` (журнал `docs/evidence/spec-gate.jsonl`, поле `bg`).
5. **Подагент фоном больше не отпускает ход:** после F1.1 ждать только Workflow или на переднем плане.
6. **Ложный блок `spec-gate`:** строка в Notes; второй — STOP-INPUT (SPEC §4).
7. **Выжившие мутации в круге** (v3.3: 8 точечных кругов): → проход мутаций воркфлоу по каждой фиче до `bin/verify-phase`.
8. **Push из клона telefon в живой репо:** → `pushurl DISABLED` стоит; проба апгрейда — на копии клона.

## Доказательство
`bin/evidence <F> <check> -- <команда>`: первая строка `spec: SPEC-v3.4`, вторая — команда, дальше вывод, rc команды. Маркер — строка в файле. F3, F4, F5 — разделы `bin/check-kit`; без раздела `bin/check-kit` печатает все маркеры.

| Фича | Команда | Маркер | Evidence |
|---|---|---|---|
| F1 | `bin/check-harness` (голый: все разделы) | `GATE_HOOK_OK` | `F1-check-harness-result.txt` |
| F2 | `bin/check-budget --lints` | `BUDGET_LINT_OK` | `F2-budget-result.txt` |
| F3 | `bin/check-kit frozen` | `FROZEN_OK` | `F3-check-kit-result.txt` |
| F4 | `bin/check-kit fenster` | `FENSTER_OK` | `F4-check-kit-result.txt` |
| F5 | `bin/check-kit paar` | `PAAR_OK` | `F5-check-kit-result.txt` |
| F6 | `bin/check-harness --desktop` | `HARNESS_OK` | `F6-check-harness-result.txt` |
| F7 | `bin/check-verify` | `VERIFY_OK` | `F7-check-verify-result.txt` |
| F8 | `bin/gate-v3.4` | `GATE_OK` | `F8-gate-result.txt` |

## Отклонения от SPEC и документации
1. Метка типа в документации hooks: `cloud session`, `MCP task` — с пробелом; неизвестный тип — сырой дискриминант: всё, что не `monitor`/`workflow`/`shell`, идёт в суд комплекта.
2. Схема `frozen.json` — проекта telefon (`module/pfade/offen/phase/basis`) плюс `diff_cap`, а не имена K62 (`closed`): иначе живой замок проекта после апгрейда молчит.
3. Метка `flaky` — в `checks/planken.json` (файл тимлида), а не в тексте теста: красный тест исполнитель сам не снимает.
4. `two-tier-upgrade --branch <имя>` сверх SPEC: на живом клоне telefon прежняя `kit-v3` разошлась с `linie-1` (2 коммита тимлида против 438), апгрейд отказывал; по умолчанию отказ остаётся.
5. `frozen.json` и `checks/planken.json` апгрейд ставит отдельным коммитом «Тимлид:», только если их нет (как базу рубрики): файл тимлида в коммите кита красил lint владения.
6. Судья замка читает `frozen.json` и запрос из HEAD: правка на диске замок не открывает.

7. Чужой файл evidence той же фичи не блокирует при полном своём комплекте — только подсказка в списке, когда своего не хватает: «строка чужой SPEC не засчитывается» (F1.3).
8. Вопрос и Resume стопа — только в трёх строках после `STOP:` (как и говорит сообщение хука); вопрос — `?` без буквы, `=`, `&`, `%` сразу за ним: `?` в адресе — не вопрос, `**Принять?**` — вопрос.
9. Правило `frozen-paths` в `bin/check-budget`: корневой `.github/` вне разрешённых путей запроса, а workflow кита уже зовёт `bin/check-budget` — так судья замка доходит до CI.
10. Судья замка считает дифф бинарного файла одной строкой: `numstat` строк не даёт, а молчать о таком файле нельзя.
11. В `diff_cap` не идут `docs/`, `intent/`, `claude/` и файлы тимлида: иначе правка «Тимлид:» в `docs/` модуля проходит хук и красит CI и следующий коммит исполнителя.
12. `deploy-stand` — история sha, а не один sha: прежний — последняя строка, отличная от этого; повтор деплоя и красный деплой цель отката не теряют, откат снимает всё, что шло после своего sha.
13. `frozen.json` и `checks/planken.json` судья замка держит сам, без строки в `owner`: `budgets.json` проекта апгрейд не пишет, а замок, который открывает обычный коммит, — не замок (F3.5). Создание в истории не судится: telefon создал замок коммитом F52.1.
14. CI судит коммиты текущей фазы: от якоря, но не раньше первого коммита запроса с этой SPEC. Иначе смена запроса красит работу прошлой фазы, а в шаблоне нет шага «сдвинь basis».
15. `DEPLOY_FAIL` красных выкатки и регрессии несёт `linie=`, такая строка тоже открывает окно: код уже на линии. Буква F4.1 — только `DEPLOY_OK`.
17. Graphify в ките — по слову оператора 07.11, до плеча 2: `.githooks/post-commit` пересобирает граф, если он есть (`core.hooksPath` глушит `graphify hook install`, копилка 54); первая сборка — `bin/two-tier-init`; отчёт апгрейда называет заглушённые хуки; `HARNESS_WARN graph-age` — часть F6.1, остальное F6.1 — в плече 2. Граф самого `two-tier-dev` не строится: таблица тимлида «нет», SPEC §1.
16. Окно 5 ч снято словом оператора до плеча 2: тариф его отменил. Строка F5.5 SPEC остаётся для недели; `--repair` принимается и ничего не делает: строка запуска проекта с ним не падает.
18. M2/M3 судят по `isInteractive`, `session.attach` или непустому `$.session.surfaces()`: desktop-хост не интерактивен; `/resume` — встроенная, поэтому `/phase resume` и `/phase halt`. Живая вкладка — гейт §5 (5).
19. F8.2: моды «да» и `true` в профиле кита; договор `--templates` — §3 и (ae)–(ah); сверка с telefon — в `bin/check-docs`, названные дельты в строке пункта. F8.5: гейт судит t4, `FROZEN_OK` — корень ветки; кроме F5.3 разрешён только `F3.5 telefon=offen · не репо кита` на t4.
20. F6.3: `effortLevel`, `ultracode`, `CLAUDE_CODE_SUBAGENT_*` — в профиле, не в `settings.json`, который грузит каждый вложенный прогон. Файл профиля кит не кладёт: копия шагом оператора, иначе каждая фикстура пишет реестр плагинов через CLI.
21. `bin/check-gate` в `make ci` сверх SPEC: гейт на заглушках (лог без маркера, файл кита вне git, чужой offen, архив, клон) и преамбула, без модели, `GATE_SELFTEST_OK`; иначе финальную строку гейта не судит никто.
22. F8.1: источник поля — страница с якорем, указатель на сверку или «измерено» с пробой, не цитата на поле.
23. F5.2 (398): слова `vendor_words` судятся и в ячейке инструмента. Замер на 7 SPEC клона telefon: в звене — 0 из 2 настоящих вендоров (`Google Speech`, `gemini` стоят в инструменте) и 1 ложное, со звеном и инструментом — 2 из 2 и 2 ложных `API`.
24. F7.1 (398): `issued()` не тронут (F2.1), но `risk-tier` судит ещё `in_flight()`: коммит пункта `F<n>.<k>: …` на первой родительской линии после выдачи и чистый диск → WARN. Иначе слова списка красят F3, F4, F7 самой SPEC-v3.4, которую тимлид правил поправками; метки — решение тимлида. Проба текущей SPEC в `bin/check-verify`: OK или WARN.
25. F5.5 (398): встроенный порог `bin/check-window` — 100, как ключ кита: проект без ключа иначе отказывал бы на 85; `window-guard` без ключа и так молчит.

## Итог мутаций и ревью плеча 1: что не чиню
Выжившие мутанты и находки (81 мутант, 8 подтверждений) закрыты правкой или пробой; ниже — то, что осталось сознательно. Причина — развилка дизайна, наследство образца или сдвиг правила.
- **F2.1 шапка таблицы:** шапка `измерено 04.11 (линия)` и таблица без внешних `|` не считаются таблицей посадки: расширение красит SPEC-10 клона telefon (F3.5), правило двигать нельзя. Тимлиду — решить формой шаблона.
- **F2.1 планка прозой:** `**Планки фазы**: …` правило не судит: прозу кодом не отличить; форма посадки — таблица шаблона §2.
- **F2.4 проводка гейта:** гейт зовёт `bin/gate-test bin/check-spend --self-test` (F8.5).
- **F4 звонки до деплоя, перекрытые звонки:** судья не режет журнал по времени и не разводит звонки на одной линии — как образец (`LIVE_SEIT` вне судьи); сказано в его строке. Срез журнала — шаг проекта: кит не знает его формата времени. В шаблоне деплоя строки окна без времени — резать нечем.
- **F1.1 вечный процесс в фоне:** `shell` или `monitor`, который не кончится (dev-сервер, `tail -f`), отпускает ход без суда: это буква F1.1; срок задачи в Stop input не виден.
- **graphify, ребейз:** хук не пропускает ребейз — сборка на каждый перенесённый коммит; graphify их сериализует, лишняя работа, не порча; post-checkout нет — переход HEAD видит отметка `.built-head` (WARN).
- **F1.5 живой прогон:** `code_tab=10/10` — реплей точной формы Stop input плюс журнал этой вкладки; живой прогон вкладки на фикстуре — гейт оператора §5 (1).
- **F4 откат на любой коммит:** откат закрывает окно с любым существующим sha: запрет мешал бы аварийному откату; сказано в шапке шаблона.
- **F3 «Тимлид:» мимо хука:** коммит с этой строкой мимо хука, который правит и `frozen.json`, и код модуля, CI судит уже новым замком. Хук такой коммит отказывает; строка «Тимлид:» — доверие, CI его не проверит.
- **F3 слияние с двух сторон:** чистое автослияние файла закрытого модуля, правленного с обеих сторон, судится как своя правка слияния: строже, чем нужно, но молча такой файл не пройдёт.

## К плечу 2 (решение 396, без новых пунктов)
- **F3.4:** `exit N` в `DEPLOY_CMD` → строка `DEPLOY_FAIL step=rollout` (и строка отката); сторона `DEPLOY_CMD="exit 3"` — rc 1, `rc=3` в строке, с `DEPLOY_LINIE=1` окно открыто.
- **F2.1:** файл распределения непустой по тексту (файл из пробелов — FAIL), не симлинк наружу `docs/evidence/` (FAIL); обе стороны — на фикстуре.
- **F5.5:** `WINDOW_WARN seven_day=fehlt` — по отсутствующему ключу недели (поправка 396), ключ есть — OK.

## Журнал прогонов (бюджет стохастики — SPEC §4)
Строка на прогон стохастической пробы: сторона · исход.
- голый `bin/check-harness`, раздел commit (v3.3 F2.4/F2.5 — живой суд abide), 07.11: на `9af1453` — F2.4 «заметка» 4 пробы без заметки, F2.5 `no-writes-outside-repo` без оценки · красный; раздел отдельно — F2.4 зелёный (заметка 0.78 с 3-й пробы), F2.5 без двух оценок · красный; на `ee7a5a8` — F2.5 зелёный, F2.4 «заметка» 4 пробы без заметки · красный; вывод меняется — не STOP-NP.
- голый `bin/check-harness` на `b1f2285` (решение 397): все маркеры OK, `COMMIT_WARN abide: печать ключа без ответа (CHECK_TIMEOUT)` · зелёный.
- голый `bin/check-harness` на `ee7a5a8`, повтор: F2.4 «заметка» 4 пробы без заметки, F2.5 `no-secret-values` без оценки · красный; abide напрямую на образце — 0.97 за 1,2 с ×3.
