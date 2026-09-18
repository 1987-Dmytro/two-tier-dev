# two-tier-dev v2 — финальная компоновка архитектуры (к подписи перед сборкой)

**Дата:** 18.09.2026. **Основание:** решения D1–D17 (handoff 2026-09-10c) + аудит репо 18.09 (HEAD `3d68740`, v1/v3.20, из v2 — ничего).
**Правило этого документа:** каждый компонент ниже привязан к решению D-n. Компонент без D-n — не входит.

---

## 1. Два яруса, две модели, три точки решения

| Ярус | Где | Модель / effort | Делает | Не делает |
|---|---|---|---|---|
| **Оператор** (Дмитрий, CTO) | — | — | Пишет `intent/<slug>.md`; отвечает на прожарке; три решения: спека да/нет · буква на стоп-точке · гейт (сам открывает продукт) (D12) | Не пересказывает отчёты между приложениями, не пишет PLAN, не ревьюит диф вручную |
| **Тимлид** | Cowork, папка репо привязана (D4) | **Fable 5.1** (D3) | Прожарка по `grilling` → `docs/SPEC-n.md` (шесть секций D15); описывает воркфлоу: что работает, чем доказано, инварианты, стоп-точки (D8); читает STATUS/evidence; ретро фазы (D2) | Не runtime на каждый айтем; не расписывает шаги реализации (D8) |
| **Исполнитель** | Claude Code | **Opus 5.0 в ультракоде** — `"ultracode": true`: reasoning `xhigh` + сам планирует dynamic workflows из сабагентов (D3, 18.09); постоянно, планка — `/usage` после каждой фазы | Plan mode → `docs/PLAN-n.md` коммитом; `/goal` — сам строит воркфлоу и порядок; STOP-маркеры в PROGRESS.md; commit-on-stop | Не верифицирует себя сабагентами (D17); не правит SPEC/PLAN/STATUS (deny) |
| **Evaluator** | Claude Code, отдельный финальный проход из `/accept` (D17) | Haiku (D8), без Write/Edit (D7) | Сверяет диф со SPEC и PLAN по `REVIEW.md`-lite; читает только транскрипт/evidence | Не вызывается исполнителем самому себе (generator/evaluator, не self-verification) |

Adrian (CCO) — вне системы: ни скиллов, ни Cowork, ни intent-папки; видит только выход (D16).

---

## 2. Артефактная цепочка одной фазы (D16)

```
intent/<slug>.md ──grilling в Cowork──▶ docs/SPEC-n.md ──plan mode──▶ docs/PLAN-n.md (commit)
                                                                            │
   оператор: «да» на спеку                                          /goal (Opus 5, max)
                                                                            │
                          PROGRESS.md (STOP: <id>) ◀──── исполнитель ────▶ код + evidence в транскрипте
                                     │                                        │
                          оператор: буква на стоп-точке                    /accept ──▶ evaluator (Haiku, REVIEW.md)
                                                                                          │
                                                                                 STATUS.md → оператор: гейт
```

- `intent.md` — всегда пишет Дмитрий; обязателен при внешнем входе (клиент через Adrian, Эди, инцидент); своя идея — 10-строчная шапка SPEC.
- SPEC — шесть секций: 0 Контекст · 1 Дизайн высокого уровня (без деталей реализации) · 2 Фичи `id · user story · «готово» · команда чека · after: · [P]` · 3 Инварианты и границы · 4 Стоп-точки · 5 Артефакт закрытия (то, что заказчик ЗАПУСКАЕТ) · 6 Открытые вопросы. Фича = вертикальный срез, одно свежее окно контекста (D15).
- PLAN — файлы, порядок, риски, доказательство; критерий: реализует инженер, не видевший разговора; отклонение → обновить PLAN тем же коммитом (D16). Хук plan-sync — только если увидим расхождения.
- `/goal` ≤4000 символов: одно конечное состояние + названный чек (команда → вывод) + ограничения + «stop after N turns» + стоп-точка как выполненный goal (D8). Платное плечо — всегда отдельный `/goal` после решения оператора.
- Одна фаза = один SPEC, один `/goal`; стопы — паузы с постоянной строкой resume; каждая передача пишется для свежей сессии; STATUS отвечает КОГДА закончим.

---

## 3. Дерево репозитория v2 (D11 + D17)

```
two-tier-dev/
├── README.md                       ← переписать под v2 (цикл, роли, kickoff)
├── CHANGELOG.md                    ← оставить, запись «v2»
├── LICENSE · .gitignore            ← как есть
├── bin/
│   └── two-tier-init               ← новый; копирует kit/ в целевой репо (заменяет new-project.sh)
├── kit/                            ← то, что уезжает в каждый проект
│   ├── CLAUDE.md                   ← ≤40 строк (D17), см. §4
│   ├── REVIEW.md                   ← lite: баги · безопасность · соответствие SPEC/PLAN · что считать Important
│   ├── intent/
│   │   └── intent.template.md      ← проблема · желаемый результат · пользователи и системы · ограничения · открытые вопросы
│   ├── docs/
│   │   ├── SPEC.template.md        ← шесть секций D15
│   │   ├── PLAN.template.md        ← файлы · порядок · риски · доказательство
│   │   ├── STATUS.template.md      ← из v1 templates/STATUS.md, + строка «когда закончим»
│   │   ├── PROGRESS.template.md    ← из v1, + формат `STOP: <id>` и resume-строка
│   │   └── PROCESS.template.md     ← Environment (10 вопросов D5+D15) · Money (8 дефолтов из v1) · каталог развилок из v3.22
│   └── .claude/
│       ├── settings.json           ← см. §5
│       ├── agents/
│       │   └── evaluator.md        ← из cwc-long-running-agents; без Write/Edit; знает лестницу Ponytail (D6)
│       ├── hooks/                  ← из cwc-long-running-agents + D17(5)
│       │   ├── verify-gate.py      ← PreToolUse: запись в test-results.json только после Read evidence (default-FAIL)
│       │   ├── commit-on-stop.sh   ← Stop: коммит + запись в PROGRESS.md
│       │   ├── kill-switch.sh      ← PreToolUse: файл AGENT_STOP → блок
│       │   ├── steer.sh            ← SessionStart/UserPromptSubmit: подмешивает STEER.md, если есть
│       │   ├── test-output-filter  ← PreToolUse(Bash): режет тестовый шум, ОСТАВЛЯЕТ строку «N passed»
│       │   └── refuse_sweeping_commands.py ← из v1 (rm -rf, git reset --hard и т.п.), оставить
│       ├── rules/
│       │   └── graphify.md         ← секция, которую graphify claude install пишет в CLAUDE.md (D17(3))
│       └── skills/                 ← вместо commands/ (D17(1)); все с disable-model-invocation: true
│           ├── team-lead/SKILL.md  ← v4, ≤80 строк, только паттерны (D10); карта — на подпись до записи
│           ├── grilling/SKILL.md   ← копия mattpocock/skills (MIT), редактируемая; grill-me — шим, опционально
│           ├── plan-phase/SKILL.md ← шаг 0 фазы: прочитать SPEC в plan mode → PLAN-n.md
│           └── accept/SKILL.md     ← inline-bash: STATUS + evidence → запуск evaluator
├── docs/
│   ├── interview.md                ← дерево дизайна для grilling: контекст · артефакт закрытия · фичи · чеки · Environment (10) · деньги · стоп-точки
│   ├── dev-system.ru.md            ← переписать под v2
│   ├── SPEC-v2.md · PLAN-v2.md     ← спека и план сборки самого кита (первый прогон цикла)
│   └── archive/                    ← БЕЗ CLAUDE.md внутри
│       ├── team-lead-v3.22.md      ← сохранённая карточка Cowork (v3.22) — источник для раскладки
│       ├── team-lead-v3.20.md      ← версия из репо
│       ├── executor-kit-v1/        ← весь старый executor-kit (commands, brain-init скрипты, hot-cache)
│       └── templates-v1/           ← PHASE, report, rulings, runbook-paid-run, standing-prompt, stop-patterns
└── skills/brain-init/              ← удалить из репо (README + M6-deltas → archive/); brain-init M6 заменён примитивами (D7)
```

**Что из v1 куда уходит (ничего не теряется):**

| v1 | v2 | Основание |
|---|---|---|
| `skills/team-lead/SKILL.md` v3.20 (346 стр.) + карточка v3.22 | `docs/archive/`; каждая строка → hook / PROCESS.template / удалить / паттерн в v4 | D10 |
| `executor-kit/claude-config/commands/{plan-phase,report,save,close}` | `kit/.claude/skills/{plan-phase,accept}`; report/save/close — функции commit-on-stop + STATUS | D17(1), D7 |
| `executor-kit/scripts/{refresh-hot-cache,stale-check,context-census,brain-session-end}` + `knowledge/` | archive; SessionStart-хук M6 снят | D7, D17(4) |
| `refuse_sweeping_commands.py` | остаётся в `kit/.claude/hooks/` | детерминированный слой |
| `templates/{PROCESS,STATUS,PROGRESS}` | `kit/docs/*.template.md` (доработаны) | D11 |
| `templates/{PHASE,report,rulings,runbook-paid-run,standing-prompt,stop-patterns}` | archive; PHASE → SPEC; standing-prompt → CLAUDE.md; runbook-paid-run/Money → PROCESS.template §Money; stop-patterns → каталог развилок PROCESS.template | D8, D11 |
| `settings.json` deny-список на docs/* | остаётся, + `Edit(/intent/**)` | D11 |
| `bin/new-project.sh` | `bin/two-tier-init` | D11 |

---

## 4. `kit/CLAUDE.md` — состав (≤40 строк, D17)

1. Факты проекта на каждую сессию (стек, команды запуска/чека, где SPEC/PLAN/STATUS/PROGRESS).
2. Блок верификации: «прогони чек, вставь вывод, чини код — не тест».
3. Строка D8: «Show the command and its output for every check; never report a check as passed without its output in the transcript».
4. Рамки задачи (Opus 5): «Deliver what was asked, at the scope intended; finish the whole task; stop short of actions clearly beyond what was asked».
5. Делегирование: «do not use subagents to verify your own work» остаётся; «keep spawn counts low» **снято** — масштаб задаёт `workflowSizeGuideline`, не промт.
6. Калибровка длины файлов (PROGRESS/STATUS): «match length to what the task needs, no filler sections».
7. Нарратив: одно предложение до первого tool call; апдейт только при важной находке; в конце — итог первым предложением.
8. Compact instructions: сохранять STOP-маркеры, выводы чеков, решения.
9. Стоп-точки: `STOP: <id>` в PROGRESS.md = выполненный goal; постоянная resume-строка.
10. Ссылка на `REVIEW.md` и `.claude/rules/graphify.md`.

**Запрещено в CLAUDE.md и промтах:** «verify with a subagent / double-check / re-verify» (D17).

---

## 5. `kit/.claude/settings.json` — целевое содержимое (D3 от 18.09, D6, D7, D17)

Факты из docs/settings-reference и docs/workflows (обновлены 16–17.09.2026):
- `ultracode` — ключ settings, scope «любой файл»: xhigh + Claude сам планирует workflow для каждой существенной задачи. Имеет приоритет над `effortLevel`/`modelSettings`; **`max` поверх него не ставится**, а `max` в settings и не сохраняется (`maxEffortLevel` — потолок, не выбор).
- `workflowSizeGuideline` — официальная рекомендация масштаба: `small` <5 агентов · `medium` <10 · `large` <50; рантайм-капы 16 одновременно / 1000 за прогон остаются всегда.
- Самописных капов `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` / `SPAWN_DEPTH` в ките **нет** (не подтверждены доками; заменены `workflowSizeGuideline`).
- Кэш агентов workflow — 5 минут даже на подписке → `subagentPromptCacheTtl: "1h"`.
- В bypass-режиме prompt на запуск workflow не показывается; kill-switch и прочие PreToolUse-хуки действуют и на агентов workflow.

```json
{
  "model": "opus",
  "ultracode": true,
  "workflowSizeGuideline": "small",
  "subagentPromptCacheTtl": "1h",
  "autoMemoryEnabled": false,
  "permissions": {
    "deny": [
      "Edit(/docs/STATUS.md)", "Edit(/docs/SPEC-*.md)", "Edit(/docs/PLAN-*.md)",
      "Edit(/docs/PROCESS.md)", "Edit(/docs/reviews/**)", "Edit(/docs/archive/**)",
      "Edit(/intent/**)"
    ]
  },
  "hooks": {
    "PreToolUse": [
      { "matcher": "*",          "hooks": [kill-switch.sh, steer.sh] },
      { "matcher": "Read",       "hooks": [track-read.sh] },
      { "matcher": "Write|Edit", "hooks": [verify-gate.sh] },
      { "matcher": "Bash",       "hooks": [refuse_sweeping_commands.py, test-output-filter, graphify-hint] }
    ],
    "Stop": [ { "hooks": [commit-on-stop.sh] } ]
  }
}
```

- Один судья на Stop — `/goal`; второго блокирующего Stop-hook нет (D7).
- `workflowSizeGuideline: small` — первая неделя; поднимать до `medium` только по итогу `/usage` на ретро.
- **Evidence-правило (следствие ультракода):** промежуточные результаты workflow живут в переменных скрипта, не в транскрипте — поэтому каждый чек пишет вывод в `docs/evidence/<fid>-<check>.txt`, evaluator и `verify-gate` работают по файлам (маски track-read: `*-result.txt`, `*-console.txt`, `*.png`).
- Убрано против v1: `CLAUDE_CODE_EFFORT_LEVEL: xhigh`, `"ultracode": false`, SessionStart brain-init, Stop brain-session-end.

## 6. Среда исполнителя — дефолты (D5, D6, D15)

| Инструмент | Форма | Статус | Условие входа |
|---|---|---|---|
| Context7 | MCP | да | доки библиотек |
| Graphify | скилл (`pip install graphifyy && graphify install`), `/graphify src --wiki`, `graphify hook install` (post-commit, AST, без LLM), MCP-режим ВЫКЛ | да | корпус по `src/` |
| Ponytail | плагин (`/plugin marketplace add DietrichGebert/ponytail` → `/plugin install ponytail@ponytail`, два сообщения), уровень `full`; `/ponytail-review` второй проход на diff | да | — |
| LSP | — | нет | диагностика через `tsc`/`pyright`/`cargo check` в чеке |
| code-simplifier | — | нет | — |
| Браузер | встроенный; Playwright — только evaluator | по фиче | UI-чек |
| Прочие MCP | — | нет по умолчанию | CLI; MCP лишь без CLI |
| Параллелизм | ультракод: workflow-скрипты из сабагентов внутри одной сессии (D3 18.09), масштаб — `workflowSizeGuideline`; вторая worktree-сессия оператора — не нужна; agent teams — нет | по фазе | 10-й вопрос Environment = какой size guideline фазе |
| Plugin Покока целиком (37 скиллов) | — | нет | только `grilling` копией; `diagnosing-bugs` — прочитать перед первым Maintain |

Полная прожарка и полный разбор Environment — один раз на kickoff проекта; каждая следующая фаза — только открытый ею фронтир и дельта среды (D5, уточнено 18.09). Environment в PROCESS.md — таблица `инструмент · форма · требующая фича/чек · установка · удаление`; инструмент входит только под названный чек или фичу и **уходит**, когда ни одна фича новой фазы его не называет; дельту печатает `plan-phase`, применяет исполнитель первым $0-коммитом фазы.

**Из плейбука Anthropic НЕ берём:** managed settings, OTel, evals в CI, Claude Security, автономный Maintain по control bands (D16).

---

## 7. Приёмка и строгость (D7, D9, D17)

- Старт — лёгкая: `/goal` + evaluator из `/accept` по `REVIEW.md`.
- Строгий Stop-hook с evaluator'ом — только если фичи начнут закрываться без evidence (D9).
- Правило роста закона: новое правило — только при повторе той же ошибки без него, и сначала как hook (D10; заменяет §10 v3.22).
- Метрики (D13): фичи на экране в неделю; часы оператора на фичу; sweep effort на Opus 5 (`low/medium/high/max` × ±Ponytail, 3 задачи, `/cost`); `/context` после kickoff как гейт размера; `/skill-doctor` на ретро фазы.
- Предохранитель лимитов (D3, 18.09): ультракод постоянно; зарегистрированная планка — `/usage` после каждого фазового прогона первую неделю; недельный лимит уходит до четверга → вопрос на ретро (кандидаты: `workflowSizeGuideline` ниже, `/effort high` на рутину), не раньше.

---

## 8. Порядок сборки сегодня (первый прогон цикла на самом себе)

1. **intent** — handoff 10c переписывается в `intent/two-tier-dev-v2.md` (10 мин, тимлид).
2. **grilling** — прожарка здесь только по открытым вопросам сборки (карта v4; что из cwc берём как есть; судьба brain-init-модулей вне two-tier; точные ключи settings).
3. **SPEC-v2** — шесть секций; фичи-срезы примерно: F1 дерево `kit/` + templates · F2 `.claude/` (settings, hooks, evaluator, rules) · F3 skills (grilling копия, plan-phase, accept) · F4 team-lead v4 + archive · F5 README/docs/`bin/two-tier-init` · F6 sweep effort. `after:`/`[P]` расставляются в SPEC.
4. **Подпись оператора** на SPEC-v2 и на карту v4 (D10: до записи в репо).
5. **Исполнитель**: plan mode → `docs/PLAN-v2.md` коммитом → один `/goal` на Opus 5 `max`, точный текст предиката verbatim в коде.
6. **/accept** → evaluator → STATUS → гейт: `bin/two-tier-init` разворачивает кит в пустой тестовый репо, `/context` показывает размер.
7. Только после гейта — новая сессия `/team-lead` на первом брифе AD Allianz.

---

## 9. Открытые вопросы (закрыть на прожарке §8.2)

1. Карта team-lead v4 — черновик до записи.
2. Модули brain-init вне two-tier — архив или отдельный репо.
3. ~~Ключи settings~~ — закрыто 18.09 по docs/settings-reference.
4. Лимиты на Opus 5 `max` — оценка после первой недели.
5. Какой бриф AD Allianz первый — критерии: Эди открывает сам · объективный чек · без платной инфраструктуры · 1–2 недели.
