// green — the probe line is there; red — it is there and says FAIL, BAD or offen (the item is not closed); none — no probe line.
export type Mark = 'green' | 'red' | 'none'
export type ItemRow = { id: string; mark: Mark; line: string }
export type FeatureRow = { id: string; marker: string | null; hasMarker: boolean; items: ItemRow[] }
export type Board = {
  spec: string // the SPEC path of the start prompt; '' when no phase is open
  features: FeatureRow[]
  counts: [number, number, number] // green, red, none
  gate: string // the last decision of docs/evidence/spec-gate.jsonl
  verdict: string // the newest verify-*.txt of this SPEC
  stop: string // the open STOP of docs/PROGRESS.md
}

declare module 'claude-code' {
  interface PluginState {
    'spec-board': { board: Shaped<Board> }
  }
}
