#!/usr/bin/env node
// toolgate-deny — the kit's PreToolUse hook (SPEC-v3.2 F5): Toolgate «deny only».
// stdin → `toolgate decide --policy <project>/.claude/toolgate.yaml` with its own deadline of 8 s (on a stalled address
// `decide` never exits); prints a deny only for the verdict `deny`. allow, ask, passthrough, an error, no key, no toolgate,
// no policy or the deadline — silence and exit 0: the permission flow of Claude Code decides as without the hook. The policy
// is the team lead's file: model pinned, its audit under /tmp/two-tier-v3/toolgate/, its ledger off — nothing under ~/.toolgate.
// HOME of `decide` is /tmp/two-tier-v3/toolgate-home: Toolgate loads missing keys from ~/.toolgate/env, and the kit's key comes
// from the environment only (SPEC-v3.2 C6).
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

try {
  const policy = path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.claude', 'toolgate.yaml')
  if (fs.existsSync(policy)) {
    const input = fs.readFileSync(0, 'utf8')
    const home = '/tmp/two-tier-v3/toolgate-home'
    fs.mkdirSync(home, { recursive: true, mode: 0o700 })
    const r = spawnSync('toolgate', ['decide', '--policy', policy], { input, encoding: 'utf8', timeout: 8000, killSignal: 'SIGKILL', env: { ...process.env, HOME: home } })
    const d = JSON.parse(r.stdout || '{}')
    if (d.verdict === 'deny') {
      process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `[toolgate] ${d.reason}` } }) + '\n')
    }
  }
} catch {}
process.exit(0)
