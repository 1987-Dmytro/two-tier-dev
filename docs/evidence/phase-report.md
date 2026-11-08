# Отчёт фазы — docs/SPEC-v3.4.md (код: bin/phase-report, 08.11.2026 10:36)

Коммиты — после merge-base `5a92e48`, без слияний; HEAD `687ed27`. Наблюдение — сырой вывод пробы из строки `F<n>.<k>` evidence. Jev — в тени: его статус ничего не решает.

## Матрица пунктов

| пункт | коммиты | проба | наблюдение | Jev |
|---|---|---|---|---|
| F1.1 | `265eaa4`, `280433b`, `a78782b`, `f981069`, `62f123a`, `b1f2285`, `8daba84`, `c801425`, `126cc83`, `9e9c447`, `3793cc5`, `c5f2aae`, `97d2cbd`, `bcfd10e`, `6527808` | `docs/evidence/F1-check-harness-result.txt` | pass=3/3 block=2/2 · pass по типу: monitor — background:monitor, workflow — background:workflow, shell — background:shell · суд комплекта: subagent, MCP task; п… | подтверждает 0.94 |
| F1.2 | `265eaa4`, `6527808` | `docs/evidence/F1-check-harness-result.txt` | hours=weg block=OK · .claude/spec-gate.json caps {'same_list': 3}; сессия старше 3 ч, неполный комплект — block, журнал platform_cap=8; 12 блоков сессии — block… | подтверждает 0.33 |
| F1.3 | `265eaa4`, `6b089d2`, `4656dea`, `9af7859`, `195bef0`, `6527808` | `docs/evidence/F1-check-harness-result.txt` | fremd=missing eigen=OK · своя — «SPEC_GATE_OK: features 2, items 4, pushed 6e3b09c, verify-ba»; чужие: spec: SPEC-9 — block, близнец spec: SPEC-10 — block, без … | подтверждает 0.94 |
| F1.4 | `265eaa4`, `4656dea`, `6527808` | `docs/evidence/F1-check-harness-result.txt` | stop_tl=OK · §4 с STOP-TL, вопрос и Resume, запушен — stop (STOP-TL); SPEC без §4, STOP_IDS — stop (хук v3.3 — block); без вопроса — block: ««STOP: STOP-TL» has… | подтверждает 0.92 |
| F1.5 | `265eaa4`, `6527808` | `docs/evidence/F1-check-harness-result.txt` | code_tab=10/10 alt=61/78 · входы формы Stop input документации hooks; новый хук: без фона — block; subagent — block; monitor — pass; workflow — pass; shell — pa… | подтверждает 0.97 |
| F2.1 | `280433b`, `544bb57`, `d2b7961`, `97d2cbd`, `bcfd10e`, `80e0e2e`, `189418a` | `docs/evidence/F2-budget-result.txt` | rot=OK gruen=OK · без файла — FAIL: «docs/SPEC-1.md: планок 1, без файла распределения и без «ранняя» — «сборка»: нет docs/evidence/<файл>» → «BUDGET_FAIL plank… | подтверждает 0.96 |
| F2.2 | `6b089d2`, `80e0e2e`, `189418a` | `docs/evidence/F2-budget-result.txt` | ohne=FAIL mit=1 · без строки — «F2: новая фича без строки «Поправка <решение>: слово оператора <дата>» в §0 docs/SPEC-1.md; фич на выдаче 1, сейчас 2, поправок:… | подтверждает 0.98 |
| F2.3 | `80e0e2e`, `189418a` | `docs/evidence/F2-budget-result.txt` | inline=WARN ohne=FAIL · число рядом — «docs/SPEC-1.md: числа коридора в тексте при ключе — korridor.word: 3300: логика судьи — в checks/planken.json»; нет файла… | подтверждает 0.96 |
| F2.4 | `80e0e2e`, `189418a` | `docs/evidence/F2-budget-result.txt` | flaky=OK ohne=block · с меткой, красный — rc 0 «FLAKY bash tests/t.sh rc=3 · решение 388: настенное время»; без метки — rc 1 «x TEST_FAIL bash tests/t.sh rc=3» … | подтверждает 0.92 |
| F3.1 | `280433b`, `97d2cbd`, `bcfd10e`, `6b089d2`, `2ba0dcb`, `0adcfe5` | `docs/evidence/F3-check-kit-result.txt` | verboten=OK offen=OK cap=OK · запрет: без SPEC — rc 1 «commit refused by the kit — rule frozen-paths: src/demo/x.py (модуль demo заморожен (SPEC-1), SPEC-2 его … | подтверждает 0.89 |
| F3.2 | `6b089d2`, `2ba0dcb`, `0adcfe5` | `docs/evidence/F3-check-kit-result.txt` | tl=OK · «Тимлид:» в код — rc 1 «commit refused by the kit — rule frozen-paths: src/demo/t.py (модуль demo заморожен (SPEC-1), SPEC-2 его не открывает). Fix the … | подтверждает 0.83 |
| F3.3 | `2ba0dcb`, `0adcfe5` | `docs/evidence/F3-check-kit-result.txt` | pass=OK offen=OK · паспорт: совпало — rc 0 «PASSPORT_OK модуль=demo src=a3b40aa8e1c2 texte=66155716c486»; деплой — rc 0 «DEPLOY_OK sha=056ffa6 linie=0 rollback=… | подтверждает 0.80 |
| F3.4 | `544bb57`, `cc59bf6`, `c8b6649`, `5acb911`, `2ba0dcb`, `0adcfe5` | `docs/evidence/F3-check-kit-result.txt` | regress=2/2 · REGRESS_OK — rc 0 «rollback: none \| DEPLOY_OK sha=2b5eac9 linie=0 rollback=none» · REGRESS_FAIL — rc 1 «rollback: none \| DEPLOY_FAIL step=regress … | подтверждает 0.82 |
| F3.5 | `6b089d2`, `2ba0dcb`, `0adcfe5` | `docs/evidence/F3-check-kit-result.txt` | telefon=OK · копия клона, SPEC-10; --branch -x — rc 2; без --branch при разошедшейся kit-v3 — rc 1; --branch kit-v3.4 — rc 0 «коммит bac6fdf8: поставлено 36, в … | подтверждает 0.80 |
| F4.1 | `280433b`, `544bb57`, `cc59bf6`, `97d2cbd`, `bcfd10e`, `6b089d2`, `e6c1958`, `598b336` | `docs/evidence/F4-check-kit-result.txt` | zeile=OK fenster_rot=OK · строка отката — первый деплой «rollback: none \| DEPLOY_OK sha=de41e46 linie=1 rollback=none», второй «rollback: make rollback SHA=de41… | подтверждает 0.86 |
| F4.2 | `e6c1958`, `598b336` | `docs/evidence/F4-check-kit-result.txt` | fixturen=54/54 · зелёный звонок — LIVE_OK; 389 один звонок при --n 2 — LIVE_FAIL anrufe=1<2; 390 вопрос об уже названном — LIVE_FAIL x: wiederholt=1; 390 «Wie b… | подтверждает 0.76 |
| F4.3 | `e6c1958`, `598b336` | `docs/evidence/F4-check-kit-result.txt` | rot=OK gruen=OK · rot>0 — rc 1 «CANARY_ROT grund=rot p95=2000 word_max=3000 rot=2 sekunden=0» ['Fixtur Kontrolle: ROT']; S1 rot=1 — rc 1 «CANARY_ROT grund=rot p… | подтверждает 0.83 |
| F4.4 | `e6c1958`, `598b336` | `docs/evidence/F4-check-kit-result.txt` | templates=OK rot=OK · кит — BUDGET_OK, копия без правки — BUDGET_OK · красных 26/26, без красной стороны: нет, снятая фраза названа в FAIL — True · без строки: … | подтверждает 0.70 |
| F5.1 | `6eea826`, `544bb57`, `cc59bf6`, `b2fbce2` | `docs/evidence/F5-check-kit-result.txt` | gleich=OK rot=FAIL · один код — rc 0 «PAIR_OK diff_p50=0 diff_p95=0 basis_p50=1200 neu_p50=1200 basis_p95=1400 neu_p95=1400 n=10», прогоны basis neu basis neu, … | подтверждает 0.73 |
| F5.2 | `7344ceb`, `d49e78e`, `b2fbce2` | `docs/evidence/F5-check-kit-result.txt` | vorlage=OK · звено вендора, «ранняя» — OK planka-source: docs/SPEC-1.md: планок 1, у всех файл ра; звено вендора, pair и файл с PAIR_OK — OK planka-source: docs… | подтверждает 0.67 |
| F5.3 | `502f935`, `1bd2d42`, `d2b7961`, `b2fbce2` | `docs/evidence/F5-check-kit-result.txt` | n=2 fon=7 · 2.1.316: n=2 p50=639 max=1216 fon=5; 2.1.319: n=2 p50=819 max=1422 fon=2 · пара: ≤2.1.316 n=2, ≥2.1.318 n=2 · timeout=0 · лимит 1800 с: max 1422 — д… | подтверждает 0.67 |
| F5.4 | `57dded7`, `7e9b958`, `b2fbce2` | `docs/evidence/F5-check-kit-result.txt` | metriken=3 · фикстура — rc 0 «Кругов до PASS: 2 (F1 2, F2 1; без PASS: F3 — 1)» «Откатов деплоя: 1 из 3» «Поправок объёма: 2»; ещё один NEEDS_WORK — Кругов до P… | подтверждает 0.67 |
| F5.5 | `0dcea2f`, `d49e78e`, `b2fbce2`, `be5c7a5`, `1e31e90` | `docs/evidence/F5-check-kit-result.txt` | fehlt=WARN · ключа нет — rc 0 «WINDOW_WARN seven_day=fehlt — неделя не судится \| WINDOW: start»; только окно 5 ч, 99 % — rc 0 «WINDOW_WARN seven_day=fehlt — нед… | подтверждает 0.77 |
| F6.1 | `502f935`, `280433b`, `1a9ca35`, `10875bd`, `ee7a5a8`, `9af1453`, `9538f7c` | `docs/evidence/F6-check-harness-result.txt` | versionen=3 graph=нет · живьём: VERSIONS cli=2.1.319 app=2.1.317 github=2.1.319; брошенных worktree 13; граф этого репо: графа нет (graphify-out/graph.json) или… | подтверждает 0.64 |
| F6.2 | `10875bd` | `docs/evidence/F6-check-harness-result.txt` | aussen=verboten innen=OK · permissions.blockWritesOutsideWorkingDirectories True · прокси claude -p, dontAsk, allow Write, без --add-dir и настроек пользователя… | подтверждает 0.73 |
| F6.3 | `2705fb5`, `5c7529a`, `4b7c87e`, `d49e78e`, `afdacb5`, `73b56b8`, `7d33807`, `cc59bf6`, `1bd2d42`, `1a9ca35`, `10875bd` | `docs/evidence/F6-check-harness-result.txt` | init=gleich deny=2/2 · прокси claude -p с профилем .claude/launch.settings.json как settings.local, источники как у вкладки, auto: плагинов 5, MCP 0 (нет), скил… | подтверждает 0.74 |
| F6.4 | `1a9ca35`, `10875bd` | `docs/evidence/F6-check-harness-result.txt` | denials=3/3 · входы формы документации hooks, живого отказа нет: событие идёт только на отказ auto mode, не на deny-правило F6.3 · три входа — три строки, без s… | подтверждает 0.73 |
| F7.1 | `687ed27`, `da0f1ad`, `280433b`, `7344ceb`, `0dcea2f`, `d49e78e`, `cc59bf6`, `749c6e9` | `docs/evidence/F7-check-verify-result.txt` | high=voll lint=OK · заглушка: high, 2 мутанта → PASS, в запросе «at least 2 distinct» и шаг 3, minItems 2; low → в запросе только шаги 1–2, minItems 0, «- F2: r… | подтверждает 0.67 |
| F7.2 | `1bd2d42`, `d2b7961`, `749c6e9` | `docs/evidence/F7-check-verify-result.txt` | prior=OK klasse=OK · лаунчер: F1 → args {"features": ["F1"], "prior": {"F1": {"file": "verify-aaaaaaa-F1.txt", "verdict": "NEEDS_WORK", "blocking": ["- **F1.2: … | подтверждает 0.68 |
| F7.3 | `d2b7961`, `749c6e9` | `docs/evidence/F7-check-verify-result.txt` | eval=1/1 · с мутантом (bin/deploy, пауза 0 мс): rc 0, «VERDICT: NEEDS_WORK», «- **F1.2: не подтверждён своим прогоном** — `bin/deploy bad` печатает `health=FAIL… | подтверждает 0.74 |
| F7.4 | `1a9ca35`, `d2b7961`, `749c6e9` | `docs/evidence/F7-check-verify-result.txt` | detached=SKIP · без ветки: rc 0 «GATE_SKIP reason=detached sha=4a796b6» · на ветке, голый скрипт: rc 1 «gate-v3.4: ветка main, HEAD 4a796b6 ⏎ GATE_FAIL reason=n… | подтверждает 0.68 |
| F8.1 | `7344ceb`, `0dcea2f`, `d49e78e`, `1a9ca35`, `acadf13` | `docs/evidence/F8-gate-result.txt` | docs=4 · CHANGELOG: полей с источником и до/после 12, снятых строкой 8, вошло → вышло 14, строки Unreleased и моды в записи; README.md, docs/LAUNCH.md, docs/dev… | подтверждает 0.70 |
| F8.2 | `acadf13` | `docs/evidence/F8-gate-result.txt` | templates=OK · bin/check-budget --templates: rc 0, копия кита без правки rc 0; шаблон SPEC §2–§5 против telefon: строк 55, без пары в ките 0, названных дельт 7 … | подтверждает 0.73 |
| F8.3 | `7344ceb`, `7f32315`, `77aa6c6`, `616ae62`, `76b273e`, `7d33807`, `1a9ca35`, `e145112` | `docs/evidence/F8-gate-result.txt` | deny=OK · claude plugin validate mods/window-guard: rc 0, «Validation passed»; claude plugin test mods/window-guard: rc 0, 38 pass, 0 fail; названных тестов 5 и… | подтверждает 0.68 |
| F8.4 | `7f32315`, `cc59bf6`, `1a9ca35`, `e145112` | `docs/evidence/F8-gate-result.txt` | phase=OK · claude plugin validate mods/phase-start: rc 0, «Validation passed»; claude plugin test mods/phase-start: rc 0, 38 pass, 0 fail; названных тестов 4 из… | подтверждает 0.72 |
| F8.5 | `57dded7`, `7e9b958`, `502f935`, `280433b`, `cc59bf6`, `1a9ca35`, `acadf13` | `docs/evidence/F8-gate-result.txt` | leer=OK telefon=OK · t4 от bin/two-tier-init: файлов кита 56 из 56, core.hooksPath .githooks; маркеров красных 0 ‖ v3.3 F7.3 без модели: t4 — rc 0 «OK abide_rul… | подтверждает 0.72 |
| F9.1 | `9afc3c2`, `e392b3c`, `f117594`, `745481f`, `5c7529a` | `docs/evidence/F9-check-kit-result.txt` | board=2/1/1 nach=1/1/2 · claude plugin test mods/spec-board: rc 0, 24 pass, 0 fail; названных тестов F9.1 4 из 4 | подтверждает 0.76 |
| F9.2 | `9afc3c2`, `e392b3c`, `24e2b67`, `74f59d6`, `e723c71`, `e871243`, `4f938a8`, `f117594`, `745481f`, `5c7529a` | `docs/evidence/F9-check-kit-result.txt` | validate=OK test=24 · claude plugin validate mods/spec-board: rc 0; названных тестов F9.2 3 из 3; модель, сеть и процесс не на git в коде мода — нет; marketplac… | подтверждает 0.68 |

## Списки

- **Пункты без коммитов** (0): нет
- **Коммиты без пункта** (2): `9b9ae69` F9: STOP-INPUT «Leg 3 — вход claude для круга F1 F2 F9»: bin/verify-phase F1 F2 F9 (HEAD 9…; `5944469` Шаг 0: архив фазы v3.3 и план v3.4 — git mv docs/PROGRESS.md в docs/archive/PROGRESS-v3.3-…
- **Пункты без пробы** (0): нет
- Коммиты тимлида в диапазоне: 26

## Судьи коммита (хуки git кита: `commit-msg`, `pre-push`)

Коммитов фазы (git): 98. Суждений в журнале: 171 — прошло 115, отказов 4 (код 4, push 0, abide 0), отклонённых 0, заметок 4, пропусков 48.

- 2026-10-10T10:40:55Z · refuse · code · no-secret-values · docs/evidence/verify-919a729.txt
- 2026-10-10T10:41:14Z · refuse · code · evidence-anonymized · docs/evidence/verify-919a729.txt
- 2026-10-10T11:08:22Z · note · abide · evidence-anonymized (0.64) · docs/evidence/F2-harness-result.txt
- 2026-10-10T11:30:29Z · note · abide · no-secret-values (0.75) · kit/bin/check-harness
- 2026-10-10T12:02:28Z · note · abide · evidence-anonymized (0.59) · docs/evidence/verify-dc87778-F2-F3.txt
- 2026-10-10T12:16:54Z · note · abide · no-secret-values (0.65) · kit/bin/check-harness
- 2026-10-10T13:16:52Z · refuse · code · no-secret-values · docs/evidence/verify-d12c3ad-F2.txt
- 2026-10-10T18:08:55Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/retro-2026-10-10-v3.3.md, docs/STATUS.md, docs/drafts/skills-inputs.md
- 2026-10-10T18:14:35Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/evals-2026-10-10/README.md, claude/evals-2026-10-10/assertions.json, claude/evals-2026-10-10/e4-acceptance-mutation-rounds.md
- 2026-10-10T18:22:13Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/SPEC-v3.3.md, intent/INTENT.md
- 2026-10-10T18:24:26Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/handoff-2026-10-10-telefon-translation.md, docs/STATUS.md
- 2026-10-10T18:29:53Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md, docs/drafts/skills-inputs.md
- 2026-10-10T18:30:04Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-10T18:38:39Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/PROCESS.md, docs/STATUS.md, docs/drafts/jev-seo-cowork.md
- 2026-10-10T18:39:12Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/handoff-2026-10-10-telefon-translation.md
- 2026-10-10T18:42:22Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/PROCESS.md, docs/STATUS.md, docs/drafts/jev-browser-cowork.md
- 2026-10-10T18:42:33Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-10T18:46:59Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/drafts/jev-browser-cowork.md
- 2026-10-10T18:54:59Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-10T19:00:57Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/reconcile-2026-10-10-decision-vs-built.md
- 2026-10-10T19:01:28Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/handoff-2026-10-10-telefon-translation.md, docs/STATUS.md
- 2026-10-10T19:02:27Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/handoff-2026-10-10-telefon-translation.md, docs/STATUS.md, docs/drafts/skills-inputs.md
- 2026-10-10T19:14:59Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/handoff-2026-10-10-telefon-translation.md, claude/observation-2026-10-10-kit-v3.3-transition.md, docs/STATUS.md
- 2026-10-11T05:53:41Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-11T06:12:19Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · claude/observation-2026-10-10-kit-v3.3-transition.md, claude/reconcile-2026-10-10-decision-vs-built.md, docs/STATUS.md
- 2026-10-11T11:15:32Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-14T16:37:13Z · refuse · code · team-lead-files · docs/STATUS.md
- 2026-10-14T16:37:19Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-15T05:40:59Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-15T10:26:44Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-10-15T12:43:26Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/STATUS.md
- 2026-11-05T23:09:05Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · CHANGELOG.md, docs/OFFICIAL-SOURCES.md, docs/drafts/kit-fixes-v3.4.md
- 2026-11-06T13:31:26Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · .claude/launch.settings.json, CHANGELOG.md, docs/PROCESS.md
- 2026-11-06T20:50:44Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · budgets.json, docs/PROCESS.md, docs/SPEC-v3.4.md
- 2026-11-06T21:01:47Z · skip · abide · no rubric or no staged file · —
- 2026-11-07T07:54:37Z · skip · abide · abide check error CHECK_TIMEOUT · CHANGELOG.md, README.md, bin/two-tier-init
- 2026-11-07T09:01:42Z · skip · abide · no rubric or no staged file · —
- 2026-11-07T09:06:14Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/SPEC-v3.4.md, docs/STATUS.md, docs/reviews/V3.4-review.md
- 2026-11-07T10:12:19Z · skip · abide · no rubric or no staged file · —
- 2026-11-07T12:10:42Z · skip · abide · abide check error CHECK_TIMEOUT · CHANGELOG.md, bin/check-docs, docs/archive/mods-limits/.claude-plugin/plugin.json
- 2026-11-07T12:17:54Z · skip · abide · abide check error CHECK_FAILED · kit/bin/check-kit, kit/scripts/deploy.template.sh
- 2026-11-07T12:23:37Z · skip · abide · abide check error CHECK_TIMEOUT · kit/bin/check-kit
- 2026-11-07T15:41:38Z · skip · abide · abide check over 30 s · CHANGELOG.md, Makefile, bin/check-docs
- 2026-11-07T16:23:34Z · skip · abide · abide check over 30 s · .claude/workflows/verify-phase.js, CHANGELOG.md, bin/check-docs
- 2026-11-07T17:16:15Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · .claude/launch.settings.json, budgets.json, docs/PROCESS.md
- 2026-11-07T17:31:31Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/PROCESS.md, docs/SPEC-v3.4.md, docs/STATUS.md
- 2026-11-07T18:10:49Z · skip · abide · abide check error CHECK_TIMEOUT · bin/check-docs, bin/check-verify, kit/bin/check-budget
- 2026-11-07T19:23:23Z · skip · abide · abide check error CHECK_TIMEOUT · docs/evidence/jev.jsonl, docs/evidence/spec-gate.jsonl, kit/bin/check-harness
- 2026-11-07T19:42:43Z · skip · abide · abide check error CHECK_TIMEOUT · docs/evidence/F2-budget-result.txt, docs/evidence/F3-check-kit-result.txt, docs/evidence/F4-check-kit-result.txt
- 2026-11-07T21:04:46Z · skip · abide · abide check error CHECK_TIMEOUT · docs/PROGRESS.md
- 2026-11-07T21:28:58Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/SPEC-v3.4.md, docs/STATUS.md, docs/reviews/V3.4-review.md
- 2026-11-07T21:33:07Z · skip · abide · abide check error TYPESAFE_AI_API_KEY · docs/reviews/V3.4-review.md
- 2026-11-07T21:56:59Z · skip · abide · abide check over 30 s · CHANGELOG.md, bin/check-gate, bin/gate-v3.4
- 2026-11-07T22:25:02Z · skip · abide · abide check error CHECK_TIMEOUT · CHANGELOG.md, docs/evidence/spec-gate.jsonl, kit/bin/check-kit
- 2026-11-08T08:39:27Z · skip · abide · abide check error CHECK_TIMEOUT · docs/PROGRESS.md
- 2026-11-08T08:43:31Z · skip · abide · abide check error CHECK_TIMEOUT · docs/PROGRESS.md

## Пропуски spec-gate

Решений хука: 92 — блоков 15, OK 3, стопов 19, пропусков 60.

- 2026-10-10T09:00:50.193Z · сессия fa7d07c9 · shadow · 9 missing
- 2026-10-10T11:08:03.168Z · сессия fc45f02e · shadow · 8 missing
- 2026-10-10T11:10:48.433Z · сессия b0d0d343 · shadow · 5 missing
- 2026-10-10T11:47:42.109Z · сессия c79fc74f · shadow · 3 missing
- 2026-10-10T13:35:18.954Z · сессия abe5368d · shadow · 2 missing
- 2026-10-10T14:17:08.485Z · сессия 4d76333a · active · background: tasks 1, crons 0
- 2026-10-10T14:44:47.383Z · сессия 4d76333a · active · background: tasks 1, crons 0
- 2026-10-10T14:53:25.209Z · сессия 4d76333a · active · background: tasks 1, crons 0
- 2026-10-10T15:21:35.597Z · сессия 235e83a5 · active · background: tasks 3, crons 0
- 2026-10-10T15:22:35.428Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T15:45:20.002Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T15:50:05.315Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T16:10:53.686Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T16:14:11.912Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T16:26:23.189Z · сессия 235e83a5 · active · background: tasks 2, crons 0
- 2026-10-10T16:39:23.593Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T16:47:56.743Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-10-10T17:03:28.441Z · сессия 235e83a5 · active · background: tasks 1, crons 0
- 2026-11-06T14:47:37.347Z · сессия cf839055 · active · background:shell
- 2026-11-06T15:16:58.054Z · сессия cf839055 · active · background:shell,workflow
- 2026-11-06T15:19:29.346Z · сессия cf839055 · active · background:shell,workflow
- 2026-11-06T16:52:06.729Z · сессия cf839055 · active · background:workflow
- 2026-11-06T18:52:01.575Z · сессия cf839055 · active · background:shell
- 2026-11-06T19:18:40.398Z · сессия cf839055 · active · background:shell
- 2026-11-06T19:25:39.286Z · сессия cf839055 · active · background:shell
- 2026-11-06T19:34:04.206Z · сессия cf839055 · active · background:shell
- 2026-11-06T20:07:43.984Z · сессия cf839055 · active · background:shell
- 2026-11-06T20:08:25.891Z · сессия cf839055 · active · background:shell
- 2026-11-06T20:52:45.843Z · сессия cf839055 · active · background:shell
- 2026-11-07T07:35:31.982Z · сессия cf839055 · active · background:shell
- 2026-11-07T07:39:42.628Z · сессия cf839055 · active · background:shell
- 2026-11-07T07:46:35.600Z · сессия cf839055 · active · background:shell
- 2026-11-07T07:48:42.991Z · сессия cf839055 · active · background:shell
- 2026-11-07T07:56:33.686Z · сессия cf839055 · active · background:shell,workflow
- 2026-11-07T08:32:48.257Z · сессия cf839055 · active · background:shell
- 2026-11-07T08:48:48.600Z · сессия cf839055 · active · background:shell
- 2026-11-07T09:19:07.427Z · сессия cf839055 · active · background:shell,workflow
- 2026-11-07T09:35:23.137Z · сессия cf839055 · active · background:workflow
- 2026-11-07T09:47:09.215Z · сессия cf839055 · active · background:shell
- 2026-11-07T09:50:45.343Z · сессия cf839055 · active · background:shell
- 2026-11-07T09:52:58.137Z · сессия cf839055 · active · background:shell
- 2026-11-07T09:55:33.850Z · сессия cf839055 · active · background:shell
- 2026-11-07T09:58:20.284Z · сессия cf839055 · active · background:shell
- 2026-11-07T10:14:44.353Z · сессия cf839055 · active · background:workflow
- 2026-11-07T12:29:08.245Z · сессия cf839055 · active · background:shell,workflow
- 2026-11-07T14:17:37.602Z · сессия cf839055 · active · background:workflow
- 2026-11-07T18:11:48.468Z · сессия 298cb691 · active · background:shell,workflow
- 2026-11-07T18:15:09.489Z · сессия 298cb691 · active · background:shell,workflow
- 2026-11-07T19:10:06.093Z · сессия 298cb691 · active · background:shell
- 2026-11-07T19:11:36.027Z · сессия 298cb691 · active · background:shell
- 2026-11-07T19:24:19.684Z · сессия 298cb691 · active · background:shell
- 2026-11-07T19:43:31.156Z · сессия 298cb691 · active · background:shell
- 2026-11-07T20:02:33.300Z · сессия 298cb691 · active · background:shell
- 2026-11-07T20:27:22.497Z · сессия 298cb691 · active · background:shell
- 2026-11-07T21:08:07.836Z · сессия 298cb691 · active · background:shell
- 2026-11-07T22:02:21.220Z · сессия 298cb691 · active · background:shell,workflow
- 2026-11-07T22:07:19.005Z · сессия 298cb691 · active · background:workflow
- 2026-11-08T09:00:13.054Z · сессия 298cb691 · active · background:shell
- 2026-11-08T09:00:20.947Z · сессия 298cb691 · active · background:shell
- 2026-11-08T09:00:44.791Z · сессия 298cb691 · active · background:shell

## Метрики ретро

- Кругов до PASS: 2 (F1 2, F2 1, F3 1, F4 1, F5 1, F6 1, F7 1, F8 1, F9 1)
- Откатов деплоя: 0 из 0
- Поправок объёма: 4

## Jev в тени

Вызов: bin/jev rc 0, вопросов 38. Статусы: подтверждает 38.
