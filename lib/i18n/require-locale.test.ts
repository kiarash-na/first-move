import { describe, expect, it } from "vitest"
import { requireLocale } from "./require-locale"

describe("requireLocale", () => {
  it("returns a supported locale", () => {
    expect(requireLocale("de")).toBe("de")
  })

  it("throws the not-found signal for anything else", () => {
    expect(() => requireLocale("fr")).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/)
  })
})
