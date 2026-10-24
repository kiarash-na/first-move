// @vitest-environment node
import { describe, expect, it } from "vitest"
import { classifyHeatDensity, toMwhPerMeter } from "./heat-density"

describe("TBL-9 heat density classes (OQ-10, OQ-20)", () => {
  it("converts kWh/m to MWh/m", () => {
    // 2 000 kWh/m / 1 000 = 2 MWh/m
    expect(toMwhPerMeter(2_000)).toBe(2)
  })

  it.each([
    [2, "high"],
    [1.5001, "high"],
    [1.5, "medium"], // "Above 1.5" is exclusive
    [0.5, "medium"],
    [0.4999, "low"],
    [0, "low"],
  ] as const)("%s MWh/m → %s", (density, expected) => {
    expect(classifyHeatDensity(density)).toBe(expected)
  })

  it("classifies in MWh/m, not kWh/m", () => {
    // 1 200 kWh/m = 1.2 MWh/m → medium (as kWh/m it would wrongly be high)
    expect(classifyHeatDensity(toMwhPerMeter(1_200))).toBe("medium")
  })
})
