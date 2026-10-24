import { describe, expect, it } from "vitest"
import { formatEnergy, scaleEnergy } from "./energy"

const plain = (s: string) => s.replace(/[  ]/g, " ")

describe("scaleEnergy", () => {
  it("picks kWh, MWh or GWh by magnitude", () => {
    expect(scaleEnergy(999)).toEqual({ value: 999, unit: "kWh" })
    expect(scaleEnergy(1000)).toEqual({ value: 1, unit: "MWh" })
    expect(scaleEnergy(12_500)).toEqual({ value: 12.5, unit: "MWh" })
    expect(scaleEnergy(2_500_000)).toEqual({ value: 2.5, unit: "GWh" })
    expect(scaleEnergy(5e9)).toEqual({ value: 5000, unit: "GWh" })
  })

  it("scales negative values by magnitude and keeps zero in kWh", () => {
    expect(scaleEnergy(-12_500)).toEqual({ value: -12.5, unit: "MWh" })
    expect(scaleEnergy(0)).toEqual({ value: 0, unit: "kWh" })
  })
})

describe("formatEnergy", () => {
  it("auto-scales and localises (D-21)", () => {
    expect(plain(formatEnergy(1_234_567, "en"))).toBe("1.23 GWh")
    expect(plain(formatEnergy(1_234_567, "de"))).toBe("1,23 GWh")
    expect(plain(formatEnergy(45_600, "en"))).toBe("45.6 MWh")
    expect(plain(formatEnergy(850, "de"))).toBe("850 kWh")
    expect(plain(formatEnergy(123_456_789, "de"))).toBe("123 GWh")
  })

  it("appends /a for annual values", () => {
    expect(plain(formatEnergy(2_000_000, "en", { perYear: true }))).toBe("2 GWh/a")
  })

  it("accepts a fixed precision", () => {
    expect(plain(formatEnergy(1_234_567, "en", { fractionDigits: 0 }))).toBe("1 GWh")
  })

  it("shows a dash for missing values", () => {
    expect(formatEnergy(null, "en")).toBe("–")
  })
})
