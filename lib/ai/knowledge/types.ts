import type { Locale } from "@/lib/i18n/locales"

/** One searchable piece of public knowledge (D-57), written by `pnpm gen:knowledge`. */
export interface KnowledgeChunk {
  /** Stable id: `docs:<slug>#<anchor>`, `calc:steps.area`, `quick-check:fields.area`. */
  id: string
  lang: Locale
  title: string
  /** Site path to show the reader (`/en/docs/quick-check#inputs`, `/en/dashboard/quick-check/area`). */
  url: string
  text: string
  /** Where the text comes from: a public docs page or an allow-listed dictionary node. */
  source: string
}

export interface SearchHit {
  chunk: KnowledgeChunk
  score: number
}
