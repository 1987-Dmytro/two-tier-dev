#!/usr/bin/env python3
"""PreToolUse(Bash) guard v2 — refuses sweeping stage/format by BEHAVIOUR, not by spelling.

v1 matched four literal strings anywhere in the text: it blocked commit messages that merely
mentioned them (Dv874) and let seven other spellings of the same sweep through (Dv875). v2 parses
each command segment and judges its first tokens. Both directions in tests/test_hooks.py.
Hook contract: exit 2 blocks the call, stderr goes back to Claude; exit 0 passes.
"""
import json
import os
import re
import shlex
import sys

STAGE_SWEEPS = {"-A", "--all", "-u", "--update", ".", ":/", ":/.", ":."}
DIR_SWEEPS = {".", "src", "tests", "scripts", "config", "docs", "results", "knowledge"}


def refuse(msg: str) -> None:
    print(f"refused by hook: {msg}", file=sys.stderr)
    sys.exit(2)


def tokens_of(segment: str) -> list[str]:
    try:
        toks = shlex.split(segment)
    except ValueError:
        toks = segment.split()
    while toks and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", toks[0]):
        toks.pop(0)  # leading env assignments
    return toks


def strip_git_globals(toks: list[str]) -> list[str]:
    i = 1
    while i < len(toks):
        if toks[i] in ("-C", "-c", "--git-dir", "--work-tree"):
            i += 2
        elif toks[i].startswith("-"):
            i += 1
        else:
            break
    return toks[i:]


WRAPPERS = {"env", "command", "exec", "nohup", "time", "sudo", "builtin", "nice", "xargs"}


def check_segment(segment: str) -> None:
    toks = tokens_of(segment)
    while toks and (os.path.basename(toks[0]) in WRAPPERS or re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", toks[0]) or (toks[0].startswith("-") and len(toks) > 1)):
        toks = toks[1:]  # v3.3: `env git …`, `command git …`, `env A=1 git …` — судим саму команду
    if not toks:
        return
    head = os.path.basename(toks[0])
    if head in ("bash", "sh", "zsh", "dash") and "-c" in toks[1:]:  # `bash -c "…"` — судим строку команды
        for sub in re.split(r"&&|\|\||;|\|", toks[toks.index("-c") + 1] if toks.index("-c") + 1 < len(toks) else ""):
            check_segment(sub)
        return
    if head == "git" and any("core.hooksPath" in t for t in toks[1:]):
        refuse("core.hooksPath is the wiring of the kit's commit and push judges: do not change or bypass it (SPEC-v3.3 F2)")
    if head == "git":
        rest = strip_git_globals(toks)
        if rest and rest[0] in ("add", "stage"):
            args = rest[1:]
            if not args or any(a in STAGE_SWEEPS or a.startswith(":/") for a in args):
                refuse("stage BY PATH (git add <file>...), never the whole tree: a commit carries the exact paths it changes")
        # v3.3, F2.3: force-push по написанию (поведение держит .githooks/pre-push); --no-verify обошёл бы хуки git кита
        if rest and rest[0] == "push" and any(a in ("-f", "--mirror") or a.startswith("--for")  # --force и его префиксы: --forc, --force-with-l
                                              or (a.startswith("+") and len(a) > 1) or (re.fullmatch(r"-[a-zA-Z]*f[a-zA-Z]*", a) is not None) for a in rest[1:]):
            refuse("no force-push: fix-ups are new commits on top (SPEC §3)")
        if rest and rest[0] in ("commit", "push", "merge") and any(a.startswith("--no-ve") or (rest[0] == "commit" and re.fullmatch(r"-[a-zA-Z]*n[a-zA-Z]*", a)) for a in rest[1:]):
            refuse("no --no-verify: the kit's git hooks judge every commit and push (SPEC-v3.3 F2)")
    elif head == "make":
        if "fmt" in toks[1:]:
            refuse("repo-wide format is forbidden (producer pins) — ruff format <the one file you touched>")
    elif head == "ruff" or (head.startswith("python") and toks[1:3] == ["-m", "ruff"]):
        rest = toks[1:] if head == "ruff" else toks[3:]
        if rest and rest[0] == "format":
            args = [a for a in rest[1:] if not a.startswith("-")]
            if not args or any(a in DIR_SWEEPS or a.rstrip("/") in DIR_SWEEPS or os.path.isdir(a) for a in args):
                refuse("repo-wide format is forbidden (producer pins) — name the ONE file you touched")


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return
    cmd = (payload.get("tool_input") or payload).get("command", "") or ""
    # v3.3, F2: обойти хуки git можно только --no-verify или core.hooksPath — их ищем в сыром тексте: подоболочка, eval, bash -lc,
    # timeout N не прячут; упоминание в echo тоже отказывается — дешевле, чем дыра (.githooks/pre-push держит force-push поведением)
    if re.search(r"\bgit\b", cmd) and re.search(r"--no-ve[a-z]*\b", cmd):  # git берёт однозначный префикс: --no-verif, --no-veri
        refuse("no --no-verify: the kit's git hooks judge every commit and push (SPEC-v3.3 F2)")
    if re.search(r"\bgit\b", cmd) and re.search(r"core\.hooksPath", cmd, re.I):
        refuse("core.hooksPath is the wiring of the kit's commit and push judges: do not change or bypass it (SPEC-v3.3 F2)")
    for segment in re.split(r"&&|\|\||;|\|", cmd):
        check_segment(segment)


if __name__ == "__main__":
    main()
