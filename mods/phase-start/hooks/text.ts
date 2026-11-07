// The branch the phase names: «Branch <b> only» of the kit's PROMPT template, «branch <b> from <base>» of a phase's first lines.
// The template's own «<b>» names none.
export const branchOf = (prompt: string): string | undefined => prompt.match(/\bbranch\s+`?([\w./-]+)`?\s+(?:only|from)\b/i)?.[1]

const STOP_LINE = /^[ \t]*(?:[-*][ \t]*)?STOP:[ \t]*STOP-[A-Z]+\b/ // the STOP line of spec-gate
const LIFTED = /[—–-]+\s*снят/i // «— снят» at its end: spec-gate holds such a line as lifted
const RESUME = /^[ \t]*(?:[-*][ \t]*)?(?:Resume:[ \t]*(\S.*)|(Продолж.*))$/i

// The Resume line of the open STOP. Open: the last STOP line of the «## Open stop» section, or of the file where it has no such section
// (a head that carries the STOP). The resume line: within the next three lines, as spec-gate requires, «Resume: …» or the template's
// «Продолжай по SPEC-<n> с F<k>…». A lifted last STOP, or none: undefined.
export const resumeOf = (progress: string): string | undefined => {
  const section = progress.split(/^(?=## )/m).find(s => s.startsWith('## Open stop')) ?? progress
  const lines = section.split(/\r?\n/)
  const i = lines.findLastIndex(l => STOP_LINE.test(l))
  if (i < 0 || LIFTED.test(lines[i]!)) return undefined
  for (const line of lines.slice(i + 1, i + 4)) {
    const m = line.match(RESUME)
    if (m) return (m[1] ?? m[2])!.trim()
  }
  return undefined
}
