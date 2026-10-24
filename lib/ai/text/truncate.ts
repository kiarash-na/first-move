export const TRUNCATED_MARKER = "[truncated]"

export interface TruncatedText {
  text: string
  truncated: boolean
}

/** A cut may move back to a boundary, but never lose more than this share of the budget. */
const MAX_BACKTRACK = 0.2

/** The last paragraph, line, sentence or word boundary in `text` at or after `floor`, else the end. */
function boundary(text: string, floor: number): number {
  for (const pattern of [/\n\n/g, /\n/g, /[.!?](?=\s)/g, /\s/g]) {
    let last = -1
    for (const match of text.matchAll(pattern)) last = match.index + (pattern.source.startsWith("[.") ? 1 : 0)
    if (last >= floor) return last
  }
  return text.length
}

/**
 * Cuts `text` to at most `maxChars` characters (PLAN-AGENT-03 step 1): at a paragraph, line,
 * sentence or word boundary near the limit, never inside a surrogate pair, with an explicit
 * `[truncated]` marker on its own line, so a model knows that text is missing. `alreadyCut` says the
 * caller cut the text before (a cheap first cut of a huge text), so the marker is added in any case.
 */
export function truncateText(text: string, maxChars: number, { alreadyCut = false }: { alreadyCut?: boolean } = {}): TruncatedText {
  const budget = maxChars - TRUNCATED_MARKER.length - 1
  if (text.length <= maxChars && !alreadyCut) return { text, truncated: false }
  if (alreadyCut && text.length <= budget) return { text: `${text.trimEnd()}\n${TRUNCATED_MARKER}`, truncated: true }
  if (budget <= 0) return { text: TRUNCATED_MARKER.slice(0, Math.max(0, maxChars)), truncated: true }
  let end = budget
  const code = text.charCodeAt(end - 1)
  if (code >= 0xd800 && code <= 0xdbff) end -= 1
  const head = text.slice(0, end)
  const cut = head.slice(0, boundary(head, Math.floor(budget * (1 - MAX_BACKTRACK)))).trimEnd()
  return { text: `${cut}\n${TRUNCATED_MARKER}`, truncated: true }
}
