import { describe, expect, it } from "vitest"
import { formatPercent } from "./percent"

const plain = (s: string) => s.replace(/[  ]/g, " ")

describe("formatPercent", () => {
  it("formats a fraction as a percentage", () => {
    expect(formatPercent(0.256, "en")).toBe("26%")
    expect(plain(formatPercent(0.256, "de"))).toBe("26 %")
  })

  it("supports fraction digits", () => {
    expect(formatPercent(0.2567, "en", { fractionDigits: 1 })).toBe("25.7%")
    expect(plain(formatPercent(0.2567, "de", { fractionDigits: 1 }))).toBe("25,7 %")
    expect(formatPercent(0.25, "en", { fractionDigits: 1 })).toBe("25%")
  })

  it("shows a dash for missing values", () => {
    expect(formatPercent(Number.NaN, "en")).toBe("–")
  })
})
