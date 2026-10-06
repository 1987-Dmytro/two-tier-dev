# PROGRESS — two-tier-dev, SPEC-v3 «кит v3» (файл исполнителя; потолок 60 строк)

## Голова — 06.10.2026
**Сделано:** сид тимлида, PLAN-v3, архив v2, F1–F8; ветка `v3` на origin. **Следующий шаг оператора:** нет — фаза идёт. **Когда закончим:** в этой сессии, F1–F9 по PLAN-v3.

## Done
- Сид `49e873c` «Тимлид: seed v3»; `goal-v2.txt` → `docs/archive/goal-v2.txt` (`c39237f`); PLAN-v3 (`c4114c4`).
- Шаг 0b: `docs/archive/PROGRESS-v2.md`, `docs/archive/PLAN-v2.md`, 11 файлов evidence v2 → `docs/archive/evidence-v2/`.

- **F1 Бюджеты**: `bin/check-budget --self-test && bin/check-budget` → `SELFTEST_OK` (42 фикстуры), `BUDGET_OK` на репо и на ките — `docs/evidence/F1-budget-result.txt`. Скиллы v2 `team-lead`, `grilling` → `docs/archive/kit-v2/claude-config/skills/` (отклонение 1 PLAN).

- **F2 Intent, пин, владение**: `bin/check-budget --self-test intent owner` → `INTENT_OK`, `OWNER_OK` (15 фикстур); на репо пин `e5e66199712a` = hash-object, коммит «Тимлид:» один — `49e873c` — `docs/evidence/F2-intent-result.txt`.

- **F3 CI**: `bin/check-ci v3` → `CI_OK` для HEAD `4edfb15` (прогон 37495741399: check-budget и `make ci` — success) — `docs/evidence/F3-ci-result.txt`. Первый прогон упал на YAML (`: ` в plain-скаляре), починка — `4edfb15`.

- **F4 Харнес**: `bin/check-harness` → `HARNESS_OK` — `docs/evidence/F4-harness-result.txt`: settings v3, пара `claude -p` (маркер STEER дошёл; с `AGENT_STOP` — 1 вызов, `hook_stopped`), коннекторов claude.ai 0 в обоих прогонах, `claude doctor` без ошибок. «До» на ките v2: 5 коннекторов, `completed` вместо `hook_stopped` — `F4-harness-v2-baseline.txt`.

- **F5 Шаблоны**: `bin/check-budget --templates` → `BUDGET_OK` — `docs/evidence/F5-templates-result.txt`: 9 шаблонов (INTENT, SPEC, GOAL дословно из `docs/drafts/`), пример каждого проходит правила; WARN — маркер неясности шаблона INTENT, так задумано.

- **F6 Скиллы кита**: `bin/check-kit` → `KIT_OK` — `docs/evidence/F6-kit-result.txt`: в ките только `plan-phase` v3 (фазы с платными и необратимыми шагами) и `accept` v3 (свежий evaluator, вердикт в `docs/evidence/accept-<sha>.txt`, STATUS не пишет); v2 `team-lead`, `grilling` — в архиве.

- **F7 Upgrade**: `bin/two-tier-upgrade --self-test` → `UPGRADE_OK` — `docs/evidence/F7-upgrade-result.txt`: клон без origin, ветка `kit-v3`, 23 файла v3, 11 в архив, PROGRESS (201) и PLAN-1 (401) — в архив с датой, свежие со ссылкой; файлы тимлида не тронуты; второй прогон — тот же HEAD.

- **F8 Документы**: `bin/check-docs` → `DOCS_OK` — `docs/evidence/F8-docs-result.txt`: README, `docs/dev-system.ru.md` (цикл v3, intent, бюджеты, самоулучшение), `docs/README.md`, `docs/LAUNCH.md`, CHANGELOG v3 — 18 полей харнеса со ссылкой на док и итогом до/после; красная проба на копии → `DOCS_FAIL`.

## Next — один айтем
1. **F9 Гейт**: `bin/gate-v3` → `GATE_OK`.

## Open stop — NONE

## Notes
- Пример шаблона в `--templates` — шаблон как есть: подставлены номер фазы, пин и Read first, плейсхолдеры `<…>` остаются.
- PLAN-v3 и эта страница написаны в форме шаблонов v3 до F5: шаблоны пишет сам исполнитель, F5 их фиксирует.

- Список `claude.ai …` в `system/init` грузится в фоне: на ките v2 прогон 1 дал 0, прогон 2 — 5. Поэтому `check-harness` смотрит оба прогона пары.

## Named, not built
