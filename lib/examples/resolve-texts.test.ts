import { describe, expect, it } from "vitest"
import { isLocalized, resolveTexts } from "./resolve-texts"

describe("resolveTexts", () => {
  const tree = { a: { en: "One", de: "Eins" }, b: [{ en: "Two" }], c: { n: 3, ok: true, none: null }, id: "keep" }

  it("picks the German text when there is one", () => {
    expect(resolveTexts(tree, "de")).toEqual({ a: "Eins", b: ["Two"], c: { n: 3, ok: true, none: null }, id: "keep" })
  })

  it("falls back to English for a missing or empty German text (D-32)", () => {
    expect(resolveTexts({ en: "Only", de: "" }, "de")).toBe("Only")
    expect(resolveTexts(tree, "en")).toEqual({ a: "One", b: ["Two"], c: { n: 3, ok: true, none: null }, id: "keep" })
  })

  it("recognises localized texts", () => {
    expect(isLocalized({ en: "x" })).toBe(true)
    expect(isLocalized({ de: "x" })).toBe(false)
    expect(isLocalized(["x"])).toBe(false)
    expect(isLocalized(null)).toBe(false)
  })
})
