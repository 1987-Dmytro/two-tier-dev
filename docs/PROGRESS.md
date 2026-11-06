# PROGRESS — two-tier-dev, SPEC-v3.4 «кит под вкладкой Code» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — плечо 1, F1–F4 построены
**Сделано:** шаг 0 и F1–F4: судья конца хода, линты, замок и паспорт, окно и канарейка; идут мутации и ревью диффа до `bin/verify-phase`. **Следующий шаг оператора:** нет — плечо 1 идёт. **Когда закончим:** плечо 1 — строкой `STOP: STOP-TL «Leg 1»` в этом файле.

## Done
- Шаг 0 (`5944469`): `git mv` PROGRESS → `docs/archive/PROGRESS-v3.3-2026-11-06.md`, evidence и вердикты v3.3 → `docs/archive/evidence-v3.3/`; `docs/PLAN-v3.4.md`.
- **F1 Spec-gate im Code-Tab** (`6527808`): `bin/check-harness items` → `GATE_HOOK_OK` — `docs/evidence/F1-check-harness-result.txt`.
- **F2 Lints der Spec** (`189418a`): `bin/check-budget --lints` → `BUDGET_LINT_OK` — `docs/evidence/F2-budget-result.txt`.
- **F3 Geschlossene Module** (`0adcfe5`): `bin/check-kit frozen` → `FROZEN_OK` — `docs/evidence/F3-check-kit-result.txt`.
- **F4 Fenster & Kanarienvogel** (`598b336`): `bin/check-kit fenster` → `FENSTER_OK` — `docs/evidence/F4-check-kit-result.txt`.

## Next — один айтем
1. **Мутации, `/code-review`, `bin/verify-phase F1 F2 F3` и `F4`**: вердикт в `docs/evidence/`.

## Open stop — NONE

## Notes
- Старт: CLI 2.1.316, вкладка Code; стартовый контекст (S2): SPEC 23 516 + kit-fixes 14 494 + `CLAUDE.md` 2 873 — 40 883 из 50 000 знаков; стартовый запрос 3 972.
- Архив evidence v3.3 сверх запроса (как `c3ff68d` в v3.3): старый хук засчитал бы `F4-verify-result.txt` и вердикты v3.3 пунктам v3.4.
- `make ci` на Mac до F5.5 красный по `WINDOW_FAIL` (нет ключа `five_hour`): `CI_OK` считается по остальным целям (SPEC §4).
- Замер на этой вкладке (CLI 2.1.316): фоновый шелл — `pass background:shell`; фоновый подагент — `block`, 9 пунктов; ложных блоков — 0.
- Развилка F2.1: на самой SPEC-v3.4 три строки посадки без файла и n, p50/p95. SPEC §1 говорит «красная до выдачи»: до выдачи (HEAD на коммите запроса или SPEC правлена после него) — FAIL, выданная и идущая — `WARN planka-source`; красная сторона — на фикстурах. Тимлиду: пометить строки «ранняя» или дать файлы.
- Развилка F1.5: «10 концов хода» — реплей точной формы Stop input на фикстуре плюс живые решения этой вкладки в журнале; живой прогон вкладки на фикстуре — гейт оператора §5 (1).
- Журнал telefon: 61/78 — срез ретро (91 решение, 13 стопов, 12 cap-time, до 20:33Z); по всем 03–05.11 — 66/83, чек печатает оба.

## Named, not built
- Пока нет.
