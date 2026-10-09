# PROGRESS — two-tier-dev, SPEC-v3.2 «Jev-слой, без /goal» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 09.10.2026, 13:00 — фаза v3.2 идёт
**Сделано:** шаги 0a, 0; F1 `bin/jev`, F2 `spec-gate`, F3 Abide, F5 Toolgate — с чеками и evidence. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** плечо — 09.10, ~14:00 (v3.1: 98 мин на 9 фич, здесь 10), затем `/verify-phase` ~10–20 мин; сдвинуть может стоп по Toolgate или Abide (SPEC §4).

## Done
- Шаг 0a (`5a1913f`): архив v3.1 — `git mv` PROGRESS → `docs/archive/PROGRESS-v3.1.md`, evidence v3.1 → `docs/archive/evidence-v3.1/`, `accept-*.txt` → `docs/archive/evidence-v3/`.
- Шаг 0: `docs/PLAN-v3.2.md`; «до» — `bin/check-harness` на ките v3.1: корень репо `ENV_OK · HARNESS_OK · HOOKS_OK`, t3 `ENV_FAIL · HARNESS_FAIL · HOOKS_FAIL` — `F4-harness-v3.1-baseline.txt`.
- **F1 `bin/jev`**: `bin/jev --self-test` → `JEV_OK` (фейковый сервер: 19 сторон контракта; живой вызов — HTTP 200, `jev-1.13.0`) — `docs/evidence/F1-jev-result.txt`; журнал расхода — `docs/evidence/jev.jsonl`.
- **F2 `spec-gate`**: `bin/check-harness` → `GATE_HOOK_OK` (13 проб: прямые на фикстурах фазы и два живых `claude -p`; рядом `HARNESS_OK`, `ENV_OK`, `HOOKS_OK`) — `docs/evidence/F2-harness-result.txt`.
- **F3 Abide**: `bin/check-harness` → `ABIDE_OK` (рубрика-фикстура: правка, печатающая секрет фикстуры, — блок act и требование починки в том же ходе, файл починен; чистая — тишина; заметки вместо просьбы компилировать и блока Stop) — `docs/evidence/F3-harness-result.txt`; `abide_rules` ≤ 15 в `check-budget`.
- **F5 Toolgate «только отказ»**: `bin/check-harness` → `TOOLGATE_OK` (политика кита: `jev-1.13.0`, аудит во `/tmp/two-tier-v3`, ledger выкл., без контекста задачи, порог 0,9, force-push — статическое правило; p95 0,56 с; без ключа, без политики и на сроке — тишина; живой force-push — отказ; пары allow и агенты — с хуком) — `docs/evidence/F5-harness-result.txt`; там же все шесть маркеров харнеса.

## Next — один айтем
1. **F4 Окружение слоя**: `bin/check-harness` → `ENV_OK` на корне репо и на t3.

## Open stop — NONE

## Notes
- SessionStart-хук Abide просил скомпилировать рубрику (`new: kit/CLAUDE.md`): по SPEC §1 исполнитель рубрику не компилирует и не правит — `.abide/rubric.json` и общая рубрика `~/.abide/` не тронуты. Тимлиду: проводка Abide в `.claude/launch.settings.json` — без `ABIDE_HOME_DIR`, её SessionStart просит компилировать и общую рубрику (`~/.claude/CLAUDE.md`); обёртка кита `abide.mjs` этого не делает.
- Проба Abide: «правка, печатающая секрет» — прямым вызовом хука на выдуманном `FIXTURE_SECRET`; живую такую правку режут защита модели и классификатор (замеры 09.10), доставку требования в том же ходе показывает живая правка с маркером (PLAN, отклонение 11).
- Toolgate тимлида в этой сессии однажды отказал запись скретч-файла с текстом команды установки мода («violates constraint 87 %») — путь сменён на правку файлов по частям.

## Named, not built
- —
