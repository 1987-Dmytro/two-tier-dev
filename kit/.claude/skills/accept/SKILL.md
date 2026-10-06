---
name: accept
description: "Приёмка фазы: факты (дифф, evidence, бюджеты, CI), свежий evaluator по REVIEW.md, вердикт в docs/evidence/accept-<sha>.txt. Вызывает тимлид или оператор."
disable-model-invocation: true
---

# /accept [<база>] — приёмка свежим evaluator'ом

Исполнитель себя не принимает: вердикт выносит субагент `evaluator` (`.claude/agents/evaluator.md`, без Write и Edit), свежий на каждой приёмке — новый вызов, не продолжение прошлого. STATUS ведёт тимлид; этот скилл его не пишет.

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

Чек без файла evidence или без маркера в нём — первая находка, ещё до evaluator'а.

## 2. Evaluator
Субагент типа `evaluator`, задача дословно:

> Прими фазу: дифф `<BASE>..HEAD` против `docs/SPEC-<n>.md` и `docs/PLAN-<n>.md` по `REVIEW.md`. Открой каждый `docs/evidence/*-result.txt` и смотри, что он напечатал, а не что обещает имя. Первым словом — `PASS` или `NEEDS_WORK` отдельной строкой; дальше находки по формату `REVIEW.md`: блокирующих не больше пяти, остальное — `Named, not built`.

## 3. Вердикт
Ответ evaluator'а дословно — в `docs/evidence/accept-<SHA>.txt`, первой строкой `база <BASE> · HEAD <SHA>`. Затем `git add docs/evidence/accept-<SHA>.txt && git commit -m "accept: <вердикт> <SHA>"`. На `NEEDS_WORK` в этой сессии ничего не чинить: блокирующие находки — вход следующего `/goal`.

Оператору — три строки: вердикт · чем доказано (файлы) · что дальше.
