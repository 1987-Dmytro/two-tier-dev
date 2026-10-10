export type HandoffFill = number | null

declare module 'claude-code' {
  interface PluginState {
    handoff: {
      /** Context fill after the last turn, percent of the window; null until the first response. */
      fill: number | null
      /** The person hid the band for this session. */
      isHidden: boolean
      /** The last outcome shown beside the buttons ("" when none). */
      note: string
      /** Jev's boundary hint for the last settled turn ("" when none or below the floor); cleared when a turn starts. */
      advice: string
    }
  }
}
