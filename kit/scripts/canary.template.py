#!/usr/bin/env python3
"""canary.template.py — канарейка (SPEC-v3.4 F4.3; образец — канарейка проекта telefon): скопировать в scripts/canary.py, deploy/canary.timer — раз в день.

CANARY_CMD — эталонный прогон через настоящий конвейер продукта; его вывод несёт строку `CANARY_MESS p95=<мс> word_max=<мс> rot=<k>`. Судья — ключ `canary` файла checks/planken.json:
`p95_gelb_ms` (выше — GELB в письме, не красное), `word_max_rot_ms` (выше — красное), `timeout_s` (не больше 60: итог канарейки ≤ 60 с). Прогон повис, строки нет, rot>0, word_max выше —
`CANARY_ROT grund=<timeout|stand|rot|word_max> …`, код 1: красное письмо — инцидент (воспроизвести и атрибутировать), не Named. Зелёный — `CANARY_OK p95= rot=0`, с `GELB p95>…`, код 0.
Письмо — итог строкой: тема `<проект> Kontrolle: OK|GELB|ROT`, CANARY_SMTP (host:port, по умолчанию 127.0.0.1:1025), CANARY_AN (адрес), CANARY_PROJEKT. Письмо не ушло — `CANARY_BRIEF_FEHLER <тип>`, код итога не меняется.
Пустой ключ порога — `CANARY_ROT grund=planken`.
"""
import json, os, re, shlex, smtplib, subprocess, sys, time
from email.message import EmailMessage

MAX_S = 60


def thresholds():
    with open(os.environ.get("CANARY_PLANKEN", "checks/planken.json"), encoding="utf-8") as f:
        c = json.load(f).get("canary") or {}
    return c.get("p95_gelb_ms"), c.get("word_max_rot_ms"), min(c.get("timeout_s") or MAX_S, MAX_S)


def measure(cmd, timeout):
    try:
        r = subprocess.run(shlex.split(cmd), capture_output=True, text=True, errors="replace", timeout=timeout, stdin=subprocess.DEVNULL)
        return r.stdout, None
    except subprocess.TimeoutExpired:
        return "", "timeout"
    except OSError:
        return "", "stand"


def verdict(out, why, gelb, rot_ms):
    m = re.search(r"^CANARY_MESS p95=(\d+) word_max=(\d+) rot=(\d+)\s*$", out, re.M)
    p95, wm, rot = (int(m[1]), int(m[2]), int(m[3])) if m else (None, None, None)
    tail = f"p95={p95 if p95 is not None else '-'} word_max={wm if wm is not None else '-'} rot={rot if rot is not None else '-'}"
    if why or not m:
        return False, f"CANARY_ROT grund={why or 'stand'} {tail}"
    if rot:
        return False, f"CANARY_ROT grund=rot {tail}"
    if wm > rot_ms:
        return False, f"CANARY_ROT grund=word_max {tail}"
    return True, f"CANARY_OK {tail}" + (f" GELB p95>{gelb}" if p95 > gelb else "")


def letter(line):
    state = "ROT" if line.startswith("CANARY_ROT") else "GELB" if " GELB " in line else "OK"
    m = EmailMessage()
    m["From"] = "canary@localhost"
    m["To"] = os.environ.get("CANARY_AN", "ops@localhost")
    m["Subject"] = f"{os.environ.get('CANARY_PROJEKT', 'Projekt')} Kontrolle: {state}"
    m.set_content(f"{line}\n\nTäglicher Kontrolllauf durch den echten Ablauf. ROT = Vorfall: nachstellen und zuordnen.\n")
    return m


def main():
    t0 = time.monotonic()
    try:
        gelb, rot_ms, timeout = thresholds()
    except (OSError, ValueError, AttributeError):
        gelb, rot_ms, timeout = None, None, MAX_S
    if not isinstance(gelb, (int, float)) or not isinstance(rot_ms, (int, float)):
        ok, line = False, "CANARY_ROT grund=planken p95=- word_max=- rot=-"
    else:
        out, why = measure(os.environ.get("CANARY_CMD", ""), timeout)
        ok, line = verdict(out, why, gelb, rot_ms)
    print(f"{line} sekunden={time.monotonic() - t0:.0f}", flush=True)
    host, _, port = os.environ.get("CANARY_SMTP", "127.0.0.1:1025").partition(":")
    try:
        with smtplib.SMTP(host, int(port or 25), timeout=10) as s:
            s.send_message(letter(line))
    except (OSError, ValueError) as e:
        print(f"CANARY_BRIEF_FEHLER {type(e).__name__}", flush=True)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
