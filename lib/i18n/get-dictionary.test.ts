import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/common.json"
import { getDictionary } from "./get-dictionary"

describe("getDictionary", () => {
  it("returns the EN dictionary for en", async () => {
    expect(await getDictionary("en", "common")).toEqual(en)
  })

  it("uses DE where present and falls back to EN elsewhere (D-32)", async () => {
    const de = await getDictionary("de", "common")
    expect(de.notFound.title).toBe("Seite nicht gefunden")
    expect(de.app.name).toBe(en.app.name)
    expect(de.notFound.code).toBe(en.notFound.code)
  })

  it("has the same shape in both languages", async () => {
    const de = await getDictionary("de", "start")
    const enStart = await getDictionary("en", "start")
    expect(Object.keys(de)).toEqual(Object.keys(enStart))
    expect(Object.keys(de.paths)).toEqual(Object.keys(enStart.paths))
    expect(de.meta.title).toBe("Projekte")
  })
})
