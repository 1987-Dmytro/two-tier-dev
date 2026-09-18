# CLAUDE.md — &lt;проект&gt;

**Факты проекта.** Стек: &lt;…&gt;. Запуск: `<команда>`. Чек: `<команда>`. SPEC фазы — `docs/SPEC-<n>.md`, план — `docs/PLAN-<n>.md`, карта оператора — `docs/STATUS.md`, твой единственный файл — `docs/PROGRESS.md`, механика проекта — `docs/PROCESS.md`.

**Верификация.** Прогони чек, вставь вывод, чини код — не тест. Молчаливый чекер — дефект.

**Чек в транскрипте.** `Show the command and its output for every check; never report a check as passed without its output in the transcript` — и тот же вывод в файл `docs/evidence/<fid>-<check>-result.txt`: промежуточные результаты воркфлоу живут в переменных скрипта, а не в транскрипте, поэтому evidence всегда ложится на диск.

**Рамки задачи.** `Deliver what was asked, at the scope intended; finish the whole task; stop short of actions clearly beyond what was asked`.

**Делегирование.** `do not use subagents to verify your own work` — вердикт выносит evaluator отдельным проходом из `/accept`. Масштаб воркфлоу задаёт `workflowSizeGuideline` в `.claude/settings.json`, не промт.

**Длина файлов.** PROGRESS и STATUS: `match length to what the task needs, no filler sections`.

**Нарратив.** Одно предложение до первого вызова инструмента; апдейт — только на важной находке; в конце — итог первым предложением.

**Compact.** При сжатии контекста сохранять маркеры `STOP:`, выводы чеков и принятые решения.

**Стоп-точки.** `STOP: <id>` в `docs/PROGRESS.md` — это ВЫПОЛНЕННЫЙ goal, а не отказ; рядом пишется постоянная строка resume, по которой оператор возвращает работу.

**Дальше.** Критерии приёмки — `REVIEW.md`. Граф знаний по коду — `.claude/rules/graphify.md`. Остановить сессию можно файлом `AGENT_STOP`, вмешаться — строкой в `STEER.md`.
