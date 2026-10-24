// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project/create-project"
import { effectiveParameters } from "../params"
import { createGuard } from "./guard"
import { supplyStage } from "./supply"

const parameters = () => effectiveParameters(createProject({ modules: { quickCheck: true } }).quickCheck.overrides)

describe("supply stage (EQ-3.8a/b, EQ-3.10b, EQ-3.11, OQ-06, OQ-11)", () => {
  it("sums supply and electricity over the sources", () => {
    const guard = createGuard()
    const result = supplyStage(
      [
        { source: "geothermal", potential: "low" },
        { source: "surface_water", potential: "medium" },
      ],
      parameters(),
      false,
      guard,
    )
    // geothermal low: 10 000 · 4.5 / 3.5 = 12 857.14 heat; 10 000 · 5 / 6 = 8 333.33 cold
    // surface water medium: 50 000 · 4 / 3 = 66 666.67 heat; 50 000 · 4.5 / 5.5 = 40 909.09 cold
    expect(result.heatingSupplyKwh).toBeCloseTo(12_857.142857 + 66_666.666667, 5)
    expect(result.coolingSupplyKwh).toBeCloseTo(8_333.333333 + 40_909.090909, 5)
    // el: (12 857.14 / 4.5 + 8 333.33 / 5 + 66 666.67 / 4 + 40 909.09 / 4.5) · 0.2
    //   = (2 857.14 + 1 666.67 + 16 666.67 + 9 090.91) · 0.2 = 6 056.28 €/a
    expect(result.electricityCostsWithoutPv).toBeCloseTo(6_056.277, 3)
    expect(result.electricityCosts).toBe(result.electricityCostsWithoutPv)
    // C_i: 1.5 · 12 857.14 = 19 285.71; 0.8 · 66 666.67 = 53 333.33
    expect(result.sources.map((source) => source.investment)).toEqual([
      expect.closeTo(19_285.714, 3),
      expect.closeTo(53_333.333, 3),
    ])
    expect(guard.invalid).toEqual([])
  })

  it("applies the PV reduction to each source and the total (OQ-06)", () => {
    const result = supplyStage([{ source: "ambient_air", potential: "high" }], parameters(), true, createGuard())
    // 150 000 · 3 / 2 = 225 000 heat → 75 000 kWh el; 150 000 · 3.5 / 4.5 = 116 666.67 cold → 33 333.33 kWh el
    // (75 000 + 33 333.33) · 0.2 = 21 666.67 €/a → · 0.7 = 15 166.67 €/a
    expect(result.electricityCostsWithoutPv).toBeCloseTo(21_666.667, 3)
    expect(result.electricityCosts).toBeCloseTo(15_166.667, 3)
    expect(result.sources[0].electricityCosts).toBeCloseTo(15_166.667, 3)
  })

  it("adds nothing for Unknown potential (R-01)", () => {
    const result = supplyStage([{ source: "geothermal", potential: "unknown" }], parameters(), false, createGuard())
    expect(result.sources[0]).toMatchObject({ heatingAvailableKwh: 0, heatingSupplyKwh: 0, investment: 0, electricityCosts: 0 })
    expect(result.heatingSupplyKwh).toBe(0)
  })

  it("records a COP that makes a term impossible", () => {
    const params = parameters()
    params.heating.geothermal.cop = 0
    const guard = createGuard()
    const result = supplyStage([{ source: "geothermal", potential: "low" }], params, false, guard)
    expect(guard.invalid).toEqual(["quickCheck.overrides.heating.geothermal.cop"])
    expect(result.electricityCostsWithoutPv).toBe(0)
  })
})
