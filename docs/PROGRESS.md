# PROGRESS — two-tier-dev, SPEC-v3 «кит v3» (файл исполнителя; потолок 60 строк)

## Голова — 06.10.2026
**Сделано:** сид тимлида, PLAN-v3, архив v2, F1, F2. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** в этой сессии, F1–F9 по PLAN-v3.

## Done
- Сид `49e873c` «Тимлид: seed v3»; `goal-v2.txt` → `docs/archive/goal-v2.txt` (`c39237f`); PLAN-v3 (`c4114c4`).
- Шаг 0b: `docs/archive/PROGRESS-v2.md`, `docs/archive/PLAN-v2.md`, 11 файлов evidence v2 → `docs/archive/evidence-v2/`.

- **F1 Бюджеты**: `bin/check-budget --self-test && bin/check-budget` → `SELFTEST_OK` (42 фикстуры), `BUDGET_OK` на репо и на ките — `docs/evidence/F1-budget-result.txt`. Скиллы v2 `team-lead`, `grilling` → `docs/archive/kit-v2/claude-config/skills/` (отклонение 1 PLAN).

- **F2 Intent, пин, владение**: `bin/check-budget --self-test intent owner` → `INTENT_OK`, `OWNER_OK` (15 фикстур); на репо пин `e5e66199712a` = hash-object, коммит «Тимлид:» один — `49e873c` — `docs/evidence/F2-intent-result.txt`.

## Next — один айтем
1. **F3 CI**: `bin/check-ci v3` → `CI_OK`.

## Open stop — NONE

## Notes
- PLAN-v3 и эта страница написаны в форме шаблонов v3 до F5: шаблоны пишет сам исполнитель, F5 их фиксирует.

## Named, not built
