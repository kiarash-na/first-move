import { describe, expect, it } from "vitest"
import { formatEur } from "./currency"

// en-GB writes its compact suffixes in capitals up to CLDR 47 (`€1.3M`) and in lower case from
// CLDR 48 (`€1.3m`); which one shows depends on the runtime's ICU, so both pass.
const ignoringSuffixCase = (s: string) => s.replace(/[km]$/, (suffix) => suffix.toUpperCase())
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
    expect(ignoringSuffixCase(formatEur(1_250_000, "en", { compact: true }))).toBe("€1.3M")
    expect(plain(formatEur(1_250_000, "de", { compact: true }))).toBe("1,3 Mio. €")
  })

  it("never shows tenths of a euro when the language does not abbreviate (D-21)", () => {
    expect(plain(formatEur(89_577.5, "de", { compact: true }))).toBe("89.578 €")
    expect(plain(formatEur(128_100.9, "de", { compact: true }))).toBe("128.101 €")
    expect(plain(formatEur(631_083.3, "de", { compact: true }))).toBe("631.083 €")
    expect(plain(formatEur(8712, "de", { compact: true }))).toBe("8.712 €")
    expect(ignoringSuffixCase(formatEur(128_100.9, "en", { compact: true }))).toBe("€128.1K")
    expect(formatEur(999.6, "en", { compact: true })).toBe("€1,000")
  })

  it("formats negative amounts", () => {
    expect(formatEur(-500, "en")).toBe("-€500")
  })

  it("shows a dash for missing values", () => {
    expect(formatEur(undefined, "de")).toBe("–")
  })
})
