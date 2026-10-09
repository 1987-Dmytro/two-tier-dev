# PROGRESS — two-tier-dev, SPEC-v3.2 «Jev-слой, без /goal» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 09.10.2026, 14:35 — фаза v3.2: приёмка после ревью
**Сделано:** шаги 0a, 0; F1–F5, F8, F9 закрыты, чеки прогнаны в этой сессии после ревью (воркфлоу: 5 областей, 17 агентов; `/verify-phase` на `27946c8` — `NEEDS_WORK`, его блокирующие разобраны). F6 и F7 — код, шаблоны и чеки готовы, но в ките нет четырёх строк, правку которых в этой сессии отказывают deny и Toolgate тимлида; чеки F6 и F7 теперь честно красные, F10 ждёт их же. **Следующий шаг оператора:** нет — идёт `/verify-phase` нового HEAD. **Когда закончим:** приёмка — ~20 мин; затем стоп STOP-INPUT на правки кита, если `/verify-phase` не найдёт другого.

## Done
- Шаг 0a (`5a1913f`): архив v3.1 — `git mv` PROGRESS → `docs/archive/PROGRESS-v3.1.md`, evidence v3.1 → `docs/archive/evidence-v3.1/`, `accept-*.txt` → `docs/archive/evidence-v3/`.
- Шаг 0: `docs/PLAN-v3.2.md`; «до» — `bin/check-harness` на ките v3.1: корень репо `ENV_OK · HARNESS_OK · HOOKS_OK`, t3 `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` — `F4-harness-v3.1-baseline.txt`.
- **F1 `bin/jev`**: `bin/jev --self-test` → `JEV_OK` (фейковый сервер: 22 стороны контракта, в том числе ответ не той модели — rc 3 и ключ, эхом в теле ошибки, — скрыт; живой вызов — HTTP 200, `jev-1.13.0`) — `docs/evidence/F1-jev-result.txt`; журнал расхода — `docs/evidence/jev.jsonl`.
- **F2 `spec-gate`**: `bin/check-harness` → `GATE_HOOK_OK` (19 проб: строка STOP отпускает ход один раз — и правленая, и пунктом списка; голова PROGRESS — против коммита до сессии; капы только смягчают блок; перенос кода в evidence после вердикта не проходит; два живых `claude -p`) — `docs/evidence/F2-harness-result.txt`.
- **F3 Abide**: `bin/check-harness` → `ABIDE_OK` (правка, печатающая секрет фикстуры, — блок act и требование починки; живая — в том же ходе, судят только хуки кита; чистая — тишина; блок Stop — заметка; `prompt` и `transcript_path` до Abide не доходят) — `docs/evidence/F3-harness-result.txt`; `abide_rules` ≤ 15.
- **F5 Toolgate «только отказ»**: `bin/check-harness` → `TOOLGATE_OK` (`jev-1.13.0`, аудит во `/tmp/two-tier-v3`, ключ — только из окружения; p95 0,71 с; без ключа, без политики, на сроке и на `ask` — тишина; force-push — статическое правило; живой — отказ) — `docs/evidence/F5-harness-result.txt`.
- **F4 Окружение слоя**: `bin/check-harness` → `ENV_OK` на корне и на t3, у t3 все шесть маркеров против «до» `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` — `docs/evidence/F4-harness-result.txt`.
- **F8 Расход Jev**: `bin/check-spend` → `SPEND_OK` (фикстура сходится до токена, своих фикстур не оставляет; плечо: вызовов 3991, ~9,6 млн входных токенов, $0,40 ≈ €0,35, из них Toolgate тимлида на этой сессии — 2840 вызовов, оценка) — `docs/evidence/F8-spend-result.txt`.
- **F9 Документы**: `bin/check-docs` → `DOCS_OK` (CHANGELOG v3.2 — 12 строк полей; LAUNCH — каждый флаг строки и `--` перед запросом, режимы `spec-gate`, ключ в окружении) — `docs/evidence/F9-docs-result.txt`.

## Open — ждут правок кита
- **F6 handoff**: `bin/check-kit` → `HANDOFF_FAIL`: в `kit/.claude/launch.settings.json` нет `pluginConfigs` мода (всё остальное F6 — OK) — `docs/evidence/F6-kit-result.txt`.
- **F7 Запуск без `/goal`**: `bin/check-budget --templates` → `BUDGET_FAIL` `kit-prompt`: `kit/budgets.json` — `goal_chars` и `docs/GOAL.txt` в owner, `kit/CLAUDE.md` строки 3 и 11; шаблоны, `--` перед запросом, `UPGRADE_OK`, пара t3 из `docs/PROMPT.txt`, `VERIFY_OK` — OK — `docs/evidence/F7-templates-result.txt`.
- **F10 Гейт v3.2**: `bin/gate-v3.2` — F6 и F7 красные, пока нет правок.

## Next — один айтем
1. **Приёмка**: push, `bin/verify-phase` из свежего клона; блокирующие, кроме правок кита, — чинятся; затем стоп STOP-INPUT с командами правок.

## Open stop — NONE

## Notes
- SessionStart-хук Abide просил скомпилировать рубрику (`new: kit/CLAUDE.md`): по SPEC §1 исполнитель рубрику не компилирует и не правит — `.abide/rubric.json` и `~/.abide/` не тронуты.
- Проба Abide «правка, печатающая секрет» — прямым вызовом хука на выдуманном `FIXTURE_SECRET` (PLAN, отклонение 11).
- Toolgate тимлида (`.claude/launch.settings.json`: политика пользователя, контекст задачи, порог 0,85) отказывает правки шаблона кита `kit/.claude/launch.settings.json` (0,88–0,90), правку `kit/budgets.json` оболочкой (0,92–0,93) и даже проверку команд правок на клоне во `/tmp` (0,93); deny `Edit(./budgets.json)`, `Edit(./CLAUDE.md)` накрывают и `kit/`. Не повторял — PLAN, отклонения 12, 13.
- Строка запуска этого репо (`docs/PROCESS.md`, файл тимлида): стартовый запрос после `--add-dir /tmp/two-tier-v3` забирает сам `--add-dir` (замер: `claude -p --add-dir <каталог> "<запрос>"` — «Input must be provided»; с `--` — ответ) — поэтому запрос фазы вставляли вручную. Шаблон кита — уже с `--`.
- `git add -A` в фикстурах во `/tmp` у `bin/check-verify`, `kit/bin/two-tier-upgrade`, `kit/bin/check-budget` — код v3.1, не тронут (правка — точечная); своё — по точным путям.

## Named, not built
- Апгрейд проекта, уже переведённого `two-tier-upgrade` на v3.x: путь архива `docs/archive/kit-v2/` занят — конфликт в отчёте, rc 0; путь v2 → v3.2 проверен self-test.
- `spec-gate`: строка STOP внутри блока кода считается строкой; новая строка STOP с теми же первыми 60 знаками, что у отпущенной, — уже не новая.
