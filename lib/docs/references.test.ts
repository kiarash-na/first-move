import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { isKnownSource, REFERENCES } from "./references"

const PLAN_SCORE = path.resolve(__dirname, "../ai/plan-score")

describe("references (PLAN-AI-SCORE-01 § Sources)", () => {
  it("has unique ids and https links only, each checked", () => {
    expect(new Set(REFERENCES.map((reference) => reference.id)).size).toBe(REFERENCES.length)
    for (const reference of REFERENCES) {
      expect(reference.url, reference.id).toMatch(/^https:\/\//)
      expect(reference.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it("knows every source the AI Plan Score method cites", () => {
    const cited = readdirSync(PLAN_SCORE)
      .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
      .flatMap((name) => [...readFileSync(path.join(PLAN_SCORE, name), "utf8").matchAll(/"((?:SRC|ALG|BM)-[A-Z0-9-]+)"/g)].map((match) => match[1]))
    expect(cited.length).toBeGreaterThan(50)
    expect(cited.filter((id) => !isKnownSource(id))).toEqual([])
  })
})
