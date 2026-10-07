# PROGRESS — two-tier-dev, SPEC-v3.1 «ultracode по полной» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 07.10.2026
**Сделано:** шаг 0 — `docs/PLAN-v3.1.md`; шаг 0b — evidence и PROGRESS фазы v3 в `docs/archive/`. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** 07.10, вечер — по темпу плеча 1,5–2 ч; сдвинуть может только стоп по SPEC-v3.1 §4.

## Done
- Шаг 0: `docs/PLAN-v3.1.md` (`19b0380`).
- Шаг 0b (`a4b474d`): `git mv` evidence v3 → `docs/archive/evidence-v3/`, PROGRESS v3 → `docs/archive/PROGRESS-v3.md`.
- **F1 Харнес ultracode**: `bin/check-harness` → `HARNESS_OK` — `F1-harness-result.txt`; `baseRef` `fresh` → `main-base`, `head` → `head-feature` — `F1-baseref-result.txt`.

- **F2 Окружение = таблица**: `bin/check-harness` → `ENV_OK` на репо кита и на t3 — `F2-harness-result.txt`; `--self-test` — в `make ci`.
- **F3 Хуки на агентах**: `bin/check-harness` → `HOOKS_OK` на репо и t3 — `F3-harness-result.txt`; «до» на хуках v3 → `HOOKS_FAIL` — `F3-harness-v3-baseline.txt`.
- **F7 Владение: хвосты 3 и 5**: `bin/check-budget --self-test intent owner` → `OWNER_OK` (ok 256, BAD 0); красная проба на `rule_owner` из `8f1d232` → `OWNER_FAIL`, BAD 83 — `F7-owner-result.txt`.
- **F4 `/verify-phase`**: `bin/check-verify` → `VERIFY_OK` — `F4-verify-result.txt`: красная фикстура → `NEEDS_WORK`, дефект назван; чистая → `PASS`, блокирующих 0; `--limit 20` → `VERIFY_TIMEOUT`.

## Next — один айтем
1. **F5 `/accept` v3.1**: `bin/check-kit` → `KIT_OK`.

## Open stop — NONE

## Notes
- Хвост 3: lint коммитов берёт список владения на родителе коммита; на родителе нет `budgets.json` — кит ещё не стоял, файлов тимлида нет (коммит установки и апгрейда зелёные). Deny `Edit(/budgets.json)` в `.claude/launch.settings.json` репо — правка тимлида.
- Риск 1 PLAN снят замером: `continue:false` kill-switch останавливает агента воркфлоу, `kill-switch.sh` не менялся. Проба требует попытки записи: агент, прочитавший CLAUDE.md, иначе останавливался сам.
- Встроенные плагины `@builtin` (`cc-plugin-*`) в сверке не считаются: PROCESS называет их прозой, строки таблицы нет.
- `permissions.allow` из `.claude/settings.json` в `-p` не действует (папка не доверена) — пара и `bin/verify-phase` передают те же правила `--allowedTools`; отклонение 3 PLAN.

## Named, not built
- `fix-until-green.js` — Q4, по замеру на ретро v3.1.
