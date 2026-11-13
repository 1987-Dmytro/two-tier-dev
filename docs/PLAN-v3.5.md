# PLAN-v3.5 — two-tier-dev, фаза без рук оператора

**Спека:** `docs/SPEC-v3.5.md` · **база фазы:** `1a6dce4` (кит = `main` `6cd2177`, v3.4) · **дата:** 12.11.2026 · только текущий план; отклонение по ходу — правка этого файла тем же коммитом.

## Фикстуры
- **Проект-фикстура:** `git init` + `bin/two-tier-init` в свой каталог `/tmp/two-tier-v3/<чек>-*` на каждую пробу; bare `origin` рядом; ветка и `docs/PROMPT.txt` с `branch <b> only` — для `/phase`.
- **Хост вкладки** (F1, F2.1, F2.4): функция `tab_host` в `kit/bin/check-harness` (её грузит `bin/check-kit`, как `bin/check-verify` грузит харнес): `claude --output-format stream-json --verbose --input-format stream-json --model claude-opus-5-5 --setting-sources user,project,local --permission-mode auto --include-partial-messages --replay-user-messages --debug-file <лог> --plugin-dir <копия мода> --settings <выкл. установленный мод того же имени, jev-belay>`; своя группа процессов (`start_new_session`), `killpg` в `finally`; без `ANTHROPIC_API_KEY`; `SPEC_GATE=off`, кроме F2.4; `ui_attach` — строкой `control_request` (kit-fixes §1). Нет `claude` в PATH — строка `F<n>.<k> offen`, маркера нет, rc 0.
- **Копия мода:** кандидат правится в копии `/tmp/two-tier-v3/mods-v35/<мод>`; в `mods/` дерева — одним шагом после зелёных `claude plugin validate` и `claude plugin test`. Сторона «0.3.0» и «v3.4» — `git archive 6cd2177` во `/tmp/two-tier-v3/old-*`.
- **Головы транскриптов SPEC-11** (`checks/fixtures/telefon-spec11-transcript-heads.jsonl`, только чтение): синтетический транскрипт на голову — записи как в фикстуре (`type`, `sessionId` = хеш, `own: null` — без `sessionId`), запись пользователя по виду (`meta`, `command:/phase`, `prompt` — текст `docs/PROMPT.txt` фикстуры), первая своя — `assistant`. Служебная сессия — синтетика без запроса.
- **Клон telefon:** `/tmp/two-tier-v3/telefon-src` (`main`, чистый, `688f940c`) — только чтение; апгрейд — на свежей `git clone` во `/tmp/two-tier-v3/tel-*` на прогон; кит v3.4 — `git archive 6cd2177`.

## Файлы
- **Шаг 0:** `git mv docs/PROGRESS.md docs/archive/PROGRESS-v3.4-2026-11-12.md`; свежий PROGRESS; этот файл. Evidence v3.4 остаётся (имена не пересекаются, хук и отчёт фильтруют по `spec:` — Notes).
- **Префиксы (первый коммит кода):** строки проб прошлых фаз → версия: `kit/bin/check-harness` (items `F1.*`→`v3.4-F1.*`, commit `F2.*`→`v3.3-F2.*`, env `F3.*`→`v3.3-F3.*`, desktop `F6.*`→`v3.4-F6.*`), `kit/bin/check-kit` (`F3–F5.*`, `F9.*`→`v3.4-…`), `kit/bin/check-budget --lints` (`F2.*`→`v3.4-F2.*`), `bin/check-verify` (`F7.*`, `F4.4`→`v3.4-…`), `bin/check-docs` (`F6.*`,`F8.*`→`v3.4-…`), `kit/bin/two-tier-upgrade` (`F3.4`→`v3.3-F3.4`), парсеры: `bin/gate-v3.4`, `bin/check-gate`; фикстуры (`F2.20`, SPEC-1) не трогаются.
- **F8.3 «до»:** `kit/bin/verify-phase` — в строке журнала `ts`, `tokens` (`totalTokens`), `wf` (12 знаков `git hash-object` воркфлоу клона), `models`; `bin/check-verify` дописывает строки живых фикстур в `docs/evidence/verify-runs.jsonl` репо с `fixture`.
- **F1:** `mods/handoff/hooks/register.tsx` (команда везде; авто — только REPL или поверхность; порог `budgets.json` → `pluginConfigs` → 70; статус с поверхностью), `handoff.test.ts`, `plugin.json` 0.4.0, README; `kit/budgets.json` (`handoff_threshold_pct` 40); `kit/.claude/launch.settings.json` (`autoCompactWindow` 600000, без `threshold` в `pluginConfigs`); `kit/bin/check-harness` (`modes` без порога handoff); `kit/bin/check-kit` (раздел `handoff`, дельта ключей).
- **F2:** `kit/.claude/hooks/spec-gate.mjs` (метка, ответвление, правила 1–4), `kit/.claude/hooks/steer.sh`, `mods/phase-start/hooks/register.ts` (+ тест, 0.2.0), `kit/.gitignore`, `.gitignore`, `kit/bin/two-tier-init`/`bin/two-tier-init` (кладёт `.gitignore`), `kit/bin/check-harness` (раздел `session`).
- **F3:** `kit/.claude/hooks/spec-gate.mjs` (открытый стоп, слово Resume в журнале), `kit/bin/check-harness` (раздел `stop`, старые пробы `stop` под новую семантику).
- **F4, F5, F7:** `kit/bin/check-budget` (`planka-early`, `basis-judge`, `spec-paths`, `spec-review`, `--templates`), `kit/docs/SPEC.template.md` (§1 «Новые пути:», §2 пункт-отчёт, §5 строка базы), `kit/docs/PLAN.template.md`, `kit/REVIEW.md` (раздел «Спека до подписи»), `kit/docs/PROCESS.template.md` (строка проверяющего).
- **F6:** `kit/bin/operator-word` (новый) + symlink `bin/operator-word`, `kit/.githooks/commit-msg` («Оператор:» в окне, «Тимлид:» при `CLAUDECODE=1`), `kit/bin/check-budget` (`owner`), `kit/bin/phase-report` (список), `kit/docs/SPEC.template.md` §3, фикстуры «Тимлид:» в `check-harness`, `check-kit`, `check-verify`, `check-budget` — git без `CLAUDECODE`; `kit/bin/check-kit` (раздел `operator`).
- **F8:** `kit/.claude/workflows/verify-phase.js` + `.claude/workflows/verify-phase.js` (все стадии Opus), `git mv kit/.claude/agents/evaluator.md docs/archive/`, `kit/REVIEW.md` (шапка), `kit/bin/check-kit` (без evaluator), `kit/bin/two-tier-upgrade` (evaluator — в архив запуска), `bin/check-verify`.
- **F9:** `kit/budgets.json` (`team_lead_spec_copy_chars` 8000), `kit/bin/check-budget` (размер), `CHANGELOG.md`, `README.md`, `docs/README.md`, `docs/dev-system.ru.md`, `kit/CLAUDE.md`, `kit/docs/PROCESS.template.md`, `bin/check-docs`, `bin/gate-v3.5` (новый, Python), `kit/bin/two-tier-upgrade` (строки `.gitignore` кита — к строкам проекта), `kit/bin/check-kit` (раздел `telefon`, ретаргет v3.4-F3.5); `bin/gate-v3.4` и `bin/check-gate` — как есть.
- Не создаётся: файлы тимлида (`budgets.json`, `CLAUDE.md`, PROCESS, рубрика, `.claude/launch.settings.json`) — их правки строкой в Notes; ключи v3.5 в корень вносит тимлид.

## Порядок
Шаг 0 → префиксы → F8.3 «до» (лаунчер, коммит, живые фикстуры `bin/check-verify` один раз из клона ветки во `/tmp/two-tier-v3`, строки журнала — в репо) → F2 → F3 → F1 → F4, F5, F7 → F6 → F8 (правка воркфлоу после строки «до») → F9 → `/code-review` → круг `verify-phase` → отчёт → STOP-TL. Коммит на пункт или фичу, `git add` по точным путям.

## Пробы обеих сторон
Строка: пункт · зелёная сторона → красная. Каждая печатает `F<n>.<k> <сырой вывод обеих сторон>`; маркер — после всех.
### F1 — `bin/evidence F1 check-kit -- bin/check-kit handoff` → `HANDOFF_TAB_OK`
- **F1.1** хост, копия мода 0.4.0, `budgets.json` фикстуры 40, потом 10: `handoff` в `commands_changed`, `/handoff status` → `threshold 40%`, `threshold 10%` → копия 0.3.0: команды нет → `F1.1 neu=40,10 alt=fehlt`.
- **F1.2** тот же хост: файлов в `handoffs/` до — 0; `/handoff now` → 1 и `system/conversation_reset` (или `compact_boundary`/строка движка) → `F1.2 datei=0,1 reset=1`; сторона «до» — 0 файлов.
- **F1.3** хост с `ui_attach` и без: статус `surface desktop` / `surface none`; порог 10, ход читает файл ≈ 400 КБ (заполнение > 10 %) → с поверхностью файл хендоффа и следующий ход запроса продолжения (1) → без неё 0 → `F1.3 fl=desktop,none auto=1,0`.
- **F1.4** `claude plugin test` копии: названные тесты «второго нет выше порога − 20», «после спада есть», «подагент — 0» → `F1.4 zweiter=0,1 agent=0`; мутант без `isArmed` — тест красный.
- **F1.5** `kit/budgets.json` `handoff_threshold_pct` 40; `modes` без порога handoff (старая `modes` на новом шаблоне — FAIL, новая — OK); `claude -p` фикстуры с профилем шаблона как `settings.local.json` → `effectiveWindow=580000`, без поля → 980000 → `F1.5 fenster=580000,980000 modes=raus`.
### F2 — `bin/evidence F2 check-harness -- bin/check-harness session` → `GATE_SESSION_OK`
- **F2.1** хост, копия `phase-start` 0.2.0: до команды id в метке 0, после `/phase` 1, после `/phase resume` 1 → копия без записи метки: 0,0,0 → `F2.1 marke=0,1,1 mut=0,0,0`.
- **F2.2** головы SPEC-11: 9 ответвлений и служебная при метке → `pass not the phase session` 10/10; 9 без файла метки 9/9; 6 после сброса (в метке, как пишет мод) — 0/6 пропусков; хук v3.4 (`6cd2177`) — 0/9; мутант без правила ответвления — `block` → `F2.2 neu=10/10 ohne=9/9 reset=0/6 alt=0/9 mut=block`.
- **F2.3** вне метки (файл есть): запрос, Resume `/phase resume`, продолжение хендоффа до первого `assistant` → `block` 3/3; служебная без файла — v3.4 `block` → `F2.3 block=4/4`; красная — та же служебная при файле → `pass`.
- **F2.4** хост с хуком (`SPEC_GATE=shadow` — решение в журнале, ход не держится; отклонение 4): `/phase`, `/clear`, ход → новый id в метке, решение `block`; копия без записи на `classic.SessionStart` → `pass not the phase session` → `F2.4 clear=block mut=pass`.
- **F2.5** `steer.sh`: сессия фазы получает заметку (1), чужая при метке — нет (0), без метки — любая (1); `git check-ignore .claude/phase-session.json` в фикстуре из кита → `F2.5 steer=1,0,1 ignore=OK`; красная — `.gitignore` без строки → не игнорируется.
### F3 — `bin/evidence F3 check-harness -- bin/check-harness stop` → `GATE_STOP_OK`
- **F3.1** открытый стоп формы SPEC-11 (вопрос, отдельная строка Resume — её шлёт `/phase resume`) в запушенном HEAD, после него только отчётные коммиты (evidence, PLAN, голова PROGRESS), между концами хода — слово оператора не строкой Resume → `stop`, `stop` (та же и новая сессия); «Resume: …» в строке вопроса — тоже стоп → хук v3.4: `stop`, `block` → `F3.1 neu=stop,stop alt=stop,block`.
- **F3.2** коммит кода после стопа → `block`; «— снят» → `block`; слово Resume в транскрипте, потом только отчётные коммиты → `block`, новая сессия (Resume — из журнала, поле `resumed` = `<sha стопа>:<хеш строки>`) → `block` → `F3.2 code=block snyat=block resume=block,block`.
- **F3.3** строка стопа = строке стопа прошлой фазы (база PROGRESS и журнал её знают) → `stop`; хук v3.4 → `block` → `F3.3 neu=stop alt=block`.
- **F3.4** без вопроса и Resume / причина вне §4 / только на диске → missing с именем, 3/3 → `F3.4 form=3/3`; красная — оформленный стоп → `stop`.
### F4 — `bin/evidence F4 budget -- bin/check-budget --lints` → `PLANKA_EARLY_OK`
- **F4.1** форма F58.1 (id в заголовке таблицы посадки и в строке «ранняя», ключ `planken:`), пункт без «отчёт:» → `BUDGET_FAIL planka-early F58.1`; заголовок таблицы — через пустую строку (как в шаблоне и SPEC-11) и вплотную; пункт списка над таблицей — не заголовок → `F4.1 rot=FAIL`.
- **F4.2** тот же с «отчёт:» → OK; планка с файлом распределения → OK → `F4.2 otchet=OK datei=OK`.
- **F4.3** `--templates` шаблонов (§2 SPEC, PLAN — пункт-отчёт) → OK; шаблон без строки → FAIL → `F4.3 vorlage=OK rot=OK`.
### F5 — `bin/evidence F5 budget -- bin/check-budget --lints` → `SPEC_PATHS_OK`
- **F5.1** SPEC без строки «Судьи деплоя и регрессии, изменённые фазой, на базе:» → `BUDGET_FAIL basis-judge`; с ней → OK → `F5.1 ohne=FAIL mit=OK`.
- **F5.2** путь вне HEAD и «Новые пути:» → `BUDGET_FAIL spec-paths <путь>`; шаблон SPEC — OK → `F5.2 fehlt=FAIL vorlage=OK`.
- **F5.3** путь HEAD, «Новые пути:», `<…>`/`*`, `/tmp/…`/`~/…`, под `.gitignore` → OK 5/5 → `F5.3 ok=5/5`; красная — те же без условия → FAIL.
- **F5.4** образцы SPEC-11 v2: путь профиля, файл ревью, `make check-live --ab`, запрос без `branch <b> only|from` — каждый назван → `F5.4 spec11=4/4`.
### F6 — `bin/evidence F6 check-kit -- bin/check-kit operator` → `OPERATOR_WORD_OK`
- **F6.1** `--templates`: строка «Окно доводки: открыто <пути> · запас диффа <N>» в §3 → OK; без неё → FAIL → `F6.1 vorlage=OK rot=OK`.
- **F6.2** фикстура: SPEC с окном `docs/STATUS.md`, `bin/operator-word docs/STATUS.md -m "x"` (stdin) → коммит «Оператор: x» → `F6.2 offen=commit`; красная — F6.3.
- **F6.3** путь вне окна / SPEC без окна / дифф сверх запаса → отказ, файл цел, коммита нет → `F6.3 nein=3/3`.
- **F6.4** хук: «Оператор:» в окне — проход, вне — отказ; `bin/check-budget` — `BUDGET_FAIL owner` на внеоконном; «Тимлид:» при `CLAUDECODE=1` — отказ, без — проход; `bin/check-harness commit` и `bin/check-kit frozen` из сессии — зелёные → `F6.4 op=ja,nein tl=nein fixturen=OK`.
- **F6.5** `bin/phase-report` фикстуры: «Оператор:» 2, «Тимлид:» 1 плеча (после коммита запроса) — sha, путь, слово; пустая — 0,0 → `F6.5 liste=2,1 leer=0,0`.
### F7 — `bin/evidence F7 budget -- bin/check-budget --lints` → `SPEC_REVIEW_OK`
- **F7.1** `kit/REVIEW.md` с разделом «Спека до подписи» и `spec: <путь> @ <пин>` → `--templates` OK; без раздела → FAIL → `F7.1 abschnitt=OK rot=OK`.
- **F7.2** запрос называет SPEC, PASS с её пином нет → `BUDGET_FAIL spec-review`; есть → OK → `F7.2 ohne=FAIL mit=OK`.
- **F7.3** NEEDS_WORK / пин другой версии / коммит пункта после запроса без PASS → FAIL 3/3; evidence этой SPEC в HEAD → WARN → `F7.3 fail=3/3 evidence=WARN`.
- **F7.4** шаблон PROCESS со строкой проверяющего (свежий клон, `claude -p --model claude-opus-5-5`, не субагент) → OK; без неё → FAIL → `F7.4 zeile=OK rot=OK`.
### F8 — `bin/evidence F8 check-verify -- bin/check-verify` → `VERIFY_OPUS_OK`
- **F8.1** статика: 4 стадии `claude-opus-5-5` → мутант с Sonnet в стадии — FAIL → `F8.1 opus=4/4 mutant=rot`.
- **F8.2** живые: `clean` PASS, `red` NEEDS_WORK, `eval` ловит мутант → `F8.2 clean=PASS red=NW eval=1/1`.
- **F8.3** журнал репо: «до» (`wf` = хеш до правки, `tokens`, `ts` раньше коммита правки) и «после» (`wf` = HEAD) → `paar=OK`; «до» без токенов / новее правки → FAIL 2/2 → `F8.3 paar=OK rot=2/2`.
- **F8.4** `evaluator.md` в `docs/archive/`, в `kit/` и `bin/` файла нет, упоминаний вне списка апгрейда и проб нет; апгрейд фикстуры с ним → в архиве запуска → `F8.4 agent=archiv upgrade=archiv`; красная — файл в `kit/`.
- **F8.5** решение гейта: пути воркфлоу и лаунчера не менялись с коммита evidence → `evidence`; правка в копии → `live` → `F8.5 gleich=evidence diff=live`.
### F9 — `bin/evidence F9 gate -- bin/gate-v3.5` → `GATE35_OK`
- **F9.1** фикстура: `docs/drafts/team-lead-spec.md` 8001 знак → FAIL, 8000 → OK → `F9.1 spec=FAIL,OK`.
- **F9.2** `bin/check-docs`: CHANGELOG v3.5 — строка `autoCompactWindow` с источником и парой, вошли 7, сняты 3 → копия без источника — FAIL → `F9.2 feld=1 rein=7 raus=3`.
- **F9.3** шаблон PROCESS и `kit/CLAUDE.md`: слово — главной сессии, боковой чат — вопросы; суд по `REVIEW.md` на Opus → 2/2; копия без фразы — FAIL → `F9.3 docs=2/2`.
- **F9.4** копия клона после `bin/two-tier-upgrade` v3.5: линтов v3.5 в `bin/check-budget` 4, хук пропускает ответвление, `BUDGET_OK`; после v3.4 — 0 и `block` → `F9.4 lints=4,0 hook=pass,block`.
- **F9.5** гейт: маркеры F1–F8 и v3.4, t5 из `bin/two-tier-init` жив; F1/F2 из evidence — пока не менялись пути фичи (мод, хук, чек, шаблоны); красные образцы — в каждом прогоне (отдельного `--self-test` нет): без клона — FAIL, строка пункта с чужим id в evidence — FAIL → `F9.5 leer=OK rot=2/2`.

## Риски
1. **Хук и моды живые в дереве** — правка `spec-gate.mjs`/`mods/**` действует сразу на эту сессию и вкладки оператора. → кандидат в копии, проба на голове транскрипта этой сессии (правило 3, не `pass`), посадка одним коммитом после зелёных проб.
2. **F6.4 красит фикстуры-тимлида** (`CLAUDECODE=1` в этой сессии). → git фикстур роли без переменной до коммита F6.4; прогон `check-harness commit`, `check-kit frozen` до коммита.
3. **`spec-review` на SPEC-v3.5** — PASS с пином `740ff1fda7f2` нет → FAIL до evidence v3.5 в HEAD. → линт садится после evidence F2; корневой `bin/check-budget` после каждого линта.
4. **UNVERIFIED: `/clear`, `/phase` и `ui_attach` в stream-json хоста.** → первая проба хоста: `/handoff status` копии и `/clear`; иначе STOP-SCOPE с цитатой.
5. **UNVERIFIED: процент мода от окна 1 млн или 580 тыс.** → печать `context.window` в статусе F1.3.
6. **Цена:** живых проб на прогон чека ≤ 6; `check-verify` — два полных прогона (до и после правки воркфлоу).

## Отклонения от SPEC и документации
1. Счёт строк прошлых фаз до префиксов (SPEC §3) — из evidence v3.4 этих чеков (дёшево, без живых кругов): `bin/check-harness` F2.x 6, F3.x 4; `bin/check-kit` F9.x 2 (гейт v3.5 его зовёт); после префиксов — 0.
2. `bin/check-gate` судит только `bin/gate-v3.4` (оба остаются): заглушек гейта v3.5 в `make ci` нет — его развилки судят красные образцы F9.5 в самом гейте (SPEC их не требует в CI).
3. Линты выдачи (`planka-early`, `basis-judge`, `spec-paths`) считают SPEC выданной и при evidence этой SPEC в HEAD — §0 называет признаки `issued` и `in_flight`: SPEC-11 копии клона telefon правлена тимлидом после запроса, работа влита слиянием, и без этого признака F9.4 `BUDGET_OK` недостижим (§4: красный `check-budget` после апгрейда — дефект продукта); обе стороны — в F5.1.
4. F2.4 идёт с `SPEC_GATE=shadow`, не `active`: решение хука пишется в журнал и судится по нему, а блок не держит ход хоста вкладки: проба судит решение хука по журналу, не продолжение хода — суд тот же, отличается только эффект на ход.
5. F8.5 — как в SPEC: свежесть evidence F8 в гейте — по воркфлоу и лаунчеру; правка самого `bin/check-verify` после evidence — пересъёмка evidence F8 тем же плечом (так сделано после правки allowlist F8.4).
