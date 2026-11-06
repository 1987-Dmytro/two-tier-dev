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
- **F5.2** шаблон §2 со строкой пары, звено вендора с `pair` или «ранняя» → OK → без → `planka-source` FAIL; шаблон без строки → `--templates` красный.
- **F5.3** `bin/verify-phase F<n>` n ≥ 2 на 2.1.316 и 2.1.318: секунды, команды в фоне из `run.jsonl` → лимит по числам → CLI 2.1.318 нет → `F5.3 offen`.
- **F5.4** фикстура: вердикты, журнал окна, «Поправка» → три числа в отчёте → без данных — нули, не ошибка; мутация счёта ловится разницей чисел.
- **F5.5** событие только `seven_day` → `WINDOW_WARN five_hour=fehlt`, rc 0 и порог недели судится → оба → как было; нет обоих → отказ, как было.
### F6 — `bin/evidence F6 check-harness -- bin/check-harness --desktop` → `HARNESS_OK`
- **F6.1** три версии, граф свежее HEAD → ok, брошенные worktree числом → граф старше HEAD → `HARNESS_WARN graph-age`.
- **F6.2** пара `claude -p` до/после поля в фикстуре: без поля запись вне → проходит, с полем → отказ; внутри → OK.
- **F6.3** `system/init` = таблице Environment → ok → подставное иное значение → красный; deny: `docs/STATUS.md` → отказ, `kit/CLAUDE.md` → правка; CLI ниже 2.1.318 — часть `offen`.
- **F6.4** три входа PermissionDenied формы документации → 3 строки счётчиков без `tool_input` → битый вход → 0 строк, rc 0.
### F7 — `bin/evidence F7 check-verify -- bin/check-verify` → `VERIFY_OK`
- **F7.1** `risk: high` → полный круг, ≥ 2 мутанта, `risk: low` → точечный → деплой на линию без `high` → `BUDGET_FAIL risk-tier`.
- **F7.2** заглушки воркфлоу: прошлый вердикт в запросе, повторная находка → «повтор», первая строка находки — класс и счёт → без прошлого — без пометки.
- **F7.3** `docs/evals/` мутант паузы отката: проверяющий ловит → `EVAL_OK 1/1` → снятый мутант → не `EVAL_OK`.
- **F7.4** detached HEAD → `GATE_SKIP reason=detached` → на ветке прежний маркер; чек, сменивший файл evidence, печатает `evidence geändert <файл>`, не сменивший — молчит.
### F8 — `bin/evidence F8 gate -- bin/gate-v3.4` → `GATE_OK`
- **F8.1** `bin/check-docs`: строка CHANGELOG на поле с источником и на снятое (K30, P1-4, ultrareview, кап 12), 4 документа → убрать строку на копии → красный.
- **F8.2** `--templates` зелёный, шаблоны = telefon по §2–§5 и (ae)–(ah) → расхождение на копии → красный.
- **F8.3** `claude plugin validate|test mods/window-guard`, окна выше порога → deny → `/window override` → проходит; ниже → проходит.
- **F8.4** `claude plugin validate|test mods/phase-start`: `/phase` на ветке SPEC → запрос уходит → чужая ветка → отказ; `/resume`, `/halt` по тестам мода.
- **F8.5** `gate-v3.4` на проекте из `two-tier-init`: маркеры F1–F7 + v3.3 → лог без маркера → FAIL разметки; клон telefon после апгрейда зелёный, нет клона — `offen`.

## Порядок
`шаг 0 → F1 → F2 → F3 → F4 → ревью и мутации → /code-review → bin/verify-phase F1 F2 F3, F4 → STOP-TL «Leg 1» → слово оператора → F5 → F6 → F7 → F8 → STOP-TL «Leg 2»`.
- F2 раньше F3: `planken.json` и `IF_ABSENT` читает апгрейд. F3 раньше F4: шаблон деплоя. F1 первым: хук судит остальное.
- `spec-gate.mjs`, `commit-msg`, `check-budget` — главная сессия руками; мутации и ревью — воркфлоу в своих worktree, коммит — главная сессия. Push — после каждой фичи.

## Риски
1. **`bin/verify-phase` отказывает до клона:** `check-window --repair` без ключа `five_hour`, F5.5 — плечо 2, `--override-window` — только словом оператора. → попытка, вывод, `STOP-INPUT` с точной командой.
2. **`planka-source` на самой SPEC-v3.4:** её строки посадки без `n` и p50/p95, SPEC не правится. → до выдачи FAIL, после выдачи WARN (SPEC §1), строка в Notes и в вопросе STOP-TL; красная сторона — на фикстурах.
3. **Коллизии апгрейда telefon:** файл проекта на пути кита архивируется и заменяется; `commit-msg` кита заменит правило проекта. → судья читает схему `frozen.json` проекта (`module/pfade/offen/basis`), `frozen.json` и `checks/planken.json` — `IF_ABSENT`, новые файлы — имена `*.template*`; план апгрейда на клоне сразу после F2.
4. **`background_tasks[].type` на 2.1.316 не проверен (UNVERIFIED):** нет поля — каждое ожидание судится, планка ложных блоков. → журнал типов сразу после F1.1, ход с фоновым `sleep`, строка в Notes.
5. **Подагент фоном больше не отпускает ход:** после F1.1 ждать только Workflow или на переднем плане.
6. **Ложный блок `spec-gate`:** строка в Notes; второй — STOP-INPUT (SPEC §4).
7. **Выжившие мутации в круге** (v3.3: 8 точечных кругов): → проход мутаций воркфлоу по каждой фиче до `bin/verify-phase`.
8. **Push из клона telefon в живой репо:** → `pushurl DISABLED` стоит; проба апгрейда — на копии клона.

## Доказательство
`bin/evidence <F> <check> -- <команда>`: первая строка `spec: SPEC-v3.4`, вторая — команда, дальше вывод, rc команды. Маркер — строка в файле. F3, F4, F5 — разделы `bin/check-kit`; без раздела `bin/check-kit` печатает все маркеры.

| Фича | Команда | Маркер | Evidence |
|---|---|---|---|
| F1 | `bin/check-harness items` | `GATE_HOOK_OK` | `F1-check-harness-result.txt` |
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

## Журнал прогонов (бюджет стохастики — SPEC §4)
Строка на прогон стохастической пробы: сторона · исход.
