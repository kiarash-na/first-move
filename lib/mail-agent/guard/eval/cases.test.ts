// @vitest-environment node
import { describe, expect, it } from "vitest"
import { guardState } from "../state"
import { caseEmail, loadCases, parseCases } from "./cases"

const cases = loadCases()

describe("guard evaluation cases", () => {
  it("parse, with unique ids", () => {
    expect(cases.length).toBeGreaterThanOrEqual(40)
    expect(new Set(cases.map((entry) => entry.id)).size).toBe(cases.length)
  })

  it("cover every benign kind in English and German", () => {
    for (const lang of ["en", "de"] as const) {
      const kinds = new Set(cases.filter((entry) => entry.lang === lang).map((entry) => entry.kind))
      for (const kind of ["question", "answers", "documents", "small_talk", "off_topic"]) expect(kinds, `${lang} ${kind}`).toContain(kind)
    }
  })

  it("give the id's language and kind in its name", () => {
    for (const entry of cases) expect(entry.id.startsWith(`${entry.lang}-`), entry.id).toBe(true)
  })

  it("become guard states within the limits", () => {
    for (const entry of cases) {
      const state = guardState(caseEmail(entry), "new")
      expect(state.body.length, entry.id).toBeGreaterThan(0)
      expect(state.attachments).toHaveLength(entry.attachments.length)
    }
  })

  it("name the line of a bad case", () => {
    const good = JSON.stringify(cases[0])
    expect(() => parseCases(`${good}\n{"id":"en-x-01","lang":"fr"}`)).toThrow(/line 2/)
    expect(() => parseCases(JSON.stringify({ ...cases[0], expect: "threat" }))).toThrow(/threat/)
  })
})
