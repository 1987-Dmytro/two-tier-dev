// spec-board — a Claude Code mod (two-tier-dev, SPEC-v3.4 F9, M1): «где мы» без чтения PROGRESS.
// /board opens a pane: the items F<n>.<k> of the phase SPEC against the probe lines of docs/evidence/*-result.txt (green · red · no
// line), the feature markers, the last spec-gate decision, the newest verdict of this SPEC and the open STOP; the same summary goes to
// the status line. The data are the files spec-gate judges (./board.ts), read from disk: no model, no network.
// Redrawn after each tool call of the main loop and every minute. Who draws: a person's session — the REPL, or a host that attached a
// surface (the Code tab starts as the SDK does: isInteractive false, a surface later). A `claude -p` run and a subagent's tool calls
// draw nothing; /board still answers its line there. No .catch: on its own error a hook is skipped and the tool call stands (kit rule).

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'
import type { Board } from '../types'
import { EMPTY, boardOf, specPathOf, statusOf } from './board'

const PANE = 'spec-board'
const EVERY_MS = 60_000
// Change the tag when Board's fields change: it declines what an earlier version stored, which outlives a reload.
const board = atom({ plugin: 'spec-board', key: 'board' } as const, EMPTY, { shape: 'board-1' })

async function readOr($: EngineInterface, path: string): Promise<string | undefined> {
  try {
    return await $.fs.read(path)
  } catch {
    return undefined
  }
}

async function collect($: EngineInterface): Promise<Board> {
  const root = (await $.session.repo())?.root ?? (await $.session.root())
  const prompt = (await readOr($, `${root}/docs/PROMPT.txt`)) ?? (await readOr($, `${root}/docs/GOAL.txt`))
  const rf = prompt ? specPathOf(prompt) : undefined
  let entries: Array<{ name: string; kind: string; mtimeMs: number }> = []
  try {
    entries = await $.fs.list(`${root}/docs/evidence`)
  } catch {
    entries = []
  }
  const wanted = entries.filter(e => e.kind === 'file' && (/^F\d+-.*-result\.txt$/.test(e.name) || /^verify-[0-9a-f]{7,40}(?:-[\w.-]+)?\.txt$/.test(e.name)))
  const evidence = []
  for (const e of wanted) {
    const text = await readOr($, `${root}/docs/evidence/${e.name}`)
    if (text !== undefined) evidence.push({ name: e.name, text, mtimeMs: e.mtimeMs })
  }
  return boardOf({
    prompt,
    spec: rf ? await readOr($, `${root}/${rf}`) : undefined,
    evidence,
    gateLog: await readOr($, `${root}/docs/evidence/spec-gate.jsonl`),
    progress: await readOr($, `${root}/docs/PROGRESS.md`),
  })
}

async function isPersons($: EngineInterface, isAttended: boolean): Promise<boolean> {
  return isAttended || (await $.session.surfaces()).length > 0
}

// Recompute, store for the pane, and set the status line — only where a person sees it.
async function refresh($: EngineInterface, isAttended: boolean): Promise<Board | undefined> {
  if (!(await isPersons($, isAttended))) return undefined
  const b = await collect($)
  await update($, board, () => b)
  $.ui.status(statusOf(b))
  return b
}

export const register: Register = on => {
  let isAttended = false // the REPL, or a surface attached once

  on('session.start', async ($, e, next) => {
    isAttended ||= e.isInteractive
    await $.command.register({ name: 'board', description: 'Show the phase board: SPEC items against docs/evidence, markers, spec-gate, verdict, STOP.' })
    $.clock.every(EVERY_MS, () => refresh($, isAttended))
    await refresh($, isAttended)
    return next(e)
  })

  on('session.attach', async ($, e, next) => {
    isAttended = true
    const result = await next(e)
    await refresh($, isAttended)
    return result
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.agentId === undefined) {
      try {
        await refresh($, isAttended)
      } catch {
        // the board is a view: its own failure never touches the call
      }
    }
    return ran
  })

  on('command.run', { command: 'board' }, async $ => {
    const b = (await refresh($, isAttended)) ?? (await collect($))
    if (await isPersons($, isAttended)) await $.ui.open({ id: PANE, title: 'Spec board' })
    return { text: statusOf(b) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const b = await read($, board)
    const width = Math.max(20, e.props.bodyColumns)
    const cut = (s: string) => (s.length > width ? `${s.slice(0, width - 1)}…` : s)
    const color = (m: string) => (m === 'green' ? 'success' : m === 'red' ? 'error' : 'subtle')
    return (
      <Box flexDirection="column">
        <Text>{cut(statusOf(b))}</Text>
        {b.features.map(f => (
          <Box flexDirection="column" key={f.id}>
            <Text color={f.hasMarker ? 'success' : 'error'}>{cut(`${f.id} ${f.marker ?? 'нет маркера'} ${f.hasMarker ? 'есть' : 'нет'}`)}</Text>
            {f.items.map(i => (
              <Text color={color(i.mark)}>{cut(`  ${i.id} ${i.mark === 'green' ? 'ok' : i.mark === 'red' ? 'red' : 'нет строки'}${i.line ? ` · ${i.line.slice(i.id.length + 1)}` : ''}`)}</Text>
            ))}
          </Box>
        ))}
      </Box>
    )
  })
}
