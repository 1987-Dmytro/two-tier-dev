#!/usr/bin/env python3
"""canary.template.py — канарейка (SPEC-v3.4 F4.3; образец — канарейка проекта telefon): скопировать в scripts/canary.py, deploy/canary.timer — раз в день.

CANARY_CMD — эталонный прогон через настоящий конвейер продукта; его вывод несёт строки `CANARY_MESS p95=<мс> word_max=<мс> rot=<k>`, судятся все: худшие p95, word_max и rot. Судья — ключ `canary` файла checks/planken.json:
`p95_gelb_ms` (выше — GELB в письме, не красное), `word_max_rot_ms` (выше — красное), `timeout_s` (пусто — потолок RUN_S). Итог ≤ 60 с: прогон получает не больше MAX_S минус таймаут письма SMTP_S и секунду на запуск и снятие; строка итога и код — до письма. SMTP_S — на операцию SMTP: молчащий или отказавший сервер укладывается в MAX_S, медленный живой — нет, вердикт и код это не меняет.
Прогон повис — grund=timeout; код прогона не 0 (и при зелёной строке), строки нет или она битая, CANARY_CMD пуста или не разбирается — grund=stand; rot>0 — grund=rot; word_max выше — grund=word_max:
`CANARY_ROT grund=<timeout|stand|rot|word_max> …`, код 1: красное письмо — инцидент (воспроизвести и атрибутировать), не Named. Зелёный — `CANARY_OK p95= rot=0`, с `GELB p95>…`, код 0.
Письмо — итог строкой: тема `<проект> Kontrolle: OK|GELB|ROT`, CANARY_SMTP (host:port, по умолчанию 127.0.0.1:1025), CANARY_AN (адрес), CANARY_PROJEKT. Письмо не ушло — `CANARY_BRIEF_FEHLER <тип>`, код итога не меняется.
Пустой или нечисловой порог, нечисловой timeout_s — `CANARY_ROT grund=planken`, письмо то же.
"""
import json, os, re, shlex, smtplib, subprocess, sys, time
from email.message import EmailMessage

MAX_S, SMTP_S = 60, 10
RUN_S = MAX_S - SMTP_S - 1


def thresholds():
    with open(os.environ.get("CANARY_PLANKEN", "checks/planken.json"), encoding="utf-8") as f:
        c = json.load(f).get("canary") or {}
    gelb, rot_ms, t = c.get("p95_gelb_ms"), c.get("word_max_rot_ms"), c.get("timeout_s")
    t = RUN_S if t is None else t
    if not all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in (gelb, rot_ms, t)):
        raise ValueError("planken")
    return gelb, rot_ms, min(t, RUN_S)


def measure(cmd, timeout):
    try:
        r = subprocess.run(shlex.split(cmd), capture_output=True, text=True, errors="replace", timeout=timeout, stdin=subprocess.DEVNULL)
        return r.stdout, "stand" if r.returncode else None
    except subprocess.TimeoutExpired:
        return "", "timeout"
    except (OSError, ValueError, IndexError):  # нет команды, незакрытая кавычка, пустая строка
        return "", "stand"


def verdict(out, why, gelb, rot_ms):
    ms = re.findall(r"^CANARY_MESS p95=(\d+) word_max=(\d+) rot=(\d+)\s*$", out, re.M)
    broken = len(re.findall(r"^CANARY_MESS\b", out, re.M)) != len(ms)
    p95, wm, rot = [max(map(int, c)) for c in zip(*ms)] if ms else (None, None, None)
    tail = f"p95={p95 if p95 is not None else '-'} word_max={wm if wm is not None else '-'} rot={rot if rot is not None else '-'}"
    if why or not ms or broken:
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
        ok, line = False, "CANARY_ROT grund=planken p95=- word_max=- rot=-"
    else:
        out, why = measure(os.environ.get("CANARY_CMD", ""), timeout)
        ok, line = verdict(out, why, gelb, rot_ms)
    print(f"{line} sekunden={time.monotonic() - t0:.0f}", flush=True)
    host, _, port = os.environ.get("CANARY_SMTP", "127.0.0.1:1025").partition(":")
    try:
        with smtplib.SMTP(host, int(port or 25), timeout=SMTP_S) as s:
            s.send_message(letter(line))
    except (OSError, ValueError) as e:
        print(f"CANARY_BRIEF_FEHLER {type(e).__name__}", flush=True)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
