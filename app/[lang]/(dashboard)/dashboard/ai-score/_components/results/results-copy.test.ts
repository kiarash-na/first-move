import { describe, expect, it } from "vitest"
import de from "@/dictionaries/de/ai-score.json"
import en from "@/dictionaries/en/ai-score.json"
import { extraKeys, missingKeys } from "@/lib/i18n/dictionary-keys"

/** The copy of the result views is complete in both languages (no EN fallback, D-32). */
describe("ai-score results copy", () => {
  it("has every EN key in DE and nothing more", () => {
    expect(missingKeys(en.results, de.results)).toEqual([])
    expect(extraKeys(en.results, de.results)).toEqual([])
  })

  it("keeps the placeholders of every EN string in DE", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
    const walk = (base: unknown, other: unknown, path: string): string[] => {
      if (typeof base === "string") return JSON.stringify(placeholders(base)) === JSON.stringify(placeholders(String(other))) ? [] : [path]
      if (!base || typeof base !== "object") return []
      return Object.entries(base).flatMap(([key, value]) => walk(value, (other as Record<string, unknown>)?.[key], `${path}.${key}`))
    }
    expect(walk(en.results, de.results, "results")).toEqual([])
  })
})
