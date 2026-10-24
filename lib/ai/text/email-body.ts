export interface EmailText {
  /** The new text of the message. */
  text: string
  /** True when quoted history, a forwarded original or a signature was removed. */
  stripped: boolean
}

const SEPARATOR = /^-{2,}\s*(?:original message|ursprüngliche nachricht|forwarded message|weitergeleitete nachricht)\s*-{2,}\s*$/i
const SIGNATURE = /^--\s?$/
const UNDERSCORES = /^_{10,}\s*$/
const MOBILE = /^(?:sent from my .+|von meinem .+ gesendet|gesendet von meinem .+|get outlook for .+|outlook für .+ herunterladen)$/i
const QUOTED = /^\s*>/

const wrote = (line: string) => /^On\s.+\swrote:\s*$/i.test(line) || /^Am\s.+\sschrieb\s.*:\s*$/i.test(line)

/** Outlook's header block: From/Von, then Sent/Date/Gesendet/Datum and To/Subject within a few lines. */
function outlookHeader(lines: readonly string[], index: number): boolean {
  if (!/^\*?(?:from|von):\*?\s/i.test(lines[index])) return false
  const next = lines.slice(index + 1, index + 5)
  return (
    next.some((line) => /^\*?(?:sent|date|gesendet|datum):\*?\s/i.test(line)) &&
    next.some((line) => /^\*?(?:to|an|subject|betreff):\*?\s/i.test(line))
  )
}

/** Where the quoted history starts: an attribution line (also wrapped over two lines), a separator, a header block. */
function historyStart(lines: readonly string[]): number {
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim()
    const joined = `${line} ${lines[index + 1]?.trim() ?? ""}`
    if (SEPARATOR.test(line) || SIGNATURE.test(lines[index]) || wrote(line) || outlookHeader(lines, index)) return index
    if ((/^On\s/i.test(line) || /^Am\s/i.test(line)) && wrote(joined)) return index
    if (UNDERSCORES.test(line) && outlookHeader(lines, index + 1)) return index
  }
  return lines.length
}

/**
 * The new text of an email (PLAN-AGENT-03 step 1): drops the quoted history (EN and DE
 * attribution lines, Outlook header blocks and separators), quoted `>` lines, the signature after
 * `-- ` and mobile signatures. When nothing would remain (a bare forward), the full text stays.
 */
export function newEmailText(body: string): EmailText {
  const original = body.replace(/\r\n?/g, "\n").trim()
  const lines = original.split("\n")
  const kept = lines
    .slice(0, historyStart(lines))
    .filter((line) => !QUOTED.test(line) && !MOBILE.test(line.trim()))
  const text = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim()
  if (!text) return { text: original, stripped: false }
  return { text, stripped: text !== original }
}
