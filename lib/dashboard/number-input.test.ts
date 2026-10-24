import { describe, expect, it } from "vitest"
import { formatInputNumber, inputPatchValue, showsValue } from "./number-input"

describe("number inputs (D-21)", () => {
  it("formats a stored value per language and round-trips it", () => {
    expect(formatInputNumber(null, "en")).toBe("")
    expect(formatInputNumber(7200, "en")).toBe("7,200")
    expect(formatInputNumber(7200, "de")).toBe("7.200")
    expect(formatInputNumber(0.5, "de")).toBe("0,5")
    for (const lang of ["en", "de"] as const) {
      for (const value of [0, 0.5, 12.25, 7200, 1_000_000, 123_456.789]) {
        expect(inputPatchValue(formatInputNumber(value, lang), lang)).toBe(value)
      }
    }
  })

  it("accepts both decimal separators", () => {
    expect(inputPatchValue("12,5", "en")).toBe(12.5)
    expect(inputPatchValue("12.5", "de")).toBe(12.5)
    expect(inputPatchValue("1.234,5", "de")).toBe(1234.5)
    expect(inputPatchValue("1,234.5", "de")).toBe(1234.5)
  })

  it("clears on empty text and passes anything else on for validation", () => {
    expect(inputPatchValue("  ", "en")).toBeNull()
    expect(inputPatchValue("12a", "en")).toBe("12a")
  })

  it("knows when the text already shows the value", () => {
    expect(showsValue("1.", 1, "en")).toBe(true)
    expect(showsValue("0,50", 0.5, "de")).toBe(true)
    expect(showsValue("", null, "en")).toBe(true)
    expect(showsValue("3", 4, "en")).toBe(false)
  })
})
