import { describe, expect, it } from "vitest"
import { formatEur } from "./currency"

const plain = (s: string) => s.replace(/[  ]/g, " ")

describe("formatEur", () => {
  it("rounds to whole euros by default", () => {
    expect(formatEur(1234.56, "en")).toBe("€1,235")
    expect(plain(formatEur(1234.56, "de"))).toBe("1.235 €")
  })

  it("supports fraction digits", () => {
    expect(formatEur(0.1234, "en", { fractionDigits: 2 })).toBe("€0.12")
    expect(plain(formatEur(12.5, "de", { fractionDigits: 2 }))).toBe("12,50 €")
  })

  it("supports compact notation", () => {
    expect(formatEur(1_250_000, "en", { compact: true })).toBe("€1.3M")
    expect(plain(formatEur(1_250_000, "de", { compact: true }))).toBe("1,3 Mio. €")
  })

  it("formats negative amounts", () => {
    expect(formatEur(-500, "en")).toBe("-€500")
  })

  it("shows a dash for missing values", () => {
    expect(formatEur(undefined, "de")).toBe("–")
  })
})
