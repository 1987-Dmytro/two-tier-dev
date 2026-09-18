---
name: accept
description: "Приёмка фазы: собрать дифф, evidence и STATUS, отдать их evaluator'у по REVIEW.md, записать вердикт. Вызывает оператор после гейта."
disable-model-invocation: true
---

# /accept &lt;базовый коммит фазы&gt; — приёмка

Отдельный финальный проход. Исполнитель не проверяет себя: вердикт выносит evaluator, у которого нет Write и Edit.

## 1. Собрать факты — одной командой, вывод в транскрипт

```bash
BASE=<базовый коммит фазы>
git --no-pager log  --oneline $BASE..HEAD
git --no-pager diff --stat $BASE..HEAD
ls -l docs/evidence/*-result.txt
grep -HE '_OK|FAIL|ERROR|STOP:' docs/evidence/*-result.txt
sed -n '1,15p' docs/STATUS.md 2>/dev/null || echo "docs/STATUS.md ещё нет"
```

Чек, у которого нет файла в `docs/evidence/` или нет маркера в файле, не считается пройденным — это первая находка приёмки, до всякого evaluator'а.

## 2. Прочитать evidence инструментом Read

Каждый файл `docs/evidence/*-result.txt` — инструментом Read, не `cat`: маска `*-result.txt` у `track-read.sh` засчитывает именно прочтение, и на нём стоит `verify-gate`.

## 3. Запустить evaluator

Сабагент типа `evaluator` (`.claude/agents/evaluator.md`), задача дословно:

> Сверь дифф `<BASE>..HEAD` со `docs/SPEC-<n>.md` и `docs/PLAN-<n>.md` по `REVIEW.md`. Evidence — в `docs/evidence/*-result.txt`, открой каждый и смотри, что он напечатал, а не что обещает имя файла. Первым словом ответа — `PASS` или `NEEDS_WORK` на отдельной строке.

## 4. Записать результат

- `PASS` → обновить `docs/STATUS.md` (инструментом Write, файл целиком: правила `deny` запрещают `Edit`): состояние фичей, строка «Когда закончим», дата гейта и строка запуска для оператора. Дальше — решение оператора: он сам открывает продукт.
- `NEEDS_WORK` → находки в `docs/PROGRESS.md`, раздел `## Next — ONE item`, по одной строке с командой, которая их закроет. В этой же сессии ничего не чинить: починка — следующий `/goal`.

Отчёт оператору — три строки: вердикт · что доказано и каким файлом · что остаётся. Коммит предложить, но не делать.
