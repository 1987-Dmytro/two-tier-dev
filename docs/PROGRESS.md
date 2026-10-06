# PROGRESS — two-tier-dev, SPEC-v3 «кит v3» (файл исполнителя; потолок 60 строк)

## Голова — 06.10.2026
**Сделано:** F1–F9 закрыты, каждая — своим чеком с evidence в `docs/evidence/`; ветка `v3` на origin, CI зелёный на HEAD; `bin/gate-v3` → все маркеры F1–F9 и `GATE_OK`. `main` не тронут.
**Следующий шаг оператора:** «отчёт готов» в свежую сессию тимлида — `/team-lead — приёмка кита v3 по claude/handoff-2026-10-06-v3-transition.md: ветка v3, голова docs/PROGRESS.md`. Там: `bin/check-ci v3` → `CI_OK`, `/accept` (свежий evaluator, база `e0b5f6e`), чеки вне CI — F4, F7, F9 — из свежего клона (`bin/gate-v3`), затем merge `v3` → `main` по «да» оператора.
**Когда закончим переход:** приёмка кита — 07.10, около 40 минут тимлида. Перевод projekt_1_telefon — 07–08.10, после решения оператора по STOP-5 (хендофф, шаг 8): сессия тимлида около часа плюс один `/goal` с `bin/two-tier-upgrade`. Сдвинуть даты могут только окно оператора на гейт и это решение.

## Done
- Сид `49e873c` «Тимлид: seed v3»; `goal-v2.txt` → архив (`c39237f`); PLAN-v3 (`c4114c4`); v2 PROGRESS, PLAN и evidence → `docs/archive/`.
- **F1 Бюджеты** (`b60ff86`): `bin/check-budget --self-test && bin/check-budget` → `SELFTEST_OK`, `BUDGET_OK` на репо и на ките — `F1-budget-result.txt`.
- **F2 Intent, пин, владение** (`abf7742`): `bin/check-budget --self-test intent owner` → `INTENT_OK`; коммит «Тимлид:» один — `49e873c` — `F2-intent-result.txt`.
- **F3 CI** (`ec28688`, fix `4edfb15`): `bin/check-ci v3` → `CI_OK` — `F3-ci-result.txt`.
- **F4 Харнес** (`435b896`): `bin/check-harness` → `HARNESS_OK` — `F4-harness-result.txt`; «до» на ките v2 — `F4-harness-v2-baseline.txt`.
- **F5 Шаблоны** (`b9f026b`): `bin/check-budget --templates` → `BUDGET_OK` — `F5-templates-result.txt`.
- **F6 Скиллы кита** (`2ca1760`): `bin/check-kit` → `KIT_OK` — `F6-kit-result.txt`.
- **F7 Upgrade** (`c3757e7`): `bin/two-tier-upgrade --self-test` → `UPGRADE_OK` — `F7-upgrade-result.txt`.
- **F8 Документы** (`b7fa66e`, fix `85e8931`): `bin/check-docs` → `DOCS_OK`, красная проба → `DOCS_FAIL` — `F8-docs-result.txt`.
- **F9 Гейт**: `bin/gate-v3` → `F1 BUDGET_OK` … `F8 DOCS_OK`, `F9 GATE_OK` — `F9-gate-result.txt`.

## Next — один айтем
1. **Приёмка тимлида** (строка выше). Чек: `bin/gate-v3` → `GATE_OK` из свежего клона ветки `v3`.

## Open stop — NONE

## Notes
- PLAN-v3 и эта страница написаны в форме шаблонов v3 до F5: шаблоны пишет сам исполнитель, F5 их зафиксировал.
- Пример шаблона в `--templates` — шаблон как есть: подставлены номер фазы, пин и Read first, плейсхолдеры `<…>` остаются.
- «Вместе с CLAUDE.md» в бюджете Read first — корневой `CLAUDE.md`, если он есть (в репо кита его нет).
- Список `claude.ai …` в `system/init` грузится в фоне: на ките v2 прогон 1 дал 0, прогон 2 — 5. Поэтому `check-harness` смотрит оба прогона пары.
- Остальные развилки и расхождения с докой — 14 строк «Отклонения» в `docs/PLAN-v3.md`.

## Named, not built
- `defaults` в `budgets.json` проекта ни с чем не сверяются: «только ужесточать» проверяется для блока `project`. В репо кита две копии defaults сверяет `check-kit`; в проекте правку defaults видно только в диффе.
- `two-tier-upgrade` на живом проекте (S6) — следующая фаза (SPEC-v3 §6). `intent/intent.template.md` v2 там остаётся тимлиду: путь под `intent/`.
- Stop-хук `commit-on-stop` в паре прогонов не проявился (в копии нет отслеживаемых файлов); выведен по причине, а не по прогону.
