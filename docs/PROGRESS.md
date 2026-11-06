# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 1, шаг 0
**Сделано:** шаг 0: PROGRESS и evidence v3.3 — в архиве, `docs/PLAN-v3.4.md` с пробой обеих сторон на все 36 пунктов. **Следующий шаг оператора:** нет — плечо 1 идёт (F1 → F2 → F3 → F4). **Когда закончим:** плечо 1 — строкой `STOP: STOP-TL «Leg 1»` в этом файле.

## Done
- Шаг 0: `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.

## Next — один айтем
1. **F1 Spec-gate im Code-Tab**: `bin/check-harness items` → `GATE_HOOK_OK`.

## Open stop — NONE

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Архив evidence v3.3 сверх запроса (как `c3ff68d` в v3.3): старый хук засчитал бы `F4-verify-result.txt` и вердикты v3.3 пунктам v3.4.
- `make ci` на Mac до F5.5 красный по `WINDOW_FAIL` (нет ключа `five_hour`): `CI_OK` считается по остальным целям (SPEC §4).

## Named, not built
- Пока нет.
