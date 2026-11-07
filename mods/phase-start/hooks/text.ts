// The branch the phase names: «Branch <b> only» of the kit's PROMPT template, «branch <b> from <base>» of a phase's first lines.
// The template's own «<b>» names none.
export const branchOf = (prompt: string): string | undefined => prompt.match(/\bbranch\s+`?([\w./-]+)`?\s+(?:only|from)\b/i)?.[1]

const STOP_LINE = /^[ \t]*(?:[-*][ \t]*)?STOP:[ \t]*STOP-[A-Z]+\b/m // the STOP line of spec-gate
const LIFTED = /[—–-]+\s*снят\S*\s*$/i // «— снят» at its end: spec-gate holds such a line as lifted
const RESUME = /^[ \t]*(?:[-*][ \t]*)?\**Resume:\**[ \t]*(\S.*)$/i
const CONTINUE = /^[ \t]*(?:[-*][ \t]*)?(Продолж[^?]*)$/i

// The Resume line of the open STOP. Open: the last STOP line of the «## Open stop» section; where the file has no such section, of its
// first section with a STOP that is not «## Closed…» (a head that carries the STOP: what lies below it is history). The resume line:
// within the next three lines, as spec-gate requires, «Resume: …», bold or not, before the template's «Продолжай по SPEC-<n> с F<k>…»;
// a question is never one, it would go out as the operator's word. A lifted last STOP, or none: undefined.
export const resumeOf = (progress: string): string | undefined => {
  const sections = progress.split(/^(?=## )/m)
  const section = sections.find(s => s.startsWith('## Open stop')) ?? sections.find(s => !s.startsWith('## Closed') && STOP_LINE.test(s)) ?? ''
  const lines = section.split(/\r?\n/)
  const i = lines.findLastIndex(l => STOP_LINE.test(l))
  if (i < 0 || LIFTED.test(lines[i]!)) return undefined
  const near = lines.slice(i + 1, i + 4)
  for (const re of [RESUME, CONTINUE]) {
    for (const line of near) {
      const text = line.match(re)?.[1]!.trim()
      if (text && !text.endsWith('?')) return text
    }
  }
  return undefined
}
