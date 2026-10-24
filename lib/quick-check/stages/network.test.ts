// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createGuard } from "./guard"
import { networkStage } from "./network"

describe("network stage (EQ-3.3, EQ-3.4a/b, EQ-3.5)", () => {
  it("estimates the length from the density", () => {
    const guard = createGuard()
    // 30 buildings on 10 000 m² = 30 /ha → 171.22 / (1 + 8.817 · e^(−16.47)) ≈ 171.2199 m/ha · 1 ha
    const result = networkStage({ totalBuildings: 30, projectAreaM2: 10_000, manualNetworkLengthM: null, heatingDemandKwh: 1_712_199 }, guard)
    expect(result.buildingDensity).toBe(30)
    expect(result.networkLengthM).toBeCloseTo(171.2199, 4)
    expect(result.estimatedNetworkLengthM).toBe(result.networkLengthM)
    // 1 712 199 kWh/a / 171.2199 m ≈ 10 000 kWh/m = 10 MWh/m
    expect(result.heatDensityMwhPerM).toBeCloseTo(10, 3)
    expect(guard.invalid).toEqual([])
  })

  it("uses an entered length (QCT-IN-08)", () => {
    const result = networkStage(
      { totalBuildings: 30, projectAreaM2: 10_000, manualNetworkLengthM: 400, heatingDemandKwh: 800_000 },
      createGuard(),
    )
    // 800 000 / 400 = 2 000 kWh/m = 2 MWh/m
    expect(result.networkLengthM).toBe(400)
    expect(result.heatDensityKwhPerM).toBe(2_000)
    expect(result.heatDensityMwhPerM).toBe(2)
  })

  it("records a zero area or length", () => {
    const guard = createGuard()
    networkStage({ totalBuildings: 3, projectAreaM2: 0, manualNetworkLengthM: 0, heatingDemandKwh: 1 }, guard)
    expect(guard.invalid).toEqual(["buildings.areaM2", "quickCheck.networkLengthM"])
  })
})
