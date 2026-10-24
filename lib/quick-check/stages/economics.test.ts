// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project/create-project"
import { effectiveParameters } from "../params"
import { economicsStage, type EconomicsStageInput } from "./economics"
import { createGuard } from "./guard"

const economic = effectiveParameters(createProject({ modules: { quickCheck: true } }).quickCheck.overrides).economic

const input: EconomicsStageInput = {
  cells: [{ buildings: 2, floorAreaM2: 500 }],
  totalBuildings: 2,
  heatingDemandKwh: 100_000,
  coolingDemandKwh: 10_000,
  networkLengthM: 100,
  supplyInvestments: [20_000, 5_000],
  electricityCosts: 3_000,
  economic: { ...economic, interest_rate: 0, depreciation_period: 25 },
}

describe("economics stage (EQ-3.9a-c, EQ-3.10a-f, EQ-3.12, OQ-21)", () => {
  it("computes revenues, investment and annual costs", () => {
    const result = economicsStage(input, createGuard())
    // a = 1 / 25 = 0.04 (i = 0)
    expect(result.annuityFactor).toBe(0.04)
    // R_heat: 2 · 500 · 6 + 100 000 · 0.12 = 6 000 + 12 000; R_cool: 2 · 500 · 3 + 10 000 · 0.08 = 3 000 + 800
    expect(result.heatingRevenue).toBeCloseTo(18_000, 9)
    expect(result.coolingRevenue).toBeCloseTo(3_800, 9)
    // connection: 1 000 · 2 · 0.04 = 80 → R = 21 880
    expect(result.connectionFeeRevenue).toBeCloseTo(80, 9)
    expect(result.overallRevenue).toBeCloseTo(21_880, 9)
    // C_overall = 15 000 · 2 + 500 · 100 + 25 000 = 30 000 + 50 000 + 25 000 = 105 000
    expect(result.overallInvestment).toBe(105_000)
    // C_annual = 105 000 · 0.04 = 4 200; C_O&M = 2 100; annual costs 4 200 + 3 000 + 2 100 = 9 300
    expect(result.annualizedCosts).toBeCloseTo(4_200, 9)
    expect(result.operationAndMaintenance).toBe(2_100)
    expect(result.annualCosts).toBeCloseTo(9_300, 9)
    // E = 21 880 / 9 300 = 2.3527
    expect(result.economicRatio).toBeCloseTo(2.352688, 6)
  })

  it("records a depreciation period of 0", () => {
    const guard = createGuard()
    economicsStage({ ...input, economic: { ...input.economic, depreciation_period: 0 } }, guard)
    expect(guard.invalid).toEqual(["quickCheck.overrides.economic.depreciation_period"])
  })
})
