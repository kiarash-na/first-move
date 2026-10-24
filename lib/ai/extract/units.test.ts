import { describe, expect, it } from "vitest"
import { convertUnit, normalizeUnit } from "./units"

describe("normalizeUnit", () => {
  it.each([
    ["m2", "m²"],
    ["qm", "m²"],
    ["Hektar", "ha"],
    ["MWh", "MWh/a"],
    ["GWh p.a.", "GWh/a"],
    ["kWh/Jahr", "kWh/a"],
    ["EUR/kWh", "€/kWh"],
    ["Cent/kWh", "ct/kWh"],
    ["Prozent", "%"],
    ["Jahre", "a"],
  ])("reads %s as %s", (spelling, unit) => {
    expect(normalizeUnit(spelling)).toBe(unit)
  })

  it("knows no other units", () => {
    expect(normalizeUnit("furlongs")).toBeNull()
  })
})

describe("convertUnit", () => {
  it("converts within a dimension", () => {
    expect(convertUnit(12, "ha", "m²")).toEqual({ ok: true, value: 120_000 })
    expect(convertUnit(2.5, "GWh", "kWh/a")).toEqual({ ok: true, value: 2_500_000 })
    expect(convertUnit(1_200, "MWh/a", "kWh/a")).toEqual({ ok: true, value: 1_200_000 })
    expect(convertUnit(2.3, "km", "m")).toEqual({ ok: true, value: 2_300 })
    expect(convertUnit(32, "ct/kWh", "€/kWh")).toEqual({ ok: true, value: 0.32 })
    expect(convertUnit(80, "€/MWh", "€/kWh")).toEqual({ ok: true, value: 0.08 })
  })

  it("keeps the value when no unit is stated, the units match, or the field has no unit", () => {
    expect(convertUnit(120, undefined, "m²")).toEqual({ ok: true, value: 120 })
    expect(convertUnit(120, "m2", "m²")).toEqual({ ok: true, value: 120 })
    expect(convertUnit(45, "EUR/m²", "€/m²")).toEqual({ ok: true, value: 45 })
    expect(convertUnit(120, "buildings", undefined)).toEqual({ ok: true, value: 120 })
  })

  it("never guesses across dimensions or with unknown units", () => {
    expect(convertUnit(12, "ha", "kWh/a")).toEqual({ ok: false, reason: "unit-mismatch" })
    expect(convertUnit(12, "MWh", "€/m²")).toEqual({ ok: false, reason: "unit-mismatch" })
    expect(convertUnit(12, "acres", "m²")).toEqual({ ok: false, reason: "unknown-unit" })
  })
})
