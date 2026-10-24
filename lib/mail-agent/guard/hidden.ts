import "server-only"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { truncateText } from "@/lib/ai/text/truncate"

/** Tag characters U+E0020–E007E spell ASCII space to tilde and show nothing. */
const TAGS = /[\u{E0020}-\u{E007E}]+/gu
/** Runs of variation selectors: U+FE00–FE0F stand for bytes 0–15, U+E0100–E01EF for 16–255. */
const SELECTORS = /[\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}]{4,}/gu
/** Long base64 runs, where an instruction can hide from a reader. */
const BASE64 = /[A-Za-z0-9+/]{40,}={0,2}/g
/** Readable characters; U+FFFD marks bytes that were not text. */
const READABLE = /(?!\u{FFFD})[\p{L}\p{N}\p{P}\p{S}\p{Zs}\n\t]/gu

export const MAX_HIDDEN = 2_000

const decoder = () => new TextDecoder("utf-8")

function fromTags(run: string): string {
  return [...run].map((char) => String.fromCharCode(char.codePointAt(0)! - 0xe0000)).join("")
}

function fromSelectors(run: string): string {
  const bytes = [...run].map((char) => {
    const code = char.codePointAt(0)!
    return code <= 0xfe0f ? code - 0xfe00 : code - 0xe0100 + 16
  })
  return decoder().decode(new Uint8Array(bytes))
}

const fromBase64 = (run: string) => decoder().decode(Buffer.from(run, "base64"))

/** True for decoded bytes that read as text: at least four characters, nearly all of them readable. */
function readsAsText(text: string): boolean {
  const chars = [...text.trim()]
  if (chars.length < 4) return false
  return (text.trim().match(READABLE)?.length ?? 0) / chars.length >= 0.9
}

/**
 * Text a reader cannot see but a model could (PLAN-AGENT-06 step 9): Unicode tag characters,
 * bytes in variation selectors and readable base64, decoded so the guard judges what was hidden.
 * `sanitizeText` removes the invisible forms before any model sees the email, so this is evidence
 * of intent for the guard, never input for the answer. Empty when nothing is hidden.
 */
export function hiddenText(raw: string): string {
  const found: string[] = []
  for (const [run] of raw.matchAll(TAGS)) found.push(fromTags(run))
  for (const [run] of raw.matchAll(SELECTORS)) {
    const text = fromSelectors(run)
    if (readsAsText(text)) found.push(text)
  }
  for (const [run] of sanitizeText(raw).text.matchAll(BASE64)) {
    const text = fromBase64(run)
    if (readsAsText(text)) found.push(text)
  }
  const joined = sanitizeText(found.join("\n")).text
  return truncateText(joined, MAX_HIDDEN).text
}
