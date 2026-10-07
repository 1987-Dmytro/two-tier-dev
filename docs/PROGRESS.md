# PROGRESS — two-tier-dev, SPEC-v3.1 «ultracode по полной» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 07.10.2026
**Сделано:** шаг 0 — `docs/PLAN-v3.1.md`; шаг 0b — evidence и PROGRESS фазы v3 в `docs/archive/`. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** 07.10, вечер — по темпу плеча 1,5–2 ч; сдвинуть может только стоп по SPEC-v3.1 §4.

## Done
- Шаг 0: `docs/PLAN-v3.1.md` (`19b0380`).
- Шаг 0b (`a4b474d`): `git mv` evidence v3 → `docs/archive/evidence-v3/`, PROGRESS v3 → `docs/archive/PROGRESS-v3.md`.
- **F1 Харнес ultracode**: `bin/check-harness` → `HARNESS_OK` — `F1-harness-result.txt`; `baseRef` `fresh` → `main-base`, `head` → `head-feature` — `F1-baseref-result.txt`.

## Next — один айтем
1. **F2 Окружение = таблица**: `bin/check-harness` → `ENV_OK`.

## Open stop — NONE

## Notes
- `permissions.allow` из `.claude/settings.json` в `-p` не действует (папка не доверена) — пара и `bin/verify-phase` передают те же правила `--allowedTools`; отклонение 3 PLAN.

## Named, not built
- `fix-until-green.js` — Q4, по замеру на ретро v3.1.
