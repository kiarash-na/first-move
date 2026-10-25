import { describe, expect, it } from "vitest"
import { COMMON_PINS, isPinFormat, PIN_LENGTH, pinProblem } from "./pin"

describe("vault PIN (D-50)", () => {
  it("is exactly six digits", () => {
    expect(PIN_LENGTH).toBe(6)
    expect(isPinFormat("482915")).toBe(true)
    for (const bad of ["", "48291", "4829150", "48291a", " 482915", "４８２９１５", "48-915"]) expect(isPinFormat(bad), bad).toBe(false)
  })

  it("refuses the 20 most common PINs", () => {
    expect(COMMON_PINS).toHaveLength(20)
    expect(new Set(COMMON_PINS).size).toBe(20)
    for (const pin of COMMON_PINS) {
      expect(isPinFormat(pin), pin).toBe(true)
      expect(pinProblem(pin, pin)).toBe("common")
    }
  })

  it("needs the same PIN twice", () => {
    expect(pinProblem("482915", "482916")).toBe("mismatch")
    expect(pinProblem("48291", "48291")).toBe("format")
    expect(pinProblem("482915", "482915")).toBeNull()
  })
})
