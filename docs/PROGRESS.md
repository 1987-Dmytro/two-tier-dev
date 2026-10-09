# PROGRESS — two-tier-dev, SPEC-v3.2 «Jev-слой, без /goal» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 09.10.2026, 14:40 — фаза v3.2 идёт
**Сделано:** шаги 0a, 0; F1 `bin/jev`, F2 `spec-gate`, F3 Abide, F5 Toolgate, F4 окружение слоя, F6 handoff, F7 запуск без `/goal`, F8 расход, F9 документы, F10 гейт — все десять фич с чеками и evidence. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** плечо — 09.10, ~14:00 (v3.1: 98 мин на 9 фич, здесь 10), затем `/verify-phase` ~10–20 мин; сдвинуть может стоп по Toolgate или Abide (SPEC §4).

## Done
- Шаг 0a (`5a1913f`): архив v3.1 — `git mv` PROGRESS → `docs/archive/PROGRESS-v3.1.md`, evidence v3.1 → `docs/archive/evidence-v3.1/`, `accept-*.txt` → `docs/archive/evidence-v3/`.
- Шаг 0: `docs/PLAN-v3.2.md`; «до» — `bin/check-harness` на ките v3.1: корень репо `ENV_OK · HARNESS_OK · HOOKS_OK`, t3 `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` — `F4-harness-v3.1-baseline.txt`.
- **F1 `bin/jev`**: `bin/jev --self-test` → `JEV_OK` (фейковый сервер: 19 сторон контракта; живой вызов — HTTP 200, `jev-1.13.0`) — `docs/evidence/F1-jev-result.txt`; журнал расхода — `docs/evidence/jev.jsonl`.
- **F2 `spec-gate`**: `bin/check-harness` → `GATE_HOOK_OK` (13 проб: прямые на фикстурах фазы и два живых `claude -p`; рядом `HARNESS_OK`, `ENV_OK`, `HOOKS_OK`) — `docs/evidence/F2-harness-result.txt`.
- **F3 Abide**: `bin/check-harness` → `ABIDE_OK` (рубрика-фикстура: правка, печатающая секрет фикстуры, — блок act и требование починки в том же ходе, файл починен; чистая — тишина; заметки вместо просьбы компилировать и блока Stop) — `docs/evidence/F3-harness-result.txt`; `abide_rules` ≤ 15 в `check-budget`.
- **F5 Toolgate «только отказ»**: `bin/check-harness` → `TOOLGATE_OK` (политика кита: `jev-1.13.0`, аудит во `/tmp/two-tier-v3`, ledger выкл., без контекста задачи, порог 0,9, force-push — статическое правило; p95 0,56 с; без ключа, без политики и на сроке — тишина; живой force-push — отказ; пары allow и агенты — с хуком) — `docs/evidence/F5-harness-result.txt`; там же все шесть маркеров харнеса.
- **F4 Окружение слоя**: `bin/check-harness` → `ENV_OK` на корне репо и на t3 (шаблон кита: плагинов 6 и `@builtin`, MCP context7, скилл graphify через `--add-dir`; режимы против `pluginConfigs`, живая тень Belay — `shadow`, Steer-or-Queue — `shadow`; пробы «по задаче»: `qs status`, `jevseo doctor`, `bin/check-ui` → `UI_OK`); на t3 все шесть маркеров против «до» `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` — `docs/evidence/F4-harness-result.txt`.
- **F6 handoff**: `bin/check-kit` → `HANDOFF_OK` (строка шаблона 70 %, `/clear`; включён в launch settings кита, режим — `userConfig` мода по умолчанию; `handoffs/` в `.gitignore`; команда установки в выводе `bin/two-tier-init`; `claude plugin validate` — hooks и 18 calls, `claude plugin test` — 8 из 8) — `docs/evidence/F6-kit-result.txt`.
- **F7 Запуск без `/goal`**: `bin/check-budget --templates` → `BUDGET_OK` (шаблон `docs/PROMPT.template.txt`, шаблон GOAL — в архиве, `/goal` в ките — 0; до правок — `BUDGET_FAIL`); апгрейд переносит `docs/GOAL.txt` → `docs/PROMPT.txt` коммитом «Тимлид: …» — `UPGRADE_OK`; t3 — пара стартует из `docs/PROMPT.txt`, шесть маркеров; `bin/check-verify` → `VERIFY_OK` — `docs/evidence/F7-templates-result.txt`.
- **F8 Расход Jev**: `bin/check-spend` → `SPEND_OK` (фикстура журналов — сумма сходится до токена; плечо: вызовов 1617, ~4,2 млн входных токенов, $0,18 ≈ €0,15, без планки; Toolgate — оценка, у остальных — токены журналов) — `docs/evidence/F8-spend-result.txt`.
- **F9 Документы**: `bin/check-docs` → `DOCS_OK` (CHANGELOG v3.2 — 12 строк полей с источником и до/после, `hooks:` и `calls:` модов handoff и compact-adviser; LAUNCH — флаги, стартовый запрос, режимы `spec-gate`, ключ в окружении; README и dev-system — цикл без `/goal`, слой Jev, три судьи) — `docs/evidence/F9-docs-result.txt`.
- **F10 Гейт v3.2**: `bin/gate-v3.2` → `F1 JEV_OK` … `F9 DOCS_OK`, уцелевшие v3.1 `HARNESS_OK`, `HOOKS_OK`, `VERIFY_OK`, `KIT_OK`, `OWNER_OK`, `F10 GATE_OK` (3 мин 47 с); `bin/gate-v3`, `bin/gate-v3.1` — `git mv` в `docs/archive/` — `docs/evidence/F10-gate-result.txt`.

## Next — один айтем
1. **Приёмка фазы**: CI `v3.2` → `CI_OK`; ревью-воркфлоу — блокирующие чинятся; `bin/verify-phase` из свежего клона → `VERDICT: PASS`; финальный `bin/gate-v3.2` после последнего push.

## Open stop — NONE

## Notes
- SessionStart-хук Abide просил скомпилировать рубрику (`new: kit/CLAUDE.md`): по SPEC §1 исполнитель рубрику не компилирует и не правит — `.abide/rubric.json` и общая рубрика `~/.abide/` не тронуты. Тимлиду: проводка Abide в `.claude/launch.settings.json` — без `ABIDE_HOME_DIR`, её SessionStart просит компилировать и общую рубрику (`~/.claude/CLAUDE.md`); обёртка кита `abide.mjs` этого не делает.
- Проба Abide: «правка, печатающая секрет» — прямым вызовом хука на выдуманном `FIXTURE_SECRET`; живую такую правку режут защита модели и классификатор (замеры 09.10), доставку требования в том же ходе показывает живая правка с маркером (PLAN, отклонение 11).
- Toolgate тимлида (`.claude/launch.settings.json`: политика пользователя, контекст задачи, порог 0,85) в этой сессии отказывает правки шаблона кита `kit/.claude/launch.settings.json` — «violates constraint» 0,88–0,90, хотя `kit/.claude/**` разрешён. Тимлиду: внести в `kit/.claude/launch.settings.json` → `pluginConfigs` строку `"handoff@two-tier-mods": {"options": {"threshold": 70, "handoffDir": "handoffs", "autoClear": true, "minTurns": 2, "language": "ru"}}` (сейчас действуют те же значения мода по умолчанию; PLAN, отклонение 12).

## Named, not built
- Апгрейд проекта, уже переведённого `two-tier-upgrade` на v3.x: архив прежних файлов кита — тот же `docs/archive/kit-v2/`, путь занят — файл не тронут (конфликт в отчёте, rc 0); telefon — v2, путь v2 → v3.2 проверен self-test.
- Тимлиду (файлы кита, которые в этой сессии не правятся — PLAN, отклонение 13): `kit/budgets.json` — `goal_chars` → `prompt_chars`, в `owner` — `docs/PROMPT.txt`; `kit/CLAUDE.md` строка 3 — «фаза — `docs/SPEC-<n>.md` и стартовый запрос `docs/PROMPT.txt`», строка 11 — без «выполненный goal». Сузить deny `Edit(./budgets.json)`, `Edit(./CLAUDE.md)` до корня (сейчас накрывают и `kit/`).
