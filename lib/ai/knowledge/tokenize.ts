/** Short EN and DE function words that carry no topic. */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from", "how", "i", "if", "in", "is", "it",
  "its", "my", "no", "not", "of", "on", "or", "our", "so", "that", "the", "their", "there", "this", "to", "was", "we",
  "what", "when", "which", "who", "why", "will", "with", "you", "your",
  "am", "auf", "aus", "bei", "bin", "das", "dass", "dem", "den", "der", "des", "die", "ein", "eine", "einen", "einer",
  "es", "fur", "hat", "ich", "im", "ist", "kann", "mit", "nach", "nicht", "oder", "sie", "sind", "um", "und", "von",
  "was", "wie", "wir", "zu", "zum", "zur",
])

/** Endings removed (one per pass, until none applies), keeping a stem of at least four letters. */
const SUFFIXES = ["ungen", "ung", "ies", "ing", "ed", "en", "er", "es", "e", "s", "n"]
const MIN_STEM = 4

function stem(word: string): string {
  if (/\d/.test(word)) return word
  let current = word
  for (let pass = 0; pass < 3; pass++) {
    const suffix = SUFFIXES.find((ending) => current.endsWith(ending) && current.length - ending.length >= MIN_STEM)
    if (!suffix) break
    current = suffix === "ies" ? `${current.slice(0, -3)}y` : current.slice(0, -suffix.length)
  }
  return current
}

/**
 * Search terms of a text, the same for documents and queries (PLAN-AGENT-03 step 3): lower case,
 * accents and umlauts folded (Wärme → warme), ß → ss, split at anything that is not a letter or
 * digit, stop words and single letters dropped (single digits stay: "Table 4"), light EN/DE
 * suffix stemming (buildings → build, Wärmepumpen → warmepump).
 */
export function tokenize(text: string): string[] {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => (word.length >= 2 || /\d/.test(word)) && !STOP_WORDS.has(word))
    .map(stem)
}
