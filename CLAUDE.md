# CLAUDE.md — two-tier-dev (файл тимлида; исполнитель читает и не правит)

**Факты.** Репо — кит системы разработки «оператор · тимлид · исполнитель»: `kit/` — продукт, `bin/` — чеки репо, `mods/` — моды, `docs/` — документы фазы. Зачем — `intent/INTENT.md`; фаза — `docs/SPEC-<n>.md`; механика и строка запуска — `docs/PROCESS.md`.

**Твои файлы** — `docs/PLAN-<n>.md`, `docs/PROGRESS.md`, `docs/evidence/`, код и шаблоны. Файлы тимлида — список `owner` в `budgets.json`, этот файл и `.abide/rubric.json`.

**Чек** — команда и её вывод в транскрипте и в `docs/evidence/<F>-<check>-result.txt`. **Стоп** — `STOP: <id>` новой строкой в PROGRESS, только по причинам SPEC §4.

## Rules for every commit
Only irreversible harm. `abide check` judges a commit against these four rules before it is written; the team lead owns the list and the rubric.

- No secret, API key, token or password value appears in any file, log line, evidence file or commit message; credentials are read from the environment only.
- Code never prints or logs the value of TYPESAFE_API_KEY or of any other credential; reporting its presence or length is fine.
- Files under docs/evidence/ carry counts, exit codes, markers and paths relative to the repo root or under /tmp/two-tier-v3; they never carry emails, account or organization ids, client names or home-directory paths.
- No script or hook writes to, edits or installs into anything outside this repo and /tmp/two-tier-v3: user-level settings under the home directory (~/.claude, ~/.toolgate, ~/.abide, ~/.config) and other project directories are read-only.

Judged by code, not by the rubric: no tracked file is deleted from the repo — retired files move to docs/archive/ with git mv; team-lead files change only in commits that start with «Тимлид:»; no force-push.

## Conventions
Not judged at commit: the phase checks and the acceptance read them.

- A hook of the kit never outputs the permission decision "allow" or "ask", and on its own error or timeout it exits 0 so the turn passes.
- A script that calls Jev pins an exact model version and sets a timeout; it never uses the floating alias jev-latest.
- A request to Jev carries only text of this repo: the PROGRESS head, file names, markers, spec items and the raw output of their probes; never file contents from outside the repo or environment variables.
- Scripts in bin/ and kit/bin/ create temporary files and fixtures only under /tmp/two-tier-v3.
- A check prints its OK marker only after its assertions have run; no marker is printed unconditionally.
- Nested claude -p control runs unset ANTHROPIC_API_KEY so they run on the subscription only.
- Model names in scripts and settings are full ids such as claude-opus-5-5, never aliases such as opus or sonnet.
- Scripts and documented commands never use `git add -A`, `git add .`, a force-push or an amend of a pushed commit.
