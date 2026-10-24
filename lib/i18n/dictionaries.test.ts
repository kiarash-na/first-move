import { describe, expect, it } from "vitest"
import { readdirSync } from "node:fs"
import path from "node:path"
import { AREAS, dictionaryLoaders } from "./dictionaries"
import { extraKeys } from "./dictionary-keys"
import { isPlainObject } from "./deep-merge"
import { LOCALES } from "./locales"

const root = path.resolve(__dirname, "../../dictionaries")

describe("dictionaries", () => {
  it("has one file per area in every locale, and no stray files", () => {
    for (const locale of LOCALES) {
      const files = readdirSync(path.join(root, locale)).sort()
      expect(files).toEqual(AREAS.map((area) => `${area}.json`).sort())
    }
  })

  describe.each(AREAS)("area %s", (area) => {
    it("loads an object in every locale", async () => {
      for (const locale of LOCALES) {
        expect(isPlainObject(await dictionaryLoaders[locale][area]())).toBe(true)
      }
    })

    it("DE has no keys that EN lacks (D-32)", async () => {
      const en = await dictionaryLoaders.en[area]()
      const de = await dictionaryLoaders.de[area]()
      expect(extraKeys(en, de)).toEqual([])
    })
  })
})
