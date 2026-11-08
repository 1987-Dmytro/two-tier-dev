#!/usr/bin/env bash
# paired_stand.sh <база-sha> -- <стенд> [аргументы…] — пара одного часа (SPEC-v3.4 F5.1, K76; образец — парные прогоны проекта telefon): планка на звене вендора судится разницей база/новый, а не абсолютным перцентилем одного стенда.
# База — `git archive <sha>` во временном каталоге /tmp/two-tier-v3 (снимается на выходе), новый код — рабочее дерево; игнорируемое git база видит симлинками, условия сторон те же. Стенд идёт в корне своего дерева попеременно: база, новый, база, новый; выборка — токены `ms=<целое>` его stdout, stderr идёт мимо суда.
# Правило — checks/planken.json, pair.max_diff_p50_ms и pair.max_diff_p95_ms (файл тимлида): чисел нет — `PAIR_FAIL` без единого прогона; есть — строка `PAIR_RULE` до первого прогона.
# Разница = новый − база, перцентили — nearest rank; новый быстрее базы — не провал. Итог — `PAIR_OK|PAIR_FAIL diff_p50=<мс> diff_p95=<мс> …`, код 0|1; красный или пустой прогон — `PAIR_FAIL`. Интервал часа кодом не судится: его держит чередование. bash 3.2: так идёт /bin/bash на macOS.
set -uo pipefail

if [ $# -lt 3 ] || [ "$2" != "--" ]; then
  echo "usage: checks/paired_stand.sh <база-sha> -- <стенд> [аргументы…]"
  exit 2
fi
BASE=$1
shift 2
STAND=("$@")

fail() {
  echo "PAIR_FAIL $1"
  exit 1
}

rule() {  # два числа правила или пусто
  python3 -I - <<'PY'
import json
try:
    pair = json.load(open("checks/planken.json", encoding="utf-8")).get("pair") or {}
    vals = [pair.get("max_diff_p50_ms"), pair.get("max_diff_p95_ms")]
except (OSError, ValueError, AttributeError):
    vals = []
if len(vals) == 2 and all(type(v) in (int, float) and v >= 0 for v in vals):
    print(*vals)
PY
}

samples() {  # токены ms=<целое> файла $1 — в файл стороны $2; на вывод — их счёт
  python3 -I - "$1" "$2" <<'PY'
import re, sys
found = re.findall(r"(?<![\w.])ms=(\d+)(?![\w.])", open(sys.argv[1], encoding="utf-8", errors="replace").read())
open(sys.argv[2], "a").write("".join(v + "\n" for v in found))
print(len(found))
PY
}

judge() {  # итоговая строка и код по файлам сторон
  python3 -I - "$WORK/basis.ms" "$WORK/neu.ms" "$MAX50" "$MAX95" <<'PY'
import sys
basis, neu = [sorted(int(v) for v in open(p).read().split()) for p in sys.argv[1:3]]
pct = lambda xs, q: xs[(q * len(xs) + 99) // 100 - 1]  # nearest rank: ранг = ⌈q·n/100⌉, целыми — без ошибки плавающей точки
d50, d95 = pct(neu, 50) - pct(basis, 50), pct(neu, 95) - pct(basis, 95)
ok = d50 <= float(sys.argv[3]) and d95 <= float(sys.argv[4])
print(f"{'PAIR_OK' if ok else 'PAIR_FAIL'} diff_p50={d50} diff_p95={d95} basis_p50={pct(basis, 50)} neu_p50={pct(neu, 50)} basis_p95={pct(basis, 95)} neu_p95={pct(neu, 95)} n={len(basis)}/{len(neu)}")
sys.exit(0 if ok else 1)
PY
}

run() {  # сторона, каталог, номер прогона
  ( cd "$2" && "${STAND[@]}" ) > "$WORK/out" < /dev/null || fail "стенд упал: $1, прогон $3, rc=$?"
  local n
  n=$(samples "$WORK/out" "$WORK/$1.ms")
  echo "PAIR_RUN $1 $3 n=$n"
  [ "$n" -gt 0 ] || fail "нет выборки: $1, прогон $3 — ни одного токена ms=<целое>"
}

TOP=$(git rev-parse --show-toplevel 2>/dev/null) || fail "не репозиторий git"
cd "$TOP" || fail "нет корня репозитория"
RULE=$(rule)
[ -n "$RULE" ] || fail "правило не задано (checks/planken.json: pair.max_diff_p50_ms, pair.max_diff_p95_ms)"
MAX50=${RULE% *}
MAX95=${RULE#* }
SHA=$(git rev-parse --verify --quiet "$BASE^{commit}") || fail "нет коммита базы: $BASE"
mkdir -p /tmp/two-tier-v3
WORK=$(mktemp -d /tmp/two-tier-v3/paired-stand-XXXXXX) || fail "нет временного каталога"
trap 'rm -rf "$WORK"' EXIT
mkdir "$WORK/basis"
git archive "$SHA" | tar -x -C "$WORK/basis" || fail "git archive базы ${SHA:0:7}"
while IFS= read -r -d '' f; do  # зависимости, .env и кэши вне git — те же у обеих сторон
  f=${f%/}
  mkdir -p "$WORK/basis/$(dirname "$f")" && ln -s "$TOP/$f" "$WORK/basis/$f" 2>/dev/null
done < <(git ls-files -z --others --ignored --exclude-standard --directory)

echo "PAIR_RULE diff_p50 ≤ $MAX50 мс, diff_p95 ≤ $MAX95 мс · база ${SHA:0:7} · прогоны: база, новый, база, новый"
for k in 1 2; do
  run basis "$WORK/basis" "$k"
  run neu "$TOP" "$k"
done
judge
exit $?
