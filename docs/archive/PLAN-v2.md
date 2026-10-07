# PLAN-v2 — сборка кита two-tier-dev v2

**Спека:** `docs/SPEC-v2.md` (F1–F6) · **архитектура:** `docs/two-tier-dev-v2-architecture.md` §3–§6 · **goal:** `goal-v2.txt`
**База фазы:** HEAD `fa3e602` · **исполнитель:** Opus 5 в ультракоде · **критерий этого файла (D16):** по нему реализует инженер, не видевший разговора.

`docs/SPEC-v2.md`, `docs/two-tier-dev-v2-architecture.md`, `intent/` — **заморожены**. Любое отклонение от них разрешается здесь и записывается в `## Notes` файла `docs/PROGRESS.md`; отклонение от этого PLAN — обновить PLAN тем же коммитом.

**Проверено 18.09 до начала сборки (probe, вывод в транскрипте):**

| Факт | Значение |
|---|---|
| `anthropics/cwc-long-running-agents` | публичен, Apache-2.0; `claude-code-config/.claude/hooks/` = **ровно 5 файлов, все `.sh`**: `commit-on-stop.sh`, `kill-switch.sh`, `steer.sh`, `track-read.sh`, `verify-gate.sh`; есть `agents/evaluator.md`, `CLAUDE.md`, `settings.json` |
| `hooks/verify-gate.py` | HTTP **404** — upstream такого файла нет |
| `agents/evaluator.md` | frontmatter `name` / `description` / `tools: Read, Glob, Grep, Bash`; **`model:` отсутствует**; лицензионная шапка — HTML-комментарием **ниже** закрывающего `---` |
| `mattpocock/skills/.../grilling/SKILL.md` | MIT (c) 2026 Matt Pocock; 28 строк, 1987 байт; `name:` на строке 2 |
| **STOP-1** | **не срабатывает**: оба источника доступны и совпадают со SPEC §0 |
| Связка F2 против настоящих хуков | прогнана verbatim → печатает `HARNESS_OK`, `exit 0` |
| Среда | `/bin/bash` 3.2.57 (другого нет; все пять хуков cwc проходят `bash -n`), git 2.54.0, python3 3.11.8, `LC_COLLATE=ru_RU.UTF-8` |
| Репо сегодня | нет `.claude/`, нет `docs/evidence/`, нет `docs/archive/`, нет `docs/STATUS.md`, нет `docs/PROGRESS.md`; дерево грязное: `M skills/team-lead/SKILL.md` (v3.23, 404 строки; в `fa3e602` — v3.20, 346 строк), `?? goal-v2.txt` |

---

## Файлы

### Семантика развёртывания (в документах не сказана — фиксируется здесь)

`bin/two-tier-init <target>` кладёт **содержимое** `kit/` в **корень** целевого репо: `kit/CLAUDE.md` → `<target>/CLAUDE.md`, `kit/.claude/` → `<target>/.claude/`. Вложенного `kit/` в цели нет. Основание: чек F2 делает `cd /tmp/t2 && .claude/hooks/kill-switch.sh`, артефакт закрытия SPEC §5 — `Запуск: cd <проект> && bin/two-tier-init . && claude`.

- Копирование: `cp -a kit/. "$TARGET"/` (форма `kit/.`, **никогда** `kit/*` — она не берёт `.claude/`; **никогда** генерация файлов из строк — теряется exec-бит).
- Скрипт работает внутри уже существующего git-репо, `git init` не делает, `--git` не требует, существующий файл не перезаписывает (печатает `skip (exists): <path>`, как `put()` в `bin/new-project.sh`).
- Имя файла — `two-tier-init`, без расширения. `bin/two-tier-init` и все `kit/.claude/hooks/*` коммитятся с режимом `100755` (`git update-index --chmod=+x`), иначе F2 падает с EACCES (126), а `bash -n` этого не ловит.
- Один аргумент; подстановок `<phase-name>`/`<project-name>`/`<date>` нет — кит везёт незаполненные `*.template.md`.

### Канонический состав кита — 22 файла

Список коммитится как `docs/evidence/F1-tree-expected.txt` (с префиксом `/tmp/t2/`, порядок `LC_ALL=C sort`). Имя файла намеренно **не** оканчивается на `-result.txt`, чтобы не попасть в glob F6.

| Путь в ките | Источник содержимого |
|---|---|
| `kit/.claude/agents/evaluator.md` | cwc verbatim + `model: haiku` во frontmatter + один абзац про лестницу Ponytail |
| `kit/.claude/hooks/commit-on-stop.sh` | cwc verbatim |
| `kit/.claude/hooks/kill-switch.sh` | cwc verbatim |
| `kit/.claude/hooks/refuse_sweeping_commands.py` | v1 `executor-kit/scripts/hooks/refuse_sweeping_commands.py` verbatim, режим 755 |
| `kit/.claude/hooks/steer.sh` | cwc verbatim |
| `kit/.claude/hooks/test-output-filter.sh` | пишется заново (оставляет итоговую строку `N passed` / `FAILED`) |
| `kit/.claude/hooks/track-read.sh` | cwc verbatim |
| `kit/.claude/hooks/verify-gate.sh` | cwc verbatim |
| `kit/.claude/rules/graphify.md` | пишется руками (graphify в этой фазе не ставится) |
| `kit/.claude/settings.json` | §5 + wiring хуков verbatim из upstream `settings.json` |
| `kit/.claude/skills/accept/SKILL.md` | пишется заново из v1 `commands/report.md` + `commands/close.md` |
| `kit/.claude/skills/grilling/SKILL.md` | mattpocock verbatim + строка источника/лицензии в **теле** |
| `kit/.claude/skills/plan-phase/SKILL.md` | v1 `commands/plan-phase.md`, перенацелен + дельта Environment |
| `kit/.claude/skills/team-lead/SKILL.md` | `docs/drafts/team-lead-v4-draft.md` (52 строки) без правок смысла |
| `kit/CLAUDE.md` | пишется заново по §4 (десять блоков) |
| `kit/REVIEW.md` | пишется заново: баги · безопасность · соответствие SPEC/PLAN · что считать Important |
| `kit/docs/PLAN.template.md` | пишется заново: файлы · порядок · риски · доказательство |
| `kit/docs/PROCESS.template.md` | Environment (пишется заново) + Money (8 буллетов `templates/PROCESS.md:65-104`) + каталог развилок |
| `kit/docs/PROGRESS.template.md` | v1 `templates/PROGRESS.md` + `STOP: <id>` + resume-строка + `## Notes` |
| `kit/docs/SPEC.template.md` | пишется заново: шесть секций D15 |
| `kit/docs/STATUS.template.md` | v1 `templates/STATUS.md` + строка «когда закончим» |
| `kit/intent/intent.template.md` | пишется заново: проблема · желаемый результат · пользователи и системы · ограничения · открытые вопросы (пример — `intent/two-tier-dev-v2.md`) |

**Хуки — 7 файлов, и это отклонение от §3, записанное здесь:**
- `verify-gate.py` → `verify-gate.sh` (upstream `.py` = 404; чек F2 зовёт `.sh`);
- `test-output-filter` → `test-output-filter.sh` (формулировка F2 — единственная машинно-проверяемая);
- `track-read.sh` **добавлен**: его wire-ит §5, и только он пишет лог, который читает `verify-gate.sh`; на его маске `*-result.txt` держится весь evidence-контракт SPEC §1.
Это расхождение **наших** документов между собой — **не STOP-1** (§4 покрывает только недоступность источника и иные имена файлов у него).

**`graphify-hint` — не файл, а inline-команда.** Второй хук группы `Bash`, строка копируется дословно из `executor-kit/claude-config/settings.json` (матчит `*grep*|*rg\ *|*find\ *|…`, охраняется `[ -f graphify-out/graph.json ]`, печатает `hookSpecificOutput.additionalContext`, `timeout: 5`). В дерево кита ничего не добавляет. **Выписать до того, как F5 отправит `executor-kit/` в архив.**

### `kit/.claude/settings.json` — целевой вид

Группы `PreToolUse` `*` / `Read` / `Write|Edit` и группа `Stop` — **verbatim из upstream** `claude-code-config/.claude/settings.json` (формат `{"type":"command","command":".claude/hooks/kill-switch.sh"}`); добавляется четвёртая группа `"matcher": "Bash"`. Скалярные ключи — байт в байт как печатает §5.

```json
{
  "model": "opus",
  "ultracode": true,
  "workflowSizeGuideline": "small",
  "subagentPromptCacheTtl": "1h",
  "autoMemoryEnabled": false,
  "permissions": { "deny": [
    "Edit(/docs/STATUS.md)", "Edit(/docs/SPEC-*.md)", "Edit(/docs/PLAN-*.md)",
    "Edit(/docs/PROCESS.md)", "Edit(/docs/reviews/**)", "Edit(/docs/archive/**)",
    "Edit(/intent/**)"
  ] },
  "hooks": {
    "PreToolUse": [
      { "matcher": "*",          "hooks": [ ".claude/hooks/kill-switch.sh", ".claude/hooks/steer.sh" ] },
      { "matcher": "Read",       "hooks": [ ".claude/hooks/track-read.sh" ] },
      { "matcher": "Write|Edit", "hooks": [ ".claude/hooks/verify-gate.sh" ] },
      { "matcher": "Bash",       "hooks": [ "python3 ${CLAUDE_PROJECT_DIR}/.claude/hooks/refuse_sweeping_commands.py (timeout 30)",
                                            ".claude/hooks/test-output-filter.sh (timeout 5)",
                                            "<inline graphify-hint из v1> (timeout 5)" ] }
    ],
    "Stop": [ { "hooks": [ ".claude/hooks/commit-on-stop.sh" ] } ]
  }
}
```

Записи хуков выше — сокращение для читателя; в файле каждая раскрывается в объект `{"type":"command","command":"…","timeout":N}`. **§5 печатает псевдо-JSON** (голые идентификаторы) — из него нельзя копировать буквально, `json.load` упадёт. Поключевой список утверждений для evaluator'а (чек F2 проверяет только парсабельность): ровно семь записей `deny`; ключей `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` / `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` / `maxEffortLevel` / `env.CLAUDE_CODE_EFFORT_LEVEL` нет; `"ultracode": true`; четыре группы `PreToolUse` и одна `Stop`; все `command` указывают на существующие файлы кита.

### `kit/CLAUDE.md` — десять блоков §4, ≤40 строк

Бюджет: заголовок + десять блоков **по одной строке** + evidence-правило + указатель = ≈14 строк. Никаких подзаголовков на блок, никаких code-fence. Четыре английские строки — verbatim в форме §4:

- блок 3: `Show the command and its output for every check; never report a check as passed without its output in the transcript`
- блок 4: `Deliver what was asked, at the scope intended; finish the whole task; stop short of actions clearly beyond what was asked`
- блок 5: `do not use subagents to verify your own work`
- блок 6: `match length to what the task needs, no filler sections`

Блок 5 — только эта строка. Мета-комментарий §4 («`keep spawn counts low` снято») **в файл не переносится**: чек F4 грепает эту фразу. Должна встречаться строка `docs/evidence` (требование чека). Финальный перевод строки сохранить (`wc -l` считает переводы строк).

### Репозиторий two-tier-dev — что трогается

| Фича | Создаётся / переписывается | Переезжает `git mv` |
|---|---|---|
| Шаг 0 | — | — (коммит `chore: team-lead card v3.23`) |
| F1 | `bin/two-tier-init`, все 22 файла `kit/**`, `docs/evidence/F1-tree-expected.txt` | — |
| F2 | `kit/.claude/{settings.json, hooks/×7, agents/evaluator.md, rules/graphify.md}` | — |
| F3 | `kit/.claude/skills/{team-lead,grilling,plan-phase,accept}/SKILL.md` | — |
| F4 | `kit/CLAUDE.md`, `kit/REVIEW.md` | — |
| F5 | `README.md`, `docs/dev-system.ru.md`, `docs/README.md`, `CHANGELOG.md` (запись v2.0) | реестр ниже |
| F6 | `docs/STATUS.md` | — |

**Реестр `git mv` для F5** (перед первым `git mv` — `mkdir -p docs/archive/{executor-kit-v1,templates-v1,brain-init-v1}`, иначе `git mv` не найдёт родителя):

| Откуда | Куда |
|---|---|
| `skills/team-lead/SKILL.md` (v3.23, 404 стр.) | `docs/archive/team-lead-v3.23.md` |
| `skills/team-lead/README.md` (13 стр.) | `docs/archive/team-lead-v1-README.md` |
| `skills/brain-init/{README.md, M6-v2-deltas.md}` | `docs/archive/brain-init-v1/` |
| `executor-kit/**` (16 файлов, 5 из них 755) | `docs/archive/executor-kit-v1/` |
| `templates/**` (10 файлов) | `docs/archive/templates-v1/` |
| `bin/new-project.sh` (755) | `docs/archive/new-project.sh` |

Плюс не-`mv`: `git show fa3e602:skills/team-lead/SKILL.md > docs/archive/team-lead-v3.20.md` (346 строк) — это то, что проверяет `test -f docs/archive/team-lead-v3.20.md`.
`skills/team-lead/README.md` не назван ни одним документом; без этой строки папка `skills/` исчезает вместе с ним жёстким удалением и инвариант «`--diff-filter=D` пуст» ломается.
`executor-kit/CLAUDE.md.template` едет как есть: чек F5 ищет имя ровно `CLAUDE.md`, `.template` под него не попадает.
**После всех `git mv`** каталоги `executor-kit/`, `templates/`, `skills/` остаются на диске пустыми (git каталогов не хранит), а `test ! -e executor-kit` на пустом каталоге ложен — значит F5 без этого шага красный. Убирать только пустые и только после проверки, что файлов не осталось: `find executor-kit templates skills -type f` (должен напечатать ничего), затем `find executor-kit templates skills -depth -type d -empty -delete`.

### Чего кит НЕ поставляет

`.gitignore`, `knowledge/`, `.gitkeep`, `docs/evidence/`, `.claude/.evidence-reads` (создаётся в рантайме `track-read.sh`), `AGENT_STOP`, `STEER.md`, `skills/grill-me/`. Любой лишний файл обязан одновременно появиться строкой в `docs/evidence/F1-tree-expected.txt` — иначе чек F1 красный.

### Решения по неясностям (SPEC §4: решает исполнитель в PLAN, отмечает в PROGRESS `## Notes`)

- **`disable-model-invocation: true`** — только на `plan-phase` и `accept` (SPEC F3). `team-lead` и `grilling` остаются модельно-вызываемыми: у обоих триггеры объявлены в `description:`, а F3 требует копировать v4-черновик без правок смысла. Отклонение от §3 («все с флагом») записано.
- **Строка лицензии grilling** — в теле файла, первой строкой после закрывающего `---`: `<!-- Source: https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md — MIT License, Copyright (c) 2026 Matt Pocock -->`. Frontmatter остаётся байт в байт, `name:` на строке 2. Байты тела копировать как есть (❓ U+2753, ➡️ U+27A1+FE0F на строках 13/15/19/21); `kit/.claude/skills/**` исключить из любого форматтера; `agents/openai.yaml` из upstream не копировать.
- **evaluator.md** — `model: haiku` добавляется (в upstream ключа нет; это закрывает открытый вопрос SPEC §6.3, а не отклонение); опция «Opus 5 `low` на гейте» записана и проверяется на первом `/accept`. Лицензионная шапка остаётся **ниже** закрывающего `---`. Добавленный абзац про лестницу Ponytail (уровень `full`, «корректность против SPEC, не вкус») явно называет `docs/evidence/` — иначе evaluator пойдёт читать `screenshots/` из upstream-текста.
- **`rules/graphify.md`** — пишется руками: команды D6 (`/graphify src --wiki`, `graphify hook install`, MCP-режим ВЫКЛ, строить по `src/`) + правило «для точечных вопросов `graphify query`, а не grep». Без `paths:` во frontmatter (правило общерепозиторное), достижимо через указатель блока 10 `kit/CLAUDE.md`; форма — по `executor-kit/claude-config/rules/_TEMPLATE.md`.
- **PROCESS.template §Environment** — колонки по SPEC F1: `инструмент · форма · требующая фича/чек · установка · удаление`; строки и команды `установка` — из таблицы §6 и D6. Десять вопросов формулирует исполнитель (D5 даёт девять ответов-ветвей, не вопросы), десятый — по §6: «какой `workflowSizeGuideline` этой фазе». Где команды удаления нет — «убрать строку и не ставить в следующей фазе».
- **PROCESS.template §Каталог развилок** — структура из `templates/PHASE.md:46-64` (a)–(f), обогащённая (g)–(i) из `skills/team-lead/SKILL.md` §4; словарь классов («planned read · fork · defect · money · process · question») — из `templates/stop-patterns.md` и `templates/PROGRESS.md`.
- **PROCESS.template §Money** — восемь буллетов `templates/PROCESS.md:65-104`; устаревший комментарий «The seven defaults» не переносится.
- **Остальные восемь секций v1 `templates/PROCESS.md`** в v2-шаблон не переносятся: инвариант «ничего не теряется» выполняется перемещением файла в `docs/archive/templates-v1/`.
- **`docs/interview.md`** — вне объёма этой фазы: его пишет тимлид в Cowork (handoff, задача 1). §3 описывает целевое состояние репо, а не чеклист фазы.
- **`docs/drafts/team-lead-v4-draft.md`** остаётся на месте как источник v4; не архивируется.
- **`goal-v2.txt`** этой фазой не трогается и ни в один коммит не входит.
- **`docs/PROGRESS.md`** — живой файл фазы в корне two-tier-dev, создаётся из `kit/docs/PROGRESS.template.md` при первом стопе или чекпойнте. В дерево кита не входит.
- **CHANGELOG** — запись `v2.0` ставится первой (SPEC управляет), коллизия нумерации с существующей `v3.20` называется открытым пунктом. Шапка файла **переписывается**, а не дополняется: единица версионирования больше не карточка `skills/team-lead/SKILL.md`, §10 заменён правилом роста закона (D10, §7). Формат записи — существующий: `## v<N> — <YYYY-MM-DD> — <урок>` + буллеты `- **§<n>:** … Taught by: …`.

---

## Порядок

**Шаг 0 — не фича, отдельный коммит.** `git add skills/team-lead/SKILL.md && git commit -m "chore: team-lead card v3.23"`. Без него коммит F5 втягивает постороннюю правку (+92/−34) и ломает «один коммит на фичу», а `git mv` кладёт байты v3.23 под именем v3.20. Решение оператора принято 18.09: карточку зафиксировать, в архив уходят **обе** версии.

**F1** (`after: —`) — `bin/two-tier-init` + всё дерево `kit/` целиком. Файлы, содержимое которых принадлежит F2/F3/F4, создаются заглушкой (заголовок или frontmatter с `name:` — и ничего больше); шаблоны `kit/docs/*` и `kit/intent/*` заполняются **полностью** уже здесь. Зелёный F1 — это дерево; настоящий гейт — F6.

**F2 ∥ F3 ∥ F4** (`after: F1`, `[P]`) — множества записи не пересекаются, и это весь аргумент безопасности параллели:
- F2 → `kit/.claude/{settings.json, hooks/**, agents/**, rules/**}`
- F3 → `kit/.claude/skills/**`
- F4 → `kit/CLAUDE.md`, `kit/REVIEW.md`
Параллель — сабагенты workflow внутри одной сессии (§6); вторая worktree-сессия не нужна.

**F5** — SPEC печатает `after: F1`, фактическая зависимость **`after: F1, F2, F3, F4`**; отклонение записано здесь. Причина: F5 архивирует исходники, из которых читают F1 и F2. Три предусловия перед первым `git mv`, проверяются командой:
`test -f kit/docs/PROCESS.template.md && test -f kit/docs/STATUS.template.md && test -f kit/docs/PROGRESS.template.md && test -f kit/.claude/hooks/refuse_sweeping_commands.py && grep -q 'graphify-out/graph.json' kit/.claude/settings.json || exit 1`
(содержимое `templates/*` перенесено · хук v1 скопирован с режимом 755 · строка graphify-hint выписана).

**F6** (`after: F2, F3, F4, F5`) — гейт в `/tmp/t2`: `find` против ожидаемого дерева и три маркера, перезапущенные из целевого репо; `docs/STATUS.md` со строкой `Запуск:` и датой гейта.

**Коммиты.** Один на фичу, сообщение `F<n>: …`, всегда по путям: `git add <точные пути> && git commit -m "F<n>: …"` — никогда `-a`, `-A`, `git add .` (в дереве постороннее). Отклонение от PLAN — правка `docs/PLAN-v2.md` **тем же** коммитом.

**Чего не делать.**
- Не устанавливать кит в сам two-tier-dev во время фазы: `commit-on-stop.sh` начнёт вставлять коммиты «session checkpoint» и сломает «один коммит на фичу», а `permissions.deny` запрёт файлы, которые F5/F6 обязаны писать. «Целевой репо» F6 — это `/tmp/t2`, и только он. Строка `Запуск:` в STATUS — документация будущего действия оператора, не шаг F6.
- Не проверять свою работу сабагентами: evaluator запускается отдельно через `/accept` после гейта.
- Правило 60 ходов — **чекпойнт, не стоп**: записать в `docs/PROGRESS.md` сделанное, несделанное и следующую команду; маркер `STOP: <id>` при этом **не** писать.
- STOP-1 (единственный стоп фазы) — только недоступность одного из двух источников или иные имена его файлов: записать `STOP: STOP-1 <что расходится>` в `docs/PROGRESS.md` и остановиться, это выполненный goal. Resume-строка оператора: `Продолжай по SPEC-v2 с F<n>; расхождение решено так: <…>`. **Расхождение наших собственных документов между собой — никогда не STOP-1.**

---

## Риски

1. **Инвариант «`git log --diff-filter=D` за фазу пуст» не измерен.** В репо за всю историю ноль переименований, поэтому сегодняшний ноль не говорит ничего о том, как git запишет перенос 30 файлов. → До настоящего коммита F5: `git clone --no-hardlinks . <scratchpad>/f5-rehearsal`, проделать там весь реестр `git mv`, закоммитить, прогнать `git log -M -C --diff-filter=D --name-only --pretty=format: fa3e602..HEAD | grep -v '^$' | wc -l`, клон выбросить. Репетиция в scratchpad, репо не меняется.
2. **Грязное дерево.** `M skills/team-lead/SKILL.md` и `?? goal-v2.txt` (последний не покрыт `.gitignore`). Любой `git commit -a` / `git add -A` втягивает их. → Шаг 0 + коммиты по путям.
3. **`docs/archive/` не существует.** `git mv` требует существующего родителя; к тому же подчек `! find docs/archive …` при отсутствующей папке проходит по ошибке. → `mkdir -p` в начале F5 + `[ -d docs/archive ]` первым условием чека.
4. **§5 печатает `settings.json` псевдо-JSON,** а чек F2 проверяет только парсабельность — всё, что §5 действительно требует, не проверено ничем. → wiring хуков копируется verbatim из upstream `settings.json`, скалярные ключи — из §5; поключевой список утверждений (выше) отдаётся evaluator'у.
5. **UNVERIFIED: связывают ли правила `deny` только инструмент `Edit`.** На этом держатся запись STATUS из `/accept` inline-bash'ем и правило «PLAN обновляется тем же коммитом». → До написания `accept/SKILL.md` один раз прогнать различающий тест: развернуть кит во временной папке, попытаться (а) `Edit` и (б) `Write` по `docs/STATUS.md`, оба исхода записать в `docs/evidence/`. Если `Write` тоже запрещён — `accept` производит STATUS только inline-bash'ем.
6. **`docs/archive/team-lead-v3.22.md` (§3, D10) из содержимого репо не производится** — карточка существует только в Cowork. SPEC F5 требует лишь `team-lead-v3.20.md`, поэтому SPEC управляет; строка §3 остаётся невыполненной и выносится оператору отдельным пунктом. Не STOP-1.
7. **«Готово» шире чека у F1, F4, F5, F6.** F1 зелёный на пустых шаблонах (чек — только `find`); F4 не смотрит `kit/REVIEW.md` и не считает десять блоков; F5 не проверяет три подпапки архива, архивированный `new-project.sh` и переписанные README/CHANGELOG; F6 не перезапускает маркеры сам. → Раздел «Доказательство» добавляет по каждой дырке явное утверждение, помеченное как дополнение PLAN; построчные критерии приёмки шаблонов — для evaluator'а.
8. **`tee` создаёт файл evidence и для упавшего чека** → `ls` в F6 доказывает существование, а не успех. → F6 дополнительно грепает маркер в каждом файле.
9. **F2 оставляет `AGENT_STOP` в `/tmp/t2`,** если связка порвётся посередине: он заблокирует любой следующий хук и вылезет в `find` у F6. → `trap 'rm -f /tmp/t2/AGENT_STOP' EXIT` сразу после `cd`.
10. **Повтор `HARNESS_OK` в F6 упадёт по-честному:** `track-read.sh` к тому моменту наполнит `.claude/.evidence-reads`, и `verify-gate.sh` выйдет нулём, ничего не напечатав. → Чеки F2 и F6 запускать с `VERIFY_READ_LOG=$(mktemp)`; кит не поставляет `.claude/.evidence-reads`.
11. **Аннотации §3 к двум хукам неверны.** `commit-on-stop.sh` в PROGRESS.md ничего не пишет (только `git commit -am "session checkpoint: …"`), `steer.sh` висит на `PreToolUse "*"`, а не на SessionStart. Правы §5 и upstream. Файлы переносятся verbatim; PROGRESS.md ведёт агент по блокам 8–9 `kit/CLAUDE.md`.
12. **Аннотация §3 к `refuse_sweeping_commands.py` неверна:** он не ловит ни `rm -rf`, ни `git reset --hard` — только подметания `git add` / `make fmt` / `ruff format`, и fail-open на неразбираемом stdin. Переносится как есть; расширять его логику в эту фазу не входит.
13. **D17(2) в двух пунктах отменён поправками 18.09** (архитектура подписана позже): ни `keep spawn counts low`, ни капов `CLAUDE_CODE_MAX_*` в ките нет — масштаб задаёт `workflowSizeGuideline`. Слово `max` в §8, intent и D3 — устаревшая проза; в settings идёт `"ultracode": true`.
14. **Имя файла evidence — `<fid>-<check>-result.txt`.** Форма `<fid>-<check>.txt` из §5 проиграла дважды: glob F6 и маска `track-read.sh`. Суффикс менять нельзя.
15. **`python3 -m py_compile` по хукам запрещён:** он пишет `__pycache__/*.pyc` внутрь `kit/` и ломает деревья F1 и F6. Синтаксис `.py` проверяется `ast.parse`.
16. **Опровергнуто измерением — в риски не входит:** bash 3.2 парсит все пять хуков cwc; `kill-switch.sh` печатает компактный `{"decision":"block",…}`, так что грепы F2 совпадают побайтно; связка F2 verbatim печатает `HARNESS_OK`.

---

## Доказательство

Все чеки — из корня `/Users/hdv_1987/Desktop/Projects/two-tier-dev`, каждый пишет вывод **в транскрипт и в файл**. Один раз перед первым чеком: `mkdir -p docs/evidence`.

**Идиом захвата** (одинаковый для F1–F6):

```bash
( set -o pipefail; { <КОМАНДА>; } 2>&1 | tee /Users/hdv_1987/Desktop/Projects/two-tier-dev/docs/evidence/F<n>-<check>-result.txt ); rc=$?
```

Почему именно так: `tee` кладёт вывод и в файл, и в транскрипт; `2>&1` **внутри** скобок — иначе диагностика `bash -n`, `git fatal:`, `ls: No such file` мимо файла; `tee` съедает статус (пайплайн возвращает статус `tee`), `set -o pipefail` возвращает настоящий; `( … )` не даёт `pipefail` протечь в остальную сессию; подоболочка слева от пайпа гасит `cd /tmp/t2` и `exit 1` внутри чеков, поэтому следующая фича запускается из корня; путь у `tee` **абсолютный** — иначе evidence F2 уедет в `/tmp/t2/docs/evidence/`.

### F1 — дерево кита → `docs/evidence/F1-tree-result.txt`

Команда SPEC: `rm -rf /tmp/t2 && mkdir /tmp/t2 && git -C /tmp/t2 init -q && bin/two-tier-init /tmp/t2 && find /tmp/t2 -type f | sort`
Исполняемая форма:

```bash
rm -rf /tmp/t2 && mkdir /tmp/t2 && git -C /tmp/t2 init -q && bin/two-tier-init /tmp/t2 \
&& find /tmp/t2 -name .git -prune -o -type f -print | LC_ALL=C sort > /tmp/t2-tree.txt \
&& LC_ALL=C sort docs/evidence/F1-tree-expected.txt | diff -u - /tmp/t2-tree.txt \
&& cat /tmp/t2-tree.txt && ls -l /tmp/t2/.claude/hooks/ && echo TREE_OK
```

Правки и причины: `-name .git -prune` — `git init` создаёт 18 обычных файлов (`HEAD`, `config`, `description`, `info/exclude`, 14×`hooks/*.sample`), без прунинга список не совпадёт с §3 никогда; `LC_ALL=C sort` с обеих сторон — под `ru_RU.UTF-8` порядок другой (`REVIEW.md` уезжает за `docs/`); `diff -u` против `docs/evidence/F1-tree-expected.txt` — SPEC говорит «совпадает с §3» глазами, машинного предиката нет; `TREE_OK` — маркер, введённый этим PLAN; `ls -l` хуков — доказательство, что exec-бит пережил копирование. Маркер: `TREE_OK`.
**Для evaluator'а:** ожидаемое дерево расходится с §3 ровно на три строки (`verify-gate.sh` вместо `verify-gate.py`, `test-output-filter.sh` вместо `test-output-filter`, добавленный `track-read.sh`) — это отклонение 1 реестра, а не дефект F1. «Готово» F1 читается против `docs/evidence/F1-tree-expected.txt`, а не против §3 буквально.

### F2 — harness → `docs/evidence/F2-harness-result.txt`

Команда SPEC исполняется **verbatim** (прогнана против настоящих хуков, печатает `HARNESS_OK`), с четырьмя дополнениями:

```bash
export VERIFY_READ_LOG=$(mktemp)
python3 -c "import json;json.load(open('kit/.claude/settings.json'))" \
&& for f in kit/.claude/hooks/*.sh; do bash -n "$f" || exit 1; done \
&& for f in kit/.claude/hooks/*.py; do python3 -c 'import ast,sys;ast.parse(open(sys.argv[1]).read())' "$f" || exit 1; done \
&& cd /tmp/t2 && trap 'rm -f /tmp/t2/AGENT_STOP' EXIT && touch AGENT_STOP \
&& echo '{}' | .claude/hooks/kill-switch.sh | grep -q '"decision":"block"' && rm -f AGENT_STOP \
&& printf '{"tool_input":{"file_path":"test-results.json"}}' | .claude/hooks/verify-gate.sh | grep -q block \
&& echo HARNESS_OK
```

Правки и причины: `|| exit 1` внутри цикла — `for` возвращает статус только последней итерации, ошибка в `commit-on-stop.sh` была бы невидима за успешным `verify-gate.sh`; цикл по `*.py` через `ast.parse` — `.py`-хуки в `*.sh` не попадают (`py_compile` запрещён, см. риск 15); `trap` — иначе оборванная связка оставляет `AGENT_STOP`; `VERIFY_READ_LOG` на временный пустой файл — иначе прочитанные evidence-файлы разблокируют гейт и второй `grep` не сработает. Маркер: `HARNESS_OK`. Дополнение PLAN (в тот же файл evidence): поключевые утверждения по `settings.json` из раздела «Файлы».

### F3 — скиллы → `docs/evidence/F3-skills-result.txt`

```bash
for s in team-lead grilling plan-phase accept; do head -3 kit/.claude/skills/$s/SKILL.md | grep -q '^name:' || exit 1; done \
&& [ $(wc -l < kit/.claude/skills/team-lead/SKILL.md) -le 80 ] \
&& for s in plan-phase accept; do grep -q 'disable-model-invocation: true' kit/.claude/skills/$s/SKILL.md || exit 1; done \
&& echo SKILLS_OK
```

Единственная правка: многофайловый `grep -q file1 file2` истинен при совпадении в **любом** из файлов — то есть чек проходил бы, если флаг стоит только в `plan-phase`; заменён на поштучный цикл. Маркер: `SKILLS_OK`.

### F4 — CLAUDE.md и REVIEW.md → `docs/evidence/F4-claudemd-result.txt`

```bash
grep -Ein 'verify with a subagent|double-check|re-verify|keep spawn counts low' kit/CLAUDE.md; \
[ -f kit/CLAUDE.md ] && [ $(wc -l < kit/CLAUDE.md) -le 40 ] \
&& ! grep -Eiq 'verify with a subagent|double-check|re-verify|keep spawn counts low' kit/CLAUDE.md \
&& grep -q 'docs/evidence' kit/CLAUDE.md \
&& [ -f kit/REVIEW.md ] \
&& echo CLAUDEMD_OK
```

Правки и причины: `! grep` превращает ошибку grep (выход 2 — нет файла, битый regex) в «запрещённых фраз нет», поэтому добавлены `[ -f ]` и `-q`; первая строка печатает найденные совпадения в evidence, чтобы при падении было видно, что именно сработало; `[ -f kit/REVIEW.md ]` — дополнение PLAN, чек SPEC до `REVIEW.md` не дотягивается. Маркер: `CLAUDEMD_OK`.

### F5 — архив → `docs/evidence/F5-archive-result.txt`

Чек SPEC собран из двух бэктик-фрагментов, склеенных русской прозой, и содержит нерезолвимый `HEAD~N` — verbatim он не исполняется. Реконструкция (авторитетной прозой SPEC объявлена пустота `git log --diff-filter=D --name-only`):

```bash
BASE=fa3e602
git log -M -C --diff-filter=D --name-only --pretty=format: $BASE..HEAD | grep -v '^$'
[ "$(git log -M -C --diff-filter=D --name-only --pretty=format: $BASE..HEAD | grep -v '^$' | wc -l | tr -d ' ')" -eq 0 ] \
&& test ! -e executor-kit && test ! -e templates && test ! -e skills/brain-init \
&& test -f docs/archive/team-lead-v3.20.md \
&& [ "$(git show HEAD:docs/archive/team-lead-v3.20.md | wc -l | tr -d ' ')" -eq 346 ] \
&& test -d docs/archive/executor-kit-v1 && test -d docs/archive/templates-v1 \
&& test -d docs/archive/brain-init-v1 && test -f docs/archive/new-project.sh \
&& [ -d docs/archive ] && ! find docs/archive -name CLAUDE.md | grep -q . \
&& echo ARCHIVE_OK
```

Правки и причины: `HEAD~N` → `fa3e602..HEAD` (иначе `fatal: ambiguous argument`, а без диапазона лог читает всю историю); `git diff --stat` выброшен — он сводка, а не список удалённых путей; `grep -c .` заменён на `wc -l` (на пустом входе `grep -c .` печатает 0, но **выходит 1** и под `pipefail` уронил бы успешный случай); `-M -C --pretty=format:` — без них переименования не спариваются и каждая шапка коммита считается строкой; первая строка печатает сам набор удалений в evidence; `[ -d docs/archive ]` — без него отсутствующая папка проходит подчек; четыре `test -d/-f` и проверка на 346 строк — дополнения PLAN под ту часть «готово», которую чек SPEC не покрывает. Маркер: `ARCHIVE_OK`.

### F6 — гейт → `docs/evidence/F6-gate-result.txt`

Сначала четыре прогона из целевого репо (`tee` по абсолютному пути): сверка дерева `/tmp/t2` с `F1-tree-expected.txt` → `docs/evidence/F6-tree-result.txt`, и команды F2/F3/F4 без префикса `kit/` при cwd `/tmp/t2` → `F6-harness-result.txt`, `F6-skills-result.txt`, `F6-claudemd-result.txt`. Затем:

```bash
ls docs/evidence/F1-*-result.txt docs/evidence/F2-*-result.txt docs/evidence/F3-*-result.txt \
   docs/evidence/F4-*-result.txt docs/evidence/F5-*-result.txt \
&& grep -q 'Запуск:' docs/STATUS.md \
&& grep -q TREE_OK      docs/evidence/F1-tree-result.txt \
&& grep -q HARNESS_OK   docs/evidence/F2-harness-result.txt \
&& grep -q SKILLS_OK    docs/evidence/F3-skills-result.txt \
&& grep -q CLAUDEMD_OK  docs/evidence/F4-claudemd-result.txt \
&& grep -q ARCHIVE_OK   docs/evidence/F5-archive-result.txt \
&& echo GATE_OK
```

Правки и причины: пять `grep -q <МАРКЕР>` — дополнение PLAN, превращающее «файл существует» в «чек прошёл» (`tee` создаёт файл и для упавшего чека); F6 пишет собственный `F6-gate-result.txt`, хотя его же `ls` его не глобит — этого требует SPEC §5 («`F1..F6-*-result.txt`»). `docs/STATUS.md` создаётся в F6 и содержит строку `Запуск: cd <проект> && bin/two-tier-init . && claude` и дату гейта. Маркер: `GATE_OK`.

### Реестр отклонений (SPEC и архитектура заморожены — правки живут здесь)

| # | Отклонение | Где | Класс |
|---|---|---|---|
| 1 | `verify-gate.py` → `verify-gate.sh`; `test-output-filter` → `.sh`; `track-read.sh` добавлен | §3 vs F2/§5 | расхождение наших документов |
| 2 | `graphify-hint` — inline-команда, не файл | §5 vs §3 | уточнение |
| 3 | Кит ложится в **корень** цели, `kit/` в цели нет | нигде не сказано | уточнение |
| 4 | `find … -name .git -prune` + `LC_ALL=C sort` + `diff` + маркер `TREE_OK` | F1 | исправление + дополнение |
| 5 | `\|\| exit 1` в цикле хуков; `ast.parse` для `.py`; `trap` на `AGENT_STOP`; `VERIFY_READ_LOG` | F2 | исправление |
| 6 | Многофайловый `grep -q` → поштучный цикл | F3 | исправление |
| 7 | `! grep` → `! grep -Eiq`, `[ -f ]`, `[ -f kit/REVIEW.md ]` | F4 | исправление + дополнение |
| 8 | Чек реконструирован; `HEAD~N` → `fa3e602..HEAD`; `-M -C`; `grep -c .` → `wc -l`; четыре `test` архива | F5 | реконструкция + дополнение |
| 9 | Пять `grep -q <МАРКЕР>`; собственный файл evidence у F6 | F6 | дополнение |
| 10 | Имя evidence — `<fid>-<check>-result.txt` (форма §5 отброшена) | §5 vs SPEC §1/§3 | исправление |
| 11 | Флаг `disable-model-invocation: true` — только `plan-phase` и `accept` | §3 vs F3 | расхождение наших документов |
| 12 | `model: haiku` добавлен в `evaluator.md` | SPEC §6.3 | закрытие открытого вопроса |
| 13 | Фактическая зависимость F5 — `after: F1, F2, F3, F4` | SPEC F5 | исправление |
| 14 | `skills/team-lead/README.md` → `docs/archive/team-lead-v1-README.md`; в архив уходят обе карточки (v3.23 и v3.20) | реестр F5 | дополнение |
| 15 | `docs/archive/team-lead-v3.22.md` не производится; `docs/interview.md` вне объёма фазы | §3 | невыполнимо / вне объёма |
| 16 | Опустевшие после `git mv` каталоги снимаются с диска: `test ! -e` на пустом каталоге ложен | F5 | найдено на прогоне |
| 17 | Добавлен четвёртый файл evidence гейта — `F6-tree-result.txt` (сверка дерева из целевого репо) | F6 | найдено на прогоне |
| 18 | Различающий тест риска 5 (`deny` связывает только `Edit`?) не прогнан: кит намеренно не установлен в two-tier-dev, применять его не к чему. `accept/SKILL.md` написан по ветке «`Write` открыт» | риск 5 | пропущено осознанно |
| 19 | `permissions.deny` — семь записей §5, а не двенадцать v1 + `Edit(/intent/**)` из таблицы §3: выпавшие пути — артефакты v1, которых в v2 нет; ни один защищаемый артефакт v2 не потерян | §3 vs §5 | сужение, зафиксировано |
