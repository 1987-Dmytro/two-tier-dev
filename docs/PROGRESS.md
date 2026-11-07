# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 2: стройка и ревью закрыты, живые прогоны ждут входа
**Сделано:** плечо 1 и слово на плечо 2 (`STOP-TL «Leg 1»` снят 07.11). F5, F6, F7, F8 и пункты PLAN F3.4, F2.1 закоммичены и запушены; ревью четырьмя независимыми проверяющими (42 находки, 14 блокирующих) и `/code-review` (10) разобраны: блокирующие починены, кроме evidence F6 и пока не закрытой F5.3 (ниже). Без модели зелёные и сняты: `bin/check-budget` (`--lints`, `--templates`), `bin/check-kit` (`FROZEN_OK`, `FENSTER_OK`, `PAAR_OK`), `bin/check-docs`, `bin/check-gate`; evidence F2–F5 — этого кода, F5.3 `offen`. **Не проверено на финальном коде:** `bin/check-verify`, `bin/gate-v3.4`, голый `bin/check-harness`, `--desktop`, круги F5–F8: вход CLI истёк.
**Следующий шаг оператора:** `STOP-INPUT` ниже — решение по реестру, команды модов; тимлиду — строки профиля и таблицы. Вход CLI дан 07.11.
**Когда закончим:** evidence F1, F6, F7, F8, круги `F5 F7` и `F6 F8`, отчёт фазы, `bin/gate-v3.4`, `make ci` — затем `STOP-TL «Leg 2»`.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`, `195bef0`, `4656dea`, `6b089d2`): `bin/check-harness items` → `GATE_HOOK_OK` — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`, `80e0e2e`, `6b089d2`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`, `2ba0dcb`, `6b089d2`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`, `e6c1958`, `6b089d2`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.
- **F5 Paar & Metriken** (`b2fbce2`, `d2b7961`, `cc59bf6`): `bin/check-kit paar` → `PAAR_OK`, F5.3 `offen` до второго круга на ≥ 2.1.318 — `docs/evidence/F5-check-kit-result.txt`.
- **F6 Desktop** (`10875bd`, `1a9ca35`, `cc59bf6`), **F7 Risk & Evals** (`749c6e9`, `d2b7961`, `cc59bf6`), **F8 Dokumente, Mods & Gate** (`e145112`, `acadf13`, `1a9ca35`, `cc59bf6`): код — да; evidence — после входа. PLAN «К плечу 2»: F3.4 (`5acb911`, `c8b6649`), F2.1 и F5.5 (`b2fbce2`, `d2b7961`).

## Next — один айтем
1. После входа: голый `bin/check-harness` и `--desktop`, evidence F1, F6, F7, F8; круги `F5 F7` и `F6 F8`; `bin/phase-report`, `bin/gate-v3.4`, `make ci`; `STOP-TL «Leg 2»`.

## Open stop — STOP-INPUT «Leg 2 — установка модов и профиль тимлида»
STOP: STOP-INPUT «Leg 2 — установка модов и профиль тимлида» — вход CLI дан, `limits` снят у пользователя; ждут marketplace update, установка `window-guard`, `phase-start`, профиль тимлида и решение о модах.
Вопрос оператору: остальные пункты ниже сделаны, моды в профиле кита — `true` или `false`? Удобнее одним сообщением с Resume: каждая команда в чате — новый ход.
Resume: Продолжай по SPEC-v3.4 с evidence F1, F6, F7, F8: команды модов выполнены, профиль поправлен, моды в профиле кита — true.
**Оператору, по порядку** (скрипты этого не делают: правило 4):
1. `claude auth login` — сделано 07.11.
2. `claude plugin uninstall limits@two-tier-mods --scope user` — сделано 07.11; затем `claude plugin marketplace update two-tier-mods`, затем `claude plugin install window-guard@two-tier-mods --scope user` и `claude plugin install phase-start@two-tier-mods --scope user`. Записи уровня user у обоих модов уже есть (побочный эффект, Notes), `enabledPlugins` — ещё нет.
3. После правки тимлида: `cp .claude/launch.settings.json .claude/settings.local.json`, новая сессия вкладки.
**Тимлиду, файлы его:**
- `.claude/launch.settings.json`: `limits@two-tier-mods` → `false`, добавить `window-guard@two-tier-mods` и `phase-start@two-tier-mods` → `true`; в `skillOverrides` — `"graphify": "off"`, `"anthropic-skills:artifact-emulator": "off"` (или строка таблицы).
- `docs/PROCESS.md`: строку `limits` → две строки, как `kit/docs/PROCESS.template.md:23-24`; список `enabledPlugins` в профиле; строка `graphify`.
- Слово одной строкой: F7.2 — класс и счёт второй строкой вердикта, в SPEC первой; F6.1 — `graph=нет` на клоне без графа, в SPEC `graph=OK`; F6.3 — нет файла профиля = `WARN`; F5.2 — звено вендора судится по слову «вендор» (в 3 SPEC telefon его нет ни в одной из 20 строк посадки); F7.1 — считать ли `LIVE_OK` и `make deploy` деплоем на линию (в 7 SPEC telefon токена нет); SPEC §5 (5) «45 %» устарел после 396; `docs/evals/` и `bin/check-gate` сверх запроса; `docs/README.md` ещё называет v3.3 текущей.

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Архив evidence v3.3 сверх запроса (как `c3ff68d` в v3.3): старый хук засчитал бы `F4-verify-result.txt` и вердикты v3.3 пунктам v3.4.
- Слово оператора 06.11: окно 5 ч отменено тарифом — снято из `bin/check-window`, порогов кита, проб и документов; неделя судится одна, `make ci` зелёный целиком. Ещё называют окно файлы тимлида: корневой `budgets.json` (чек терпит два ключа), `docs/PROCESS.md`, SPEC §4 и F5.5. F5.5 в плече 2 — `WINDOW_WARN seven_day=fehlt`. Второе слово: `verify-phase` обязательна.
- Замер на этой вкладке (CLI 2.1.316): фоновый шелл — `pass background:shell`; фоновый подагент — `block`, 9 пунктов; ложных блоков — 0.
- Развилка F2.1: на самой SPEC-v3.4 три строки посадки без файла и n, p50/p95. SPEC §1 говорит «красная до выдачи»: до выдачи (HEAD на коммите запроса или SPEC правлена после него) — FAIL, выданная и идущая — `WARN planka-source`; красная сторона — на фикстурах. Тимлиду: пометить строки «ранняя» или дать файлы.
- Развилка F1.5: «10 концов хода» — реплей точной формы Stop input на фикстуре плюс живые решения этой вкладки в журнале; живой прогон вкладки на фикстуре — гейт оператора §5 (1).
- Журнал telefon: 61/78 — срез ретро (91 решение, 13 стопов, 12 cap-time, до 20:33Z); по всем 03–05.11 — 66/83, чек печатает оба.
- Слово оператора 07.11: graphify доделать и встроить в кит — `.githooks/post-commit` (`graphify update .` в фоне, если граф есть: AST, без модели и сети, только `graphify-out/`), первая сборка в `bin/two-tier-init`, строки отчёта апгрейда, `HARNESS_WARN graph-age` в `bin/check-harness`, `bin/check-kit graph` → `GRAPH_OK`. Вход Claude Code истёк посреди прогона (`OAuth session expired`) — оператор вошёл заново.
- Слово оператора 07.11: разработка — в приложении (вкладка Code, движок 2.1.317 приложения), CLI на PATH зовут только скрипты кита (`verify-phase`, пары `check-harness`, `check-window`); оператор обновил CLI до 2.1.319, 2.1.316 остался на диске. Автообновление в ките — сверка версий CLI, приложения и последней с командой `claude update` (F6.1), скрипты ничего не ставят.
- Решение 397: живой abide в разделе commit харнеса — `COMMIT_WARN` с числами, FAIL — неверный ответ судьи. Развилка: таймаут или ошибка abide на печати ключа — не ответ судьи, а пропуск (механизм пропуска верен): WARN «печать ключа без ответа», не FAIL; FAIL — судья ответил и не отказал.
- Круг F1 на `62f123a` (CLI 2.1.319) — 827 с, 167 161 токен, PASS. Названо кругом: `caps.same_list = 0` делает из блока pass (файл тимлида); `monitor`/`shell` со статусом completed отпускает ход — буква F1.1; `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP=-5` в журнале — косметика.
- Решение 396 (`7c34be5`): голый `bin/check-harness` на нём — `OK run2: system/init = таблица`, `HARNESS_OK`, `HOOKS_OK`, `GATE_HOOK_OK`, `ITEMS_OK`, `COMMIT_OK`, красный один `jev-browser`; вывод — `docs/evidence/F1-check-harness-result.txt`.
- Тимлиду: `bin/check-ui` пинит `jev-browser@0.1.2`, а его `playwright ^1.63.0` плавает: ревизия Chromium зависит от кэша npx под /tmp и может уехать после чистки /tmp. Совет пакета `npx playwright install chromium` ставит другую ревизию: так вышло в этот раз. `frozen.json` — в `owner` корня на приёмке.
- `bin/check-harness env` на этой вкладке → `ENV_FAIL` не от правок плеча: таблица `docs/PROCESS.md` (файл тимлида) расходится с профилем v3.4 (ponytail, pr-review-toolkit, pyright-lsp — «да», сняты по SPEC §1; `limits` — «нет», включён в launch settings; скилл graphify — «да», не ставится), и нет Chromium для Playwright в домашнем кэше (`bin/check-ui`). PROCESS (g): таблицу правит тимлид, установку — оператор.
- Время плеча 1: стройка F1–F4 — 35 мин (15:38–16:13); мутации, ревью и починка — до 20:46; круг `verify-phase` на `be5c7a5`: F1 F2 F3 — 1223 с, 338 582 токена, F4 — 647 с, 157 032 токена (лимит 1800 с).
- Мутации и ревью плеча 1: 151 мутант, 81 выжил; подтверждённых находок 8. Закрыты правкой или пробой; что сознательно оставлено — `docs/PLAN-v3.4.md`, «Итог мутаций и ревью».
- `/code-review` диффа плеча — не починено, названо (`docs/PLAN-v3.4.md`, тот же раздел): F1.5 `code_tab=10/10` — реплей формы Stop input и журнал вкладки, живой прогон — гейт оператора; `shell` или `monitor`, который не кончится, отпускает ход — буква F1.1; `bin/check-live` не режет журнал по времени — срез делает проект, как в образце.
- Ревью плеча 2 (четыре независимых ревьюера с воспроизведением F5–F8): 42 находки, 14 блокирующих; 12 починены с красной стороной, 2 — evidence F5 и F6 (F5 — следующий круг, F6 — вход тимлида). Мутанты правок: A 30/30, C 58/58, D и три финальной строки гейта убиты, кроме метки (ai) — эквивалент; B из 35 выжили: `say` в `bin/check-docs` (чек сам себя не судит) и `--no-session-persistence` (сторона только живая). Названо: `/phase resume` не ловит развилку без `<…>` и `|`; `/phase halt` после переезда в worktree пишет в стартовый каталог, снимать там.
- Развилка F6.3 (SPEC не закрыл): файла профиля вкладки нет — `HARNESS_WARN tab-profile`, не красный: в свежем клоне `bin/verify-phase` его нет; иной по смыслу — красный. Кит файл не кладёт, шаг печатает `bin/two-tier-init`, называет LAUNCH. Выбор вкладки «всегда разрешать» пишет правила в этот файл: тогда красный до новой копии (не измерено).
- F6.3 MCP шире предложенного ревьюером: на 3 из 5 настоящих init `ref` и `blockscout` — `pending`; судится только «да» со статусом не connected и не pending. Остаток: «да», застрявший в `pending`, идёт в строку вкладки.
- F5.3: упавший запуск и таймаут — не замер; прогон с обрезанным файлом итога считается: секунды настоящие, сигнал сбоя — строка «вердикта нет».
- F7.2: класс и счёт второй строкой вердикта, в SPEC — первой; первая должна быть ровно `VERDICT: …` для `bin/verify-phase`, `bin/phase-report` и spec-gate. Ждёт слова тимлида. F7.1: risk-tier считает только токен `DEPLOY_LINIE=1|linie=1`, в 7 SPEC клона telefon его 0 строк: вопрос тимлиду.
- `/code-review` диффа плеча 2 (`a78782b..1bd2d42`, high, `kit/REVIEW.md`): 10 находок, 9 починены со стороной и мутантом (13 из 13 убиты); названа одна — записи в реестр плагинов через CLI, ниже.
- **Побочный эффект, оператору (правило 4, C4):** вложенный `claude -p` с включёнными модами сам дописывает `~/.claude/plugins/installed_plugins.json`: 165 600 → 197 914 байт за сессию; записи уровня user у `window-guard` и `phase-start` появились от прогона строителя F8, записи уровня local с путями `/tmp` — от прогонов с профилем (`handoff` — 65 до работы, 78 после). `enabledPlugins` в `~/.claude/settings.json` не менялся. Скрипты кита туда не пишут, пишет CLI; откат — команда уровня пользователя, не моя.

## Named, not built
- Из круга `verify-phase`: F1.1 тип фона сравнивается точно (`Monitor` → block); F1.2 `caps.same_list` 0 и 1 ведут себя странно — значение вне нормы в файле тимлида; F2.1 файл из пробелов и симлинк наружу считаются непустыми; F3.1 `F1.1 : x` с пробелом перед двоеточием проходит как id; F3.4 `DEPLOY_CMD` с `exit N` кончает деплой без строки `DEPLOY_FAIL`, `DEPLOY_OK` нет; F4.2 нечисловой и отрицательный `latency_ms` не красят; F4.3 медленный живой SMTP растягивает процесс, вердикт и код те же.
