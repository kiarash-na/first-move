import { describe, expect, it } from "vitest"
import { formatEnergy, formatEur } from "@/lib/i18n/format"
import { splitUnit } from "./split-unit"

describe("splitUnit", () => {
  it("separates the unit of an energy value in both languages", () => {
    expect(splitUnit(formatEnergy(1_230_000, "en", { perYear: true }))).toEqual({ number: "1.23", unit: "GWh/a" })
    expect(splitUnit(formatEnergy(1_230_000, "de", { perYear: true }))).toEqual({ number: "1,23", unit: "GWh/a" })
  })

  it("keeps text without a space whole", () => {
    expect(splitUnit("126%")).toEqual({ number: "126%", unit: "" })
    expect(splitUnit(formatEur(1_234_567, "en", { compact: true }))).toEqual({ number: "€1.2M", unit: "" })
  })

  it("splits a German euro amount at its symbol", () => {
    const { number, unit } = splitUnit(formatEur(1_234_567, "de", { compact: true }))
    expect(unit).toContain("€")
    expect(number).toMatch(/^1,2/)
  })
})
