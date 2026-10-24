// @vitest-environment node
import { describe, expect, it } from "vitest"
import { formatIndicator } from "./indicator-format"

const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, " ")

describe("formatIndicator (TBL-7..10, OQ-21: number and class agree)", () => {
  it("never shows a coverage just under 100 % as 100 %", () => {
    expect(formatIndicator("coverage", 0.9976, "en")).toBe("99%")
    expect(plain(formatIndicator("coverage", 0.9976, "de"))).toBe("99 %")
    expect(formatIndicator("coverage", 1.004, "en")).toBe("100%")
    expect(formatIndicator("coverage", 0.954, "en")).toBe("95%")
  })

  it("rounds E, heat density, building density and CH toward their class", () => {
    expect(formatIndicator("economic", 0.996, "en")).toBe("0.99")
    expect(formatIndicator("heatDensity", 0.496, "en")).toBe("0.49")
    expect(formatIndicator("buildingDensity", 9.96, "de")).toBe("9,9")
    expect(formatIndicator("buildingDensity", 12.34, "en")).toBe("12.3")
    expect(formatIndicator("chRatio", 0.7996, "en")).toBe("0.79")
  })

  it("shows a dash for a missing value", () => {
    expect(formatIndicator("chRatio", null, "en")).toBe("–")
    expect(formatIndicator("coverage", undefined, "en")).toBe("–")
  })
})
