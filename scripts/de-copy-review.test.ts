import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { missingKeys } from "@/lib/i18n/dictionary-keys"
import { leafCount, render, review } from "./de-copy-review.mjs"

type Entry = { area: string; total: number; keys: string[] }

const json = (lang: string, area: string): unknown => {
  try {
    return JSON.parse(readFileSync(path.join(process.cwd(), "dictionaries", lang, `${area}.json`), "utf8"))
  } catch {
    return {}
  }
}

describe("DE copy review (D-32)", () => {
  const areas = review() as Entry[]

  it("covers every dictionary area", () => {
    const files = readdirSync(path.join(process.cwd(), "dictionaries/en")).map((file) => file.replace(/\.json$/, "")).sort()
    expect(areas.map((entry) => entry.area)).toEqual(files)
  })

  it("lists exactly the keys that missingKeys() reports for the app", () => {
    for (const entry of areas) expect(entry.keys, entry.area).toEqual(missingKeys(json("en", entry.area), json("de", entry.area)))
  })

  it("counts the English keys", () => {
    for (const entry of areas) expect(entry.total, entry.area).toBe(leafCount(json("en", entry.area)))
  })

  it("renders one section per area with the totals", () => {
    const note = render([
      { area: "alpha", total: 4, keys: ["a.b.c", "a.b.d", "x"] },
      { area: "beta", total: 2, keys: [] },
    ]) as string
    expect(note).toContain("| [alpha](#alpha) | 4 | 3 | 25 % |")
    expect(note).toContain("| **All** | **6** | **3** | **50 %** |")
    expect(note).toContain("**`a.b`** (2)")
    expect(note).toContain("- `a.b.c`")
    expect(note).toContain("Complete: German provides every key.")
  })
})
