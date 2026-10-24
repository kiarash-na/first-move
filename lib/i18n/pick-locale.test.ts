import { describe, expect, it } from "vitest"
import { pickLocale } from "./pick-locale"

describe("pickLocale", () => {
  it("keeps a saved language", () => {
    expect(pickLocale("en")).toBe("en")
    expect(pickLocale("de")).toBe("de")
  })

  it("defaults to German without a valid saved language (D-67)", () => {
    expect(pickLocale(undefined)).toBe("de")
    expect(pickLocale(null)).toBe("de")
    expect(pickLocale("")).toBe("de")
    expect(pickLocale("fr")).toBe("de")
  })
})
