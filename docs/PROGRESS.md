# PROGRESS — two-tier-dev, SPEC-v3.3 «судья на заявлении» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 10.10.2026, 11:31
**Сделано:** шаги 0a, 0b; F1 и F2 — пробы обеих сторон, `ITEMS_OK`, `GATE_HOOK_OK`, `COMMIT_OK`; судьи коммита кита включены в этом клоне. Идут F3–F7. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** 10.10, ~14:00 — стройка, один круг `/verify-phase`, гейт.

## Done
- Шаг 0a (`c3ff68d`): архив v3.2 — `git mv` PROGRESS → `docs/archive/PROGRESS-v3.2.md`, evidence v3.2 → `docs/archive/evidence-v3.2/`.
- Шаг 0b (`e90854b`): `docs/PLAN-v3.3.md` — проба каждого пункта обеих сторон, порядок, риски.
- **F1 Готово по пунктам** (`7ea9fed`): `bin/check-harness items` → `ITEMS_OK`, `GATE_HOOK_OK` — `docs/evidence/F1-harness-result.txt`.
- **F2 Правила на коммит** (`dadceca`): `bin/check-harness commit` → `COMMIT_OK` — `docs/evidence/F2-harness-result.txt`; `git config core.hooksPath kit/.githooks` в этом клоне.

## Next — один айтем
1. **F3 Окружение по событиям**: `bin/check-harness env` на проекте из кита и в корне → `ENV_OK`.

## Open stop — NONE

## Notes
- Старт сессии — 10.10, 10:48 (Claude Code 2.1.296). Стартовый контекст (S2) на `0b6ff06`: `Read first` — SPEC 21 052 + PROGRESS 7 758 + PROCESS 11 979 знаков, `CLAUDE.md` 2 873 — итого 43 662 из 50 000; стартовый запрос — 3 985.
- Тимлиду на приёмке, корневой `budgets.json` (defaults): `abide_rules` 15 → 8; новые ключи `spec_block_chars` 900, `window_five_hour_pct` 40, `window_seven_day_pct` 85, `window_repair_pct` 70 — до этого `bin/check-budget` берёт их из `kit/budgets.json` с WARN, `bin/check-kit` называет дельту.
- Тимлиду, `docs/PROCESS.md`: строка запуска — префикс `bin/check-window && ` (F5.1; обход — `bin/check-window --override && …`).
- Развилки (простейшее прочтение, PLAN — отклонения 1–5): блок фичи — новым ключом `spec_block_chars`; место чтения пункта — лексически; строка §3 «Вне объёма» судьи не требует; Jev ушёл из `spec-gate` целиком (вопрос STOP и голова — кодом); `abide check` — по staged-патчу (`--diff`).
- Развилки F2: журнал судей — `docs/evidence/commit-judge.jsonl` (решение, правило, файлы, хэш диффа; без текста и сообщения); push с удалением ветки — не force-push, проходит; в этом клоне `core.hooksPath kit/.githooks` (раскладка кита), в проекте — `.githooks`.

## Named, not built
- (пусто)
