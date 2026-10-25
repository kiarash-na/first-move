// @vitest-environment node
import { describe, expect, it } from "vitest"
import { REFERENCE_CASE_CARDS, REFERENCE_CASE_CATALOG } from "./catalog"

describe("REFERENCE_CASE_CATALOG (D-76)", () => {
  it("lists the six cards once each: real first, then fictional, each group from strong to weak", () => {
    expect(REFERENCE_CASE_CATALOG).toHaveLength(6)
    expect(new Set(REFERENCE_CASE_CATALOG).size).toBe(6)
    expect(new Set(REFERENCE_CASE_CATALOG)).toEqual(new Set(Object.values(REFERENCE_CASE_CARDS)))
    expect(REFERENCE_CASE_CATALOG.map((card) => `${card.kind}:${card.tier}`)).toEqual([
      "real:strong",
      "real:middling",
      "real:weak",
      "fictional:strong",
      "fictional:middling",
      "fictional:weak",
    ])
  })

  it("has unique ids that can become a project's example id", () => {
    const ids = REFERENCE_CASE_CATALOG.map((card) => card.id)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]{1,64}$/)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("names and summarises each case in English and German, one sentence each", () => {
    for (const card of REFERENCE_CASE_CATALOG) {
      for (const value of [card.name, card.summary]) {
        expect(value.en.trim(), card.id).not.toBe("")
        expect(value.de?.trim(), card.id).toBeTruthy()
      }
      for (const summary of [card.summary.en, card.summary.de!]) expect(summary.match(/[.!?](?:\s|$)/g), card.id).toHaveLength(1)
    }
  })

  it("says in the name of every fictional case that it is fictional", () => {
    for (const card of REFERENCE_CASE_CATALOG.filter((entry) => entry.kind === "fictional")) {
      expect(card.name.en).toMatch(/fictional/)
      expect(card.name.de).toMatch(/fiktiv/)
      expect(card.summary.en).toMatch(/fictional/)
      expect(card.summary.de).toMatch(/fiktiv/)
    }
  })
})
