import { describe, expect, it } from "vitest"
import { formatNumber, formatQuantity } from "./number"

const plain = (s: string) => s.replace(/[  ]/g, " ")

describe("formatNumber", () => {
  it("uses the language's separators (D-21)", () => {
    expect(formatNumber(1234.5, "en")).toBe("1,234.5")
    expect(formatNumber(1234.5, "de")).toBe("1.234,5")
  })

  it("passes Intl options through", () => {
    expect(formatNumber(2.345, "de", { maximumFractionDigits: 1 })).toBe("2,3")
    expect(formatNumber(2, "en", { minimumFractionDigits: 2 })).toBe("2.00")
  })

  it("shows a dash for missing or non-finite values", () => {
    for (const value of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(formatNumber(value, "en")).toBe("–")
    }
  })
})

describe("formatQuantity", () => {
  it("joins number and unit with a no-break space", () => {
    expect(formatQuantity(12.5, "m", "de")).toBe("12,5 m")
    expect(plain(formatQuantity(1200, "m", "en"))).toBe("1,200 m")
  })

  it("shows a dash without the unit for missing values", () => {
    expect(formatQuantity(null, "m", "en")).toBe("–")
  })
})
