# SPEC-v2 — сборка кита two-tier-dev v2 (фаза 1 нового цикла)

**intent:** `intent/two-tier-dev-v2.md` · **архитектура:** `docs/two-tier-dev-v2-architecture.md` (подписана 18.09) · **исполнитель:** Opus 5 в ультракоде · **одна фаза = один `/goal`**

## 0. Контекст
Репо `1987-Dmytro/two-tier-dev` стоит на v1 (HEAD `3d68740`, team-lead v3.20, executor-kit с brain-init). Решения D1–D17 (handoff 10c) и поправки 18.09 (ультракод вместо `max`, evidence в файлы) подписаны. Ничего из v1 не удаляется без адреса в `docs/archive/`. Исходники, которые берём как есть: `anthropics/cwc-long-running-agents/claude-code-config/.claude/` (Apache-2.0, 5 хуков + evaluator.md + CLAUDE.md) и `mattpocock/skills/skills/productivity/grilling/SKILL.md` (MIT). Черновики тимлида лежат в репо после распаковки seed: `intent/`, `docs/SPEC-v2.md`, `docs/two-tier-dev-v2-architecture.md`, `docs/drafts/team-lead-v4-draft.md`.

## 1. Технический дизайн высокого уровня
Кит — папка `kit/`, которую `bin/two-tier-init <target>` копирует в целевой репо. Внутри: `CLAUDE.md` (≤40 строк), `REVIEW.md`, `intent/`, `docs/*.template.md`, `.claude/{settings.json, hooks/, agents/evaluator.md, rules/graphify.md, skills/}`. Harness = официальные хуки Anthropic без изменений + два наших PreToolUse(Bash): `refuse_sweeping_commands.py` из v1 и фильтр тестового вывода. Evidence-контракт: каждый чек пишет вывод в `docs/evidence/<fid>-<check>-result.txt` (маска `*-result.txt` — та, что читает `track-read.sh`), evaluator читает файлы. Скиллы — папки `skills/<name>/SKILL.md`; `plan-phase` и `accept` с `disable-model-invocation: true`. Всё старое — в `docs/archive/` одним перемещением (`git mv`), без CLAUDE.md внутри архива. Точная раскладка и содержимое settings.json — в архитектуре §3–§5; детали реализации решает исполнитель в PLAN.

## 2. Фичи
Формат: `id · user story · «готово» · команда чека · after: · [P]`

- **F1 Скелет кита и шаблоны** · как тимлид, я разворачиваю кит одной командой в пустой репо · готово, когда `bin/two-tier-init /tmp/t2` создаёт дерево из архитектуры §3 (`kit/` целиком) и `kit/docs/{SPEC,PLAN,STATUS,PROGRESS,PROCESS}.template.md` + `kit/intent/intent.template.md` заполнены по D15/D16 (SPEC — шесть секций; PROGRESS — формат `STOP: <id>` и resume-строка; PROCESS — Environment как таблица `инструмент · форма · требующая фича/чек · установка · удаление` + 10 вопросов, Money 8 дефолтов из `templates/PROCESS.md` v1, каталог развилок из `templates/stop-patterns.md` v1) · чек: `rm -rf /tmp/t2 && mkdir /tmp/t2 && git -C /tmp/t2 init -q && bin/two-tier-init /tmp/t2 && find /tmp/t2 -type f | sort` — список совпадает с §3 · after: — 

- **F2 Harness `.claude/`** · как оператор, я могу остановить исполнителя файлом `AGENT_STOP`, а результат теста нельзя записать без прочитанного evidence · готово, когда `kit/.claude/` содержит `settings.json` по архитектуре §5 (без `CLAUDE_CODE_MAX_*`), пять хуков из cwc verbatim (шапка лицензии сохранена), `refuse_sweeping_commands.py`, `test-output-filter.sh` (режет тестовый шум, **оставляет** итоговую строку `N passed`/`FAILED`), `agents/evaluator.md` (cwc + один абзац про лестницу Ponytail: корректность против SPEC, не вкус; evidence в `docs/evidence/`), `rules/graphify.md` · чек: `python3 -c "import json;json.load(open('kit/.claude/settings.json'))" && for f in kit/.claude/hooks/*.sh; do bash -n $f; done && cd /tmp/t2 && touch AGENT_STOP && echo '{}' | .claude/hooks/kill-switch.sh | grep -q '"decision":"block"' && rm AGENT_STOP && printf '{"tool_input":{"file_path":"test-results.json"}}' | .claude/hooks/verify-gate.sh | grep -q block && echo HARNESS_OK` · after: F1 · [P]

- **F3 Скиллы** · как тимлид в Cowork и исполнитель в Claude Code, я вызываю `/team-lead`, `/grilling`, `/plan-phase`, `/accept` · готово, когда `kit/.claude/skills/{team-lead,grilling,plan-phase,accept}/SKILL.md` существуют: team-lead — из `docs/drafts/team-lead-v4-draft.md` без правок смысла, ≤80 строк; grilling — копия Покока verbatim с добавленной строкой источника/лицензии; plan-phase — шаг 0 фазы (прочитать SPEC в plan mode → `docs/PLAN-n.md` коммитом: файлы, порядок, риски, доказательство; плюс сверка таблицы Environment в PROCESS.md со SPEC и печать дельты «поставить/убрать»); accept — inline-bash собирает STATUS + список `docs/evidence/*` и вызывает evaluator · чек: `for s in team-lead grilling plan-phase accept; do head -3 kit/.claude/skills/$s/SKILL.md | grep -q '^name:' || exit 1; done && [ $(wc -l < kit/.claude/skills/team-lead/SKILL.md) -le 80 ] && grep -q 'disable-model-invocation: true' kit/.claude/skills/plan-phase/SKILL.md kit/.claude/skills/accept/SKILL.md && echo SKILLS_OK` · after: F1 · [P]

- **F4 CLAUDE.md и REVIEW.md** · как исполнитель в свежей сессии, я читаю ≤40 строк и знаю правила evidence, стопов и compaction · готово, когда `kit/CLAUDE.md` содержит 10 блоков из архитектуры §4 (с evidence-правилом F2) и не содержит запрещённых фраз; `kit/REVIEW.md` — lite: баги · безопасность · соответствие SPEC/PLAN · что считать Important · чек: `[ $(wc -l < kit/CLAUDE.md) -le 40 ] && ! grep -Ei 'verify with a subagent|double-check|re-verify|keep spawn counts low' kit/CLAUDE.md && grep -q 'docs/evidence' kit/CLAUDE.md && echo CLAUDEMD_OK` · after: F1 · [P]

- **F5 Архив v1 и документация репо** · как сторонний человек, я открываю README и понимаю цикл v2, а v1 нахожу целиком в архиве · готово, когда `docs/archive/{team-lead-v3.20.md, executor-kit-v1/, templates-v1/, brain-init-v1/}` содержат всё из v1 (git mv), `skills/brain-init/` и `executor-kit/` и `templates/` из корня исчезли, `bin/new-project.sh` → архив, README.md и `docs/dev-system.ru.md` переписаны под v2 (роли, цепочка intent→SPEC→PLAN→/goal→/accept, kickoff-команды D6), CHANGELOG получил запись v2.0 · чек: `git diff --stat --diff-filter=D HEAD~N..HEAD | grep -c . ` = 0 для нерenamed удалений (т.е. `git log --diff-filter=D --name-only` пуст) && `test ! -e executor-kit && test ! -e templates && test ! -e skills/brain-init && test -f docs/archive/team-lead-v3.20.md && ! find docs/archive -name CLAUDE.md | grep -q . && echo ARCHIVE_OK` · after: F1

- **F6 Гейт: кит на пустом репо** · как оператор, я вижу, что кит живой: инициализируется, хуки отвечают, размер контекста известен · готово, когда в `/tmp/t2` (после F1–F5) `find` совпадает с §3, `HARNESS_OK`/`SKILLS_OK`/`CLAUDEMD_OK` повторены из целевого репо, `docs/STATUS.md` в two-tier-dev называет дату гейта и команду запуска для оператора, все `docs/evidence/F*-result.txt` существуют · чек: `ls docs/evidence/F1-*-result.txt docs/evidence/F2-*-result.txt docs/evidence/F3-*-result.txt docs/evidence/F4-*-result.txt docs/evidence/F5-*-result.txt && grep -q 'Запуск:' docs/STATUS.md && echo GATE_OK` · after: F2, F3, F4, F5

## 3. Инварианты и границы
- Ничего из v1 не удаляется — только `git mv` в `docs/archive/`; `git log --diff-filter=D` за фазу пуст.
- Официальные файлы cwc копируются verbatim с лицензионной шапкой; своих аналогов там, где есть официальный файл, не пишем.
- `kit/CLAUDE.md` ≤40 строк; `team-lead/SKILL.md` ≤80 строк; в промтах нет «verify with a subagent / double-check / re-verify».
- `settings.json` — только ключи, подтверждённые docs/settings-reference (архитектура §5); никаких `CLAUDE_CODE_MAX_*`.
- SPEC/PLAN/STATUS/intent — deny на Edit для исполнителя; STATUS пишет `/accept`.
- Каждый чек: команда + вывод в транскрипте **и** файл `docs/evidence/<fid>-<check>-result.txt`.
- Никаких сетевых источников кроме github.com (cwc, mattpocock/skills). Ничего платного.

## 4. Стоп-точки
- **STOP-1** — только если один из двух внешних источников недоступен или его файлы отличаются от описанных в §0 (иные имена хуков, отсутствует `evaluator.md`): записать `STOP: STOP-1 <что расходится>` в PROGRESS.md и остановиться. Resume-строка оператора: `Продолжай по SPEC-v2 с F<n>; расхождение решено так: <…>`.
- Других стопов нет: неясности в шаблонах решает исполнитель в PLAN и отмечает в PROGRESS `## Notes`.

## 5. Артефакт закрытия
`bin/two-tier-init <пустой репо>` → рабочий кит; `docs/STATUS.md` со строкой `Запуск: cd <проект> && bin/two-tier-init . && claude` и датой гейта; `docs/evidence/F1..F6-*-result.txt`; один коммит на фичу с сообщением `F<n>: …`; PLAN-v2.md обновлён при любом отклонении тем же коммитом.

## 6. Открытые вопросы
1. Sweep effort (`low/medium/high/ultracode` × ±Ponytail) — отдельный $0-айтем после гейта, не в этой фазе.
2. `graphify`/`ponytail`/Context7 ставятся не в этой фазе (нужны в целевом проекте, не в ките); kickoff-команды только описаны в README.
3. Карта evaluator-модели (Haiku по умолчанию, Opus 5 `low` на гейте) — как поле `model:` во frontmatter `evaluator.md`; проверить на первом `/accept`.
