# PROGRESS — two-tier-dev, SPEC-v3.5 «фаза без рук оператора» (файл исполнителя; потолок 60 строк — `bin/check-budget`)

## Голова — 12.11.2026, Шаг 0
**Сделано:** Шаг 0 — PROGRESS v3.4 в архив (`docs/archive/PROGRESS-v3.4-2026-11-12.md`), `docs/PLAN-v3.5.md` с пробой обеих сторон на все 40 пунктов F1.1–F9.5, фикстуры и файлы фич. **Следующий шаг оператора:** нет — фаза идёт, одно плечо. **Когда закончим:** плечо — 5–6 ч стройки и круг `verify-phase` (SPEC §2), до STOP-TL.

## Done
- Шаг 0: ветка `v3.5`, `cmp .claude/launch.settings.json .claude/settings.local.json` — молча; клон `/tmp/two-tier-v3/telefon-src` на `main`, чистый.

## Next — один айтем
1. Префиксы версий у строк проб прошлых фаз в выводе чеков (SPEC §3), затем F8.3 «до», F2, F3.

## Open stop — NONE

## Notes
- Старт 12.11 19:39, CLI 2.1.319, вкладка Code; стартовый контекст (S2): SPEC 53 110 + kit-fixes 17 225 + `CLAUDE.md` 3 181 знаков, запрос 3 978.
- Гигиена до плеча: сирот под `/tmp/two-tier-v3` — 0 (`ps`, родитель 1, путь стенда); каталогов в корне — 1034; записей `installed_plugins.json` пользователя — 1092 (только счёт).
- Развилка Шага 0: evidence v3.4 не переносится в архив — запрос его не называет, имена файлов v3.5 с ним не пересекаются, `spec-gate`, `phase-report` и `spec-board` берут строки только из файлов с `spec: SPEC-v3.5`.
- Вердикт свежего проверяющего в `docs/reviews/v3.5-spec.md` — `NEEDS_WORK` с пином `73ea6b9ed7ec`, SPEC в HEAD — `740ff1fda7f2`: `spec-review` на ней — FAIL до evidence v3.5 в HEAD, потом WARN (F7.3).
- Тимлиду: `team_lead_spec_copy_chars` и `handoff_threshold_pct` — ключи кита, в `budgets.json` корня их нет (WARN «вносит тимлид»); копия `docs/drafts/team-lead-spec.md` — 7 514 знаков из 8000 (прежние 13 042 — байты `wc -m`).

## Named, not built
- Из SPEC: `bin/check-procs`, уборка корня стендов, слияние правок проекта при апгрейде — следующая фаза кита.
