---
name: accept
description: "Приёмка фазы: факты (дифф, evidence, бюджеты, CI), вердикт — сохранённый воркфлоу /verify-phase в свежем claude -p из свежего клона, лимит 30 мин, отчёт в docs/evidence/verify-<sha>.txt. Вызывает тимлид или оператор."
disable-model-invocation: true
---

# /accept [<база>] — приёмка воркфлоу /verify-phase

Исполнитель себя не принимает: вердикт выносит сохранённый воркфлоу `/verify-phase` (`.claude/workflows/verify-phase.js`) в свежем `claude -p` из свежего клона запушенного HEAD. По каждой фиче SPEC — свежий прогон её чека, пограничные случаи против «готово» и мутация в продукте; проверяющие — `claude-sonnet-5-5`, судья — `claude-opus-5-5`. STATUS ведёт тимлид; этот скилл его не пишет.

## 1. Факты — в транскрипт
База — аргумент (`$ARGUMENTS`), иначе `git merge-base main HEAD`.

```bash
BASE=<база>; SHA=$(git rev-parse --short HEAD)
git --no-pager log --format='%h %s' "$BASE"..HEAD
git --no-pager diff --stat "$BASE"..HEAD
grep -H -E '_OK|_FAIL|STOP:' docs/evidence/*-result.txt
bin/check-budget
bin/check-ci "$(git branch --show-current)"
```

Чек без файла evidence или без маркера в нём — первая находка, ещё до воркфлоу.

## 2. Вердикт — `/verify-phase`
```bash
bin/verify-phase   # свежий клон, гейт фазы, claude -p с allow Workflow(verify-phase), лимит 30 мин (1800 с)
bin/verify-phase F2 F4   # точечный повтор после починки — только эти фичи
```

Лаунчер пишет отчёт в `docs/evidence/verify-<SHA>.txt`, точечный — в `verify-<SHA>-F2-F4.txt`. Первая строка — `VERDICT: PASS` или `VERDICT: NEEDS_WORK`, вторая — `FEATURES:` с фичами вердикта; блокирующих судьи не больше пяти по `REVIEW.md`, остальное — `Named, not built`. Код блокирует сам: выжившая мутация, красный чек, пункт без своей команды проверяющего и её сырого вывода. Лимит истёк — `VERIFY_TIMEOUT`, вердикта нет: это находка «приёмка не уложилась в 30 мин». Воркфлоу недоступен — свежий субагент `evaluator` по `REVIEW.md`, вердикт — в `docs/evidence/accept-<SHA>.txt`.

## 3. Коммит
`git add docs/evidence/verify-<SHA>.txt && git commit -m "accept: <вердикт> <SHA>"`, затем push ветки. На `NEEDS_WORK` в этой сессии ничего не чинить: блокирующие находки — вход следующего запуска фазы.

Оператору — три строки: вердикт · чем доказано (файлы) · что дальше.
