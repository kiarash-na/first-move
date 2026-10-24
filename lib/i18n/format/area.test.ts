import { describe, expect, it } from "vitest"
import { formatHectares, formatSquareMeters } from "./area"

const plain = (s: string) => s.replace(/[  ]/g, " ")

describe("area formatting (D-31)", () => {
  it("formats m² without decimals", () => {
    expect(plain(formatSquareMeters(12_500.4, "en"))).toBe("12,500 m²")
    expect(plain(formatSquareMeters(12_500, "de"))).toBe("12.500 m²")
  })

  it("converts m² to hectares", () => {
    expect(plain(formatHectares(12_500, "en"))).toBe("1.25 ha")
    expect(plain(formatHectares(12_500, "de"))).toBe("1,25 ha")
  })

  it("shows a dash for missing values", () => {
    expect(formatHectares(undefined, "en")).toBe("–")
    expect(formatSquareMeters(null, "de")).toBe("–")
  })
})
