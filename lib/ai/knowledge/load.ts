import type { Locale } from "@/lib/i18n/locales"
import { createIndex, searchKnowledge, type KnowledgeIndex } from "./search"
import type { KnowledgeChunk, SearchHit } from "./types"

const LOADERS: Record<Locale, () => Promise<readonly KnowledgeChunk[]>> = {
  en: () => import("./generated/en.json").then((json) => json.default as KnowledgeChunk[]),
  de: () => import("./generated/de.json").then((json) => json.default as KnowledgeChunk[]),
}

/** The source a chunk belongs to across languages: its id without a part number. */
const baseId = (id: string) => id.replace(/-\d+$/, "")

/**
 * The knowledge of a language (PLAN-AGENT-03 step 3): its own chunks, plus the English chunks of
 * every source it has not translated yet (D-32: DE falls back to EN per text). Loaded on first use.
 */
export async function loadKnowledge(lang: Locale): Promise<readonly KnowledgeChunk[]> {
  const own = await LOADERS[lang]()
  return lang === "en" ? own : withFallback(own, await LOADERS.en())
}

/** A language's chunks plus the English chunks of the sources it does not have. */
export function withFallback(own: readonly KnowledgeChunk[], english: readonly KnowledgeChunk[]): KnowledgeChunk[] {
  const translated = new Set(own.map((chunk) => baseId(chunk.id)))
  return [...own, ...english.filter((chunk) => !translated.has(baseId(chunk.id)))]
}

const indexes = new Map<Locale, Promise<KnowledgeIndex>>()

/** Searches the knowledge of a language; the index is built once per language and process. */
export async function searchDocs(lang: Locale, query: string, limit?: number): Promise<SearchHit[]> {
  let index = indexes.get(lang)
  if (!index) {
    index = loadKnowledge(lang).then(createIndex)
    indexes.set(lang, index)
  }
  return searchKnowledge(await index, query, limit)
}
