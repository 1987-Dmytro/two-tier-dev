# PROGRESS — two-tier-dev, SPEC-v3 «кит v3» (файл исполнителя; потолок 60 строк)

## Голова — 07.10.2026, фикс-раунд 2 (v3-2)
**Что изменилось:** блокирующая `docs/reviews/v3-2.md` закрыта по классу (`3c0c2fe`, план — `36237e0`). Правило владения ловит путь тимлида в END STATE, если он записан как в `defaults.owner` (каталог с хвостовым `/`, glob как есть) или обёрнут в разметку: `` ` ``, `**…**`, `_…_`, `<…>`, `~~…~~`, `./`, кавычки, скобки, знаки конца фразы.
- Фикстуры: 9 записей × 10 обрамлений — FAIL; `docs/PROGRESS.md`, `docs/evidence/`, `docs/evidence/F2-intent-result.txt` в тех же обрамлениях — OK.
- Красная проба на правиле `f7ffa41` — 51 BAD, `OWNER_FAIL`. Живой GOAL — `путей 5, файлов тимлида — нет`.
- Evidence F1 и F2 обновлены. Финальный `bin/gate-v3` идёт после последнего push и остаётся в транскрипте.
**Следующий шаг оператора:** «отчёт готов» в свежую сессию тимлида: `/team-lead — повторная приёмка кита v3 по docs/reviews/v3-2.md: ветка v3, голова docs/PROGRESS.md`. Чек находки — `bin/check-budget --self-test intent owner` → `OWNER_OK`, затем `bin/gate-v3` из свежего клона. После этого — merge `v3` → `main` по «да» оператора.
**Когда закончим переход:** кит v3 — 07.10, после повторной приёмки (около 30 минут тимлида) и merge. Перевод projekt_1_telefon — 07–08.10, после решения оператора по STOP-5: сессия тимлида около часа плюс один `/goal` с `bin/two-tier-upgrade` на 1–2 часа. Сдвинуть даты могут только окно оператора и это решение.

## Done
- Сид `49e873c` «Тимлид: seed v3»; `goal-v2.txt` → архив (`c39237f`); PLAN-v3 (`c4114c4`); v2 PROGRESS, PLAN и evidence → `docs/archive/`.
- **F1 Бюджеты** (`b60ff86`): `bin/check-budget --self-test && bin/check-budget` → `SELFTEST_OK`, `BUDGET_OK` на репо и на ките — `F1-budget-result.txt`.
- **F2 Intent, пин, владение** (`abf7742`): `bin/check-budget --self-test intent owner` → `INTENT_OK`; коммиты «Тимлид:» — список в `F2-intent-result.txt`.
- **F3 CI** (`ec28688`, fix `4edfb15`): `bin/check-ci v3` → `CI_OK` — `F3-ci-result.txt`.
- **F4 Харнес** (`435b896`): `bin/check-harness` → `HARNESS_OK` — `F4-harness-result.txt`; «до» на ките v2 — `F4-harness-v2-baseline.txt`.
- **F5 Шаблоны** (`b9f026b`): `bin/check-budget --templates` → `BUDGET_OK` — `F5-templates-result.txt`.
- **F6 Скиллы кита** (`2ca1760`): `bin/check-kit` → `KIT_OK` — `F6-kit-result.txt`.
- **F7 Upgrade** (`c3757e7`): `bin/two-tier-upgrade --self-test` → `UPGRADE_OK` — `F7-upgrade-result.txt`.
- **F8 Документы** (`b7fa66e`, fix `85e8931`): `bin/check-docs` → `DOCS_OK`, красная проба → `DOCS_FAIL` — `F8-docs-result.txt`.
- **F9 Гейт**: `bin/gate-v3` → `F1 BUDGET_OK` … `F8 DOCS_OK`, `F9 GATE_OK` — `F9-gate-result.txt`.
- **Фикс-раунд v3-1** (план `93f14f8`; `139d4cb`, `b7d64ef`, `92fdc86`):
  - `bin/check-budget --self-test && bin/check-budget` → `BUDGET_OK`;
  - `--self-test intent owner` → `INTENT_OK`, `OWNER_OK`, с красными фикстурами: не-ASCII путь, точка, запятая, скобка, `./`;
  - `bin/two-tier-upgrade --self-test` → `UPGRADE_OK`, формы (а)–(г) и (д).
- **Фикс-раунд v3-2** (план `36237e0`; `3c0c2fe`): `--self-test intent owner` → `OWNER_OK`, 90 красных и 30 зелёных фикстур END STATE; на правиле `f7ffa41` — `OWNER_FAIL`.

## Next — один айтем
1. **Повторная приёмка тимлида по v3-2** (строка выше). Чек: `bin/gate-v3` → `GATE_OK` из свежего клона ветки `v3`.

## Open stop — NONE

## Notes
- PLAN-v3 и эта страница написаны в форме шаблонов v3 до F5: шаблоны пишет сам исполнитель, F5 их зафиксировал.
- Пример шаблона в `--templates` — шаблон как есть: подставлены номер фазы, пин и Read first, плейсхолдеры `<…>` остаются.
- «Вместе с CLAUDE.md» в бюджете Read first — корневой `CLAUDE.md`, если он есть (в репо кита его нет).
- Список `claude.ai …` в `system/init` грузится в фоне: на ките v2 прогон 1 дал 0, прогон 2 — 5. Поэтому `check-harness` смотрит оба прогона пары.
- Остальные развилки и расхождения с докой — 15 строк «Отклонения» в `docs/PLAN-v3.md`.
- Фикс-раунд, F7:
  - «пустой индекс» — `git diff --cached` пуст;
  - «дерево как до запуска» — все файлы, включая неотслеживаемые и игнорируемые, и все каталоги, без `.git`.
- Форма (в) — свой `budgets.json` без `defaults.progress_lines` и `plan_lines`: апгрейд отказывает с причиной, defaults кита не подставляет. Иначе `bin/check-budget` проекта после апгрейда всё равно красный.
- Фикстура (д) — отказ `pre-commit` после старта. Формы (а)–(г) ловят предусловия, поэтому откат проверяет только она.
- Если прежняя `kit-v3` есть, а проект на другой ветке, план и предусловия считаются на дереве `kit-v3`. При отказе — возврат на исходную ветку.
- Красные пробы в F2 и F7 — гибрид во `/tmp/two-tier-v3/redprobe`: правило или `upgrade()` из `fe2f33f`, фикстуры из HEAD. Раунд 2 — `rule_owner` из `f7ffa41`.
- Раунд 2: каталог тимлида без хвостового `/` (`docs/reviews` в прозе) — не красный. Находка называет запись как в списке, а голое слово `intent` в `--self-test intent owner` не должно быть путём.

## Named, not built
- `defaults` в `budgets.json` проекта ни с чем не сверяются: «только ужесточать» проверяется для блока `project`. В репо кита две копии defaults сверяет `check-kit`; в проекте правку defaults видно только в диффе.
- `two-tier-upgrade` на живом проекте (S6) — следующая фаза (SPEC-v3 §6). `intent/intent.template.md` v2 там остаётся тимлиду: путь под `intent/`.
- Stop-хук `commit-on-stop` в паре прогонов не проявился (в копии нет отслеживаемых файлов); выведен по причине, а не по прогону.
