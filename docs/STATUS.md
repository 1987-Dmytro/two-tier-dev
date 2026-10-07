# STATUS — two-tier-dev — фаза v3.1 «ultracode по полной» (файл тимлида; пишется на приёмке)

**Когда закончим:** v3.1 — сегодня, 07.10, к вечеру: плечо под ultracode ~1,5–2 ч → приёмка до 1 ч (`/verify-phase` ≤ 30 мин и мои прогоны) → твой гейт ~15 мин → merge через PR. Не успеваем сегодня — до обеда 08.10. Перевод projekt_1_telefon — 08.10 под ultracode, если после v3.1 неделя ≤ 60 %; иначе после сброса лимитов 13.10, 17:00. Сдвинуть даты могут твоё окно, лимиты недели и стоп исполнителя.
**Где мы:** кит v3 принят и смержен (PR #1, `main` @ `7957d68`). Раунд планок закрыт 07.10: лимит недели на v3.1 — 40 %, `/verify-phase` — 30 мин, хвост (5) — в фазе. SPEC-v3.1, INTENT (N2, D4), PROCESS (Environment и строка запуска), `.claude/launch.settings.json` и GOAL — коммит «Тимлид:» на ветке `v3.1`.
**Окружение исполнителя — сверено замером 07.10:** MCP — только `context7` (stdio, connected); плагины — Ponytail, pyright-lsp, pr-review-toolkit (поставлен 07.10); выключены commit-commands, security-guidance, frontend-design, `brain-init` и 20 скиллов Cowork; MCP `ref` и `blockscout` срезаны.
**Решение оператора:** запусти плечо v3.1 — шаги ниже.
**Запуск v3.1:**
1. `/usage` в любой сессии Claude Code — пришли неделю и окно 5 ч (точка «до»).
2. Закрой старое окно исполнителя (Ctrl+D).
3. `mkdir -p /tmp/two-tier-v3 && cd ~/Desktop/Projects/two-tier-dev && git switch v3.1 && ENABLE_CLAUDEAI_MCP_SERVERS=false claude --permission-mode auto --model claude-opus-5-5 --effort ultracode --settings .claude/launch.settings.json --strict-mcp-config --mcp-config '{"mcpServers":{"context7":{"command":"npx","args":["-y","@upstash/context7-mcp"]}}}' --add-dir /tmp/two-tier-v3` — баннер «Opus 5.5 with xhigh effort», маскот фиолетовый; `/mcp` — один `context7`.
4. Набери `/goal ` и вставь `docs/GOAL.txt` целиком.

После плеча — `/usage` ещё раз и «отчёт готов» в свежую сессию тимлида.

| Фича | Что видит оператор | Состояние | Evidence |
|---|---|---|---|
| F1 | исполнитель под ultracode на документированных полях | ⏳ | `docs/evidence/F1-*` |
| F2 | у исполнителя ровно инструменты таблицы Environment — по `system/init` | ⏳ | `docs/evidence/F2-*` |
| F3 | стоп-кран, подсказка, deny и отказ широких команд держат и агентов воркфлоу | ⏳ | `docs/evidence/F3-*` |
| F4 | `/verify-phase` выносит вердикт фазы не дольше 30 мин | ⏳ | `docs/evidence/F4-*` |
| F5 | `/accept` — воркфлоу из свежего клона | ⏳ | `docs/evidence/F5-*` |
| F6 | фаза под ultracode рождается из шаблонов | ⏳ | `docs/evidence/F6-*` |
| F7 | правка файла тимлида не проходит молча (хвосты 3 и 5) | ⏳ | `docs/evidence/F7-*` |
| F8 | v3.1 понятен за 10 минут | ⏳ | `docs/evidence/F8-*` |
| F9 | кит v3.1 работает на пустом репо | ⏳ | `docs/evidence/F9-*` |
| гейт | ты: сессия строкой запуска — баннер и `/mcp`; `/verify-phase` на фикстуре с дефектом находит его, на чистой молчит; судишь по S1, S3, S5 | после приёмки | — |

**Приёмка:** `/verify-phase` из свежего клона (≤ 30 мин) плюс мои прогоны; ревью — `docs/reviews/v3.1-1.md`.
**Деньги:** 0 — подписка. **Лимиты:** фикс-раунд 2 v3 — неделя 9 → 9 %, окно 5 ч 8 → 9 %; v3.1 — планка 40 % недели, точки «до» и «после» — твои `/usage`.
**Честно:**
- S3 фазы v3 — красная: приёмки ~5 ч 15 мин против плеч ~1 ч 45 мин; почти всё — первая приёмка без лимита времени. Лекарство — `/verify-phase` с лимитом 30 мин, меряем на v3.1.
- Context7 из плагина в `claude -p` требует OAuth (`needs-auth`), поэтому у исполнителя stdio-пакет `@upstash/context7-mcp`. Q2′ называл плагин — подмена по замеру.
- `.claude/launch.settings.json` в корне репо — новый файл тимлида: `enabledPlugins`, `skillOverrides`, deny на файлы тимлида и `autoMode.environment` этого репо.

**Строка следующей сессии тимлида:** «/team-lead — приёмка v3.1 (ветка v3.1, голова docs/PROGRESS.md); /usage до: неделя __ %, 5 ч __ %; после: неделя __ %, 5 ч __ %».
