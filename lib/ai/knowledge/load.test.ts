import { describe, expect, it } from "vitest"
import english from "./generated/en.json"
import { loadKnowledge, searchDocs, withFallback } from "./load"
import type { KnowledgeChunk } from "./types"

const chunk = (id: string, lang: "en" | "de"): KnowledgeChunk => ({ id, lang, title: id, url: `/${lang}/docs`, text: id, source: `content/docs/${lang}/x.mdx` })

describe("loadKnowledge", () => {
  it("loads the generated English chunks", async () => {
    expect(await loadKnowledge("en")).toEqual(english)
  })

  it("gives German the English chunks of every source it lacks (D-32)", async () => {
    const german = await loadKnowledge("de")
    expect(german.length).toBeGreaterThanOrEqual(english.length)
  })

  it("falls back per source: a translated source replaces all its English parts", () => {
    const merged = withFallback([chunk("docs:a", "de")], [chunk("docs:a-1", "en"), chunk("docs:a-2", "en"), chunk("docs:b", "en")])
    expect(merged.map((entry) => `${entry.lang}:${entry.id}`)).toEqual(["de:docs:a", "en:docs:b"])
  })
})

describe("searchDocs", () => {
  it("searches a language's knowledge with one cached index", async () => {
    const [first] = await searchDocs("en", "heat density")
    expect(first.chunk.lang).toBe("en")
    expect(await searchDocs("de", "heat density", 1)).toHaveLength(1)
  })
})
