# PLAN-v3 — two-tier-dev, кит v3

**Спека:** `docs/SPEC-v3.md` · **база фазы:** `main` @ `e0b5f6e`, сид — `49e873c` · **дата:** 06.10.2026 · только текущий план; отклонение по ходу — правка этого файла тем же коммитом.

## Файлы
Раскладка: всё, что получает проект, лежит в `kit/` (`two-tier-init` копирует `kit/` в корень цели). Инструменты, которые проект тоже запускает, — в `kit/bin/`, а в `bin/` репо на них symlink. Только в репо остаются `bin/two-tier-init`, `bin/check-docs`, `bin/gate-v3` и `Makefile`. Вывод из кита — `git mv` в `docs/archive/kit-v2/`, `.claude/` там называется `claude-config/` (отклонение 3).
- **Шаг 0b — архив v2:** `docs/PROGRESS.md` → `docs/archive/PROGRESS-v2.md`, `docs/PLAN-v2.md` → `docs/archive/PLAN-v2.md`, `docs/evidence/F*-*.txt` (11 файлов v2) → `docs/archive/evidence-v2/`; новый `docs/PROGRESS.md` — в форме шаблона v3 (голова · Done · Next · Open stop · Notes · Named, not built).
- **F1:**
  - `kit/bin/check-budget` (python3, stdlib) — правила, `--self-test [группы]`;
  - `kit/budgets.json` — `{"defaults": §1, "project": {}}`;
  - `budgets.json` репо — те же defaults плюс `project.owner_add`;
  - symlink `bin/check-budget`;
  - `git mv` скиллов `team-lead` и `grilling` в архив;
  - в `plan-phase` убрано слово с `$` и цифрой (отклонение 1).
- **F2:** в `check-budget` — группы `intent` (пин, маркер неясности, ссылка на S) и `owner` (коммиты «Тимлид:», END STATE), у каждой фикстуры зелёная и красная.
- **F3:**
  - `.github/workflows/two-tier.yml` и его копия `kit/.github/workflows/two-tier.yml`;
  - `kit/bin/check-ci` + symlink;
  - `Makefile` с целью `ci`, которая растёт с фичами: self-test, `--templates`, `check-kit`, `check-docs`.
- **F4:**
  - `git mv kit/.claude/settings.json` → архив и `kit/.claude/settings.json` v3 по §1;
  - `kill-switch.sh` и `steer.sh` переписаны;
  - `verify-gate.sh`, `track-read.sh`, `commit-on-stop.sh`, `test-output-filter.sh`, `rules/graphify.md` → архив;
  - новые `kit/.claude/launch.settings.json`, `kit/docs/LAUNCH.md` (symlink `docs/LAUNCH.md`), `kit/bin/check-harness` + symlink;
  - `kit/CLAUDE.md` v3 (отклонение 14), `bin/two-tier-init` — текст v3.
- **F5:**
  - INTENT, SPEC, GOAL — дословно из `docs/drafts/`: `kit/docs/INTENT.template.md` (отклонение 2, старый `kit/intent/intent.template.md` → архив), `kit/docs/SPEC.template.md`, `kit/docs/GOAL.template.txt`;
  - переписаны `kit/docs/{PLAN,PROGRESS,STATUS,PROCESS}.template.md` и `kit/REVIEW.md` (шаблон ревью);
  - режим `check-budget --templates`.
- **F6:**
  - `kit/.claude/skills/plan-phase/SKILL.md` и `accept/SKILL.md` v3;
  - `kit/.claude/agents/evaluator.md` — абзац про формат REVIEW;
  - `kit/bin/check-kit` + symlink.
- **F7:** `kit/bin/two-tier-upgrade` + symlink.
- **F8:** `README.md`, `docs/dev-system.ru.md`, `docs/README.md`, `CHANGELOG.md` (запись v3), `kit/docs/LAUNCH.md`, `bin/check-docs`.
- **F9:** `bin/gate-v3`, голова `docs/PROGRESS.md`.

Не создаётся: рантайм-файлы контрольных прогонов. Они живут только в `/tmp/two-tier-v3`, а в evidence идёт обезличенная сводка.

## Порядок
- 0b → F1 → F2 → push `v3` → F3 → F4 (+ базовая линия v2) → F5 → F6 → F7 → F8 → F9. Все `after:` спеки соблюдены, параллели нет.
- Чего SPEC не говорит:
  - F1 читает скиллы кита, которые чинит F6. Поэтому архив `team-lead`/`grilling` и чистка `$` идут в F1, иначе чек F1 красный.
  - F4 архивирует `rules/graphify.md`, на который ссылается `kit/CLAUDE.md`. Поэтому CLAUDE.md переписывается в том же F4.
  - F7 ставит шаблоны F5 и харнес F4 — отсюда его место.
- Коммиты: «F<n>: …», `git add` по точным путям, evidence — в коммите фичи. Push — после F2, F3 и в конце.

## Риски
1. **UNVERIFIED: kill-switch в `-p`.** Не знаем, что видно в выводе `stream-json`: `continue:false` + `stopReason` + deny в одном объекте.
   - Различающий тест: прогон 2 с `AGENT_STOP`. Считаем вызовы `tool_use`, проверяем, создан ли файл-проба, ищем `stopReason` в выводе.
   - Если проба создана — добавить `exit 2` (документирован, блокирует всегда).
   - Если `stopReason` в потоке нет — строка в отклонения, доказательство — причина deny в `tool_result`. Это не стоп.
2. **Заметку steer примут за инъекцию** (hooks: «factual statements rather than imperative»).
   - Заметка пишется фактом.
   - Разрешение на запись маркера стоит в промпте пользователя: классификатор результатов инструментов не видит.
   - Красное — правка промпта прогона, а не хука.
3. **Вложенный `claude -p` откажут.**
   - Измерено 06.10: 1 ход, `permissionMode=auto`, `apiKeySource=none`, без `ENABLE_CLAUDEAI_MCP_SERVERS` видны 5 серверов `claude.ai …`.
   - Отказ позже — STOP-INPUT строкой, после всех фич, которым прогон не нужен.
4. **CI красный из-за истории.** Нужна полная история (`fetch-depth: 0`). Фоллбэк merge-base: `main` → `origin/main`. Флаг `--no-merges`: merge-коммит PR не трогает lint владения.
5. **Push `.github/workflows/` отклонят.** credential helper — `gh` с правом `workflow` (измерено). Если всё же отказ — STOP-INPUT, команда `gh auth setup-git`.
6. **Утечка в публичный репо.** Evidence — только имена, счётчики, маркеры. `git log --format='%h %s'`. Временные каталоги — `/tmp/two-tier-v3/…`. Из вывода `claude doctor` — только строки статуса без путей.
7. **Лимит 150 ходов.** Запись, чек, `tee` и коммит — одним вызовом. Если к 140-му ходу не закрыто — чекпоинт (C).
8. **Разные ОС.** `check-budget` идёт и на macOS, и на ubuntu CI: только stdlib python3, git через `GIT_CONFIG_GLOBAL=/dev/null` и env автора — без gpg и чужих хуков в фикстурах.

## Доказательство
Все чеки — из корня репо. Идиом захвата: `( set -o pipefail; { <КОМАНДА>; } 2>&1 | tee "$PWD/docs/evidence/F<n>-<check>-result.txt" ); rc=$?`. Доказательство — маркер в файле, а не существование файла.
| Фича | Команда SPEC (verbatim) | Маркер | Evidence | Дополнение PLAN |
|---|---|---|---|---|
| F1 | `bin/check-budget --self-test && bin/check-budget` | `BUDGET_OK` | `F1-budget-result.txt` | `(cd kit && ../bin/check-budget)` → `BUDGET_OK` («на ките») |
| F2 | `bin/check-budget --self-test intent owner` | `INTENT_OK` | `F2-intent-result.txt` | живой `bin/check-budget`: строка `owner` со списком коммитов «Тимлид:» |
| F3 | `bin/check-ci v3` | `CI_OK` | `F3-ci-result.txt` | sha HEAD и id прогона |
| F4 | `bin/check-harness` | `HARNESS_OK` | `F4-harness-result.txt` | `claude doctor` внутри чека; та же пара на ките v2 → `F4-harness-v2-baseline.txt` («до» для CHANGELOG) |
| F5 | `bin/check-budget --templates` | `BUDGET_OK` | `F5-templates-result.txt` | — |
| F6 | `bin/check-kit` | `KIT_OK` | `F6-kit-result.txt` | — |
| F7 | `bin/two-tier-upgrade --self-test` | `UPGRADE_OK` | `F7-upgrade-result.txt` | — |
| F8 | `bin/check-docs` | `DOCS_OK` | `F8-docs-result.txt` | — |
| F9 | `bin/gate-v3` | `GATE_OK` | `F9-gate-result.txt` | финальный прогон после последнего push — в транскрипте, без коммита |

Что проверяет каждый чек:
- **`check-harness`.**
  - Свежая копия харнеса в `/tmp/two-tier-v3/harness`. Флаги — из блока `sh` в `docs/LAUNCH.md`, плюс `-p --setting-sources project,local --max-turns 3 --output-format stream-json --verbose` под `env -u ANTHROPIC_API_KEY -u ENABLE_CLAUDEAI_MCP_SERVERS`.
  - Прогон 1 — с заметкой в `STEER.md`: маркер в файле-пробе.
  - Прогон 2 — с `AGENT_STOP`: пробы нет, один `tool_use`, причина kill-switch в выводе.
  - Плюс `system/init`: `permissionMode=auto`, нет `claude.ai …`; статика settings по §1; `claude doctor`.
- **`check-kit`:** набор скиллов `{accept, plan-phase}`, frontmatter, контракт accept и plan-phase, у evaluator нет Write/Edit. В репо дополнительно: архив скиллов на месте, копии workflow и defaults бюджета совпадают.
- **`two-tier-upgrade --self-test`:**
  - Фикстура: клон без origin, раздутые PROGRESS и PLAN, синтетический харнес v2.
  - После апгрейда: ветка `kit-v3`, харнес v3, архив и свежие файлы, отчёт, `check-budget` → `BUDGET_OK`.
  - Второй прогон — тот же sha и пустой `git status`; `git remote` пуст.

## Отклонения от SPEC и уточнения по докам
1. Архив `team-lead`/`grilling` и чистка `$` в `plan-phase` — в F1, а не в F6: иначе F1 красный, 4755 знаков и `$` с цифрой. F6 проверяет архив своим чеком.
2. Шаблон INTENT — `kit/docs/INTENT.template.md`. Под `intent/` в проекте это был бы файл тимлида: lint владения покраснел бы на коммите установки.
3. `.claude/` в архиве — `claude-config/`, как у архива v1. Вложенные `.claude/skills` Claude Code подхватывает сам (skills, «Load skills in monorepos and subdirectories»), а архив должен быть инертным.
4. Хуки — exec form с `${CLAUDE_PROJECT_DIR}` (hooks, «Prefer exec form for any hook that references a path placeholder»). `AGENT_STOP` и `STEER.md` привязаны к корню проекта: `cwd` идёт за `cd` Claude.
5. Из settings v2 сверх `ultracode` уходят:
   - `subagentPromptCacheTtl` — запись кэша на час дороже, а у кита один evaluator на приёмку;
   - хуки `commit-on-stop` (`commit -am` против коммитов по путям и lint владения), `test-output-filter` и подсказка graphify (приказы в `additionalContext`, а hooks велит писать факты);
   - `rules/graphify.md` — грузится на каждом старте, а строка Environment в PROCESS его покрывает.

   Остаются `workflowSizeGuideline: "small"` (ограничивает траты воркфлоу по ключевому слову) и `refuse_sweeping_commands.py` (механика «`git add` по путям»). Deny — ровно список тимлида: PLAN в v3 — файл исполнителя, а Edit по permissions покрывает Write.
6. `budgets.json` — `defaults` кита плюс `project`, который только ужесточает: числа не выше defaults, файлы тимлида — только `owner_add`; иначе FAIL. Пути правил зашиты в код для обеих раскладок, в файле — числа и список владения.
7. «Вместе с CLAUDE.md» — это корневой `CLAUDE.md`, если он есть. В репо кита его нет.
8. `--self-test` печатает маркер на группу (`SIZE_OK` … `INTENT_OK`, `OWNER_OK`) и в конце `SELFTEST_OK`.
9. Таблица Environment для WARN `check-harness` — `docs/PROCESS.md` проекта, если он есть, иначе шаблон.
10. Апгрейд не пишет файлы тимлида (`.claude/launch.settings.json`, `intent/`, `docs/GOAL.txt` …): они в отчёте под «тимлиду». Харнес v2 фикстуры синтетический — скрипт идёт в ките и работает из t3 без репо кита.
11. Evidence v2 — в `docs/archive/evidence-v2/`: иначе приёмка прочтёт `GATE_OK` v2 как маркер v3.
12. Шаблон REVIEW — `kit/REVIEW.md` на прежнем пути: на него ссылаются CLAUDE.md, evaluator и accept. Блокирующие — пункты списка верхнего уровня под заголовком `## Блокирующие`.
13. «До» для CHANGELOG — та же пара прогонов на ките v2 из `e0b5f6e` со строкой запуска v3.
14. `kit/CLAUDE.md` переписан в F4 (см. Порядок).
15. Риск 1 закрыт измерением. В `-p` (`stream-json`) отдельного события `stopReason` нет: строка kill-switch (она же `permissionDecisionReason`) приходит в `tool_result` единственного вызова, а остановку хуком доказывает `result.terminal_reason = hook_stopped`. Поэтому `check-harness` требует и строку, и `hook_stopped`.
