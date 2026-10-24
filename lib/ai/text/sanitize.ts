/** What `sanitizeText` removed, by kind: a hint for the guard, not a verdict. */
export interface RemovedCounts {
  /** Unicode tag characters U+E0000–E007F, which can smuggle invisible ASCII. */
  tags: number
  /** Bidi controls: embeddings, overrides, isolates and marks. */
  bidi: number
  /** Variation selectors (U+FE00–FE0F, U+E0100–E01EF), which can carry hidden bytes. */
  variation: number
  /** Zero-width and other invisible format characters, fillers included. */
  invisible: number
  /** Control characters other than newline and tab. */
  control: number
}

export interface SanitizedText {
  text: string
  removed: RemovedCounts
  /** Sum of `removed`. */
  total: number
}

/** Checked in this order: the format-character class `invisible` also matches tags and bidi controls. */
const PATTERNS: readonly [keyof RemovedCounts, RegExp][] = [
  ["tags", /[\u{E0000}-\u{E007F}]/gu],
  ["bidi", /[\u{61C}\u{200E}\u{200F}\u{202A}-\u{202E}\u{2066}-\u{2069}]/gu],
  ["variation", /[\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}]/gu],
  // Format characters (zero-width space and joiners, soft hyphen, BOM, word joiner) and the
  // blank-looking fillers: combining grapheme joiner, Hangul fillers.
  ["invisible", /[\p{Cf}\u{34F}\u{115F}\u{1160}\u{3164}\u{FFA0}]/gu],
  ["control", /(?![\n\t])\p{Cc}/gu],
]

/** NFKC would turn `m²` into `m2`; superscript digits cannot disguise letters, so they pass through. */
const UNIT_SUPERSCRIPTS = /([¹²³])/u

const nfkc = (text: string) =>
  text
    .split(UNIT_SUPERSCRIPTS)
    .map((part, index) => (index % 2 === 1 ? part : part.normalize("NFKC")))
    .join("")

/**
 * Cleans untrusted text before a model or a guard sees it (PLAN-AGENT-03 step 1): unifies line
 * endings, removes invisible and control characters (newline and tab stay), applies NFKC (so
 * full-width or ligature look-alikes become plain letters), drops trailing spaces and collapses
 * runs of blank lines.
 */
export function sanitizeText(input: string): SanitizedText {
  let text = input.replace(/\r\n?|[\u{2028}\u{2029}]/gu, "\n")
  const removed: RemovedCounts = { tags: 0, bidi: 0, variation: 0, invisible: 0, control: 0 }
  for (const [kind, pattern] of PATTERNS) {
    text = text.replace(pattern, () => {
      removed[kind] += 1
      return ""
    })
  }
  text = nfkc(text)
    .replace(/[^\S\n]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  const total = Object.values(removed).reduce((sum, count) => sum + count, 0)
  return { text, removed, total }
}
