import { tokenize } from "./tokenize"
import type { KnowledgeChunk, SearchHit } from "./types"

/** BM25 parameters (the usual defaults). */
const K1 = 1.2
const B = 0.75
/** Title terms count this many times, so a matching heading ranks first. */
const TITLE_WEIGHT = 2

export interface KnowledgeIndex {
  chunks: readonly KnowledgeChunk[]
  terms: readonly Map<string, number>[]
  lengths: readonly number[]
  averageLength: number
  documentFrequency: Map<string, number>
}

/** Builds the BM25 index over the chunks once; searching reuses it. */
export function createIndex(chunks: readonly KnowledgeChunk[]): KnowledgeIndex {
  const terms = chunks.map((chunk) => {
    const counts = new Map<string, number>()
    const tokens = [...Array.from({ length: TITLE_WEIGHT }, () => tokenize(chunk.title)).flat(), ...tokenize(chunk.text)]
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
    return counts
  })
  const lengths = terms.map((counts) => [...counts.values()].reduce((sum, count) => sum + count, 0))
  const documentFrequency = new Map<string, number>()
  for (const counts of terms) for (const term of counts.keys()) documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)
  const averageLength = lengths.length ? lengths.reduce((sum, length) => sum + length, 0) / lengths.length : 0
  return { chunks, terms, lengths, averageLength, documentFrequency }
}

/** The `limit` best chunks for a query by BM25, best first; chunks sharing no term are left out. */
export function searchKnowledge(index: KnowledgeIndex, query: string, limit = 5): SearchHit[] {
  const queryTerms = [...new Set(tokenize(query))]
  const total = index.chunks.length
  const hits: SearchHit[] = []
  for (const [position, counts] of index.terms.entries()) {
    let score = 0
    for (const term of queryTerms) {
      const frequency = counts.get(term)
      if (!frequency) continue
      const documents = index.documentFrequency.get(term) ?? 0
      const idf = Math.log(1 + (total - documents + 0.5) / (documents + 0.5))
      const norm = frequency + K1 * (1 - B + (B * index.lengths[position]) / (index.averageLength || 1))
      score += (idf * frequency * (K1 + 1)) / norm
    }
    if (score > 0) hits.push({ chunk: index.chunks[position], score })
  }
  return hits.sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)).slice(0, limit)
}
