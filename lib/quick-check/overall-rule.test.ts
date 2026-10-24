// @vitest-environment node
import { describe, expect, it } from "vitest"
import { overallResult, type OverallRuleInput } from "./overall-rule"

/** A project that meets every Promising criterion. */
const good: OverallRuleInput = {
  industry: false,
  unknownSources: [],
  coverage: { heating: "feasible", cooling: "conditionally_feasible" },
  buildingDensity: "medium",
  heatDensity: "high",
  economic: "favorable",
}

const withInput = (patch: Partial<OverallRuleInput>): OverallRuleInput => ({ ...good, ...patch })

describe("overall rule (TBL-11, OQ-22)", () => {
  describe("(1) forced: Further analysis required", () => {
    it("for an industry share (QCT-RULE-INDUSTRY)", () => {
      expect(overallResult(withInput({ industry: true }))).toEqual({
        level: "further_analysis",
        forced: true,
        step: "forced",
        reasons: [{ code: "industry" }],
      })
    })

    it("for a selected source with Unknown potential (QCT-RULE-UNKNOWN)", () => {
      const result = overallResult(withInput({ unknownSources: ["geothermal", "ambient_air"] }))
      expect(result.level).toBe("further_analysis")
      expect(result.forced).toBe(true)
      expect(result.reasons).toEqual([{ code: "unknown_source", sources: ["geothermal", "ambient_air"] }])
    })

    it("before Not promising, with both reasons", () => {
      const result = overallResult(
        withInput({ industry: true, unknownSources: ["waste_heat"], economic: "clearly_unfavorable" }),
      )
      expect(result.level).toBe("further_analysis")
      expect(result.reasons.map((reason) => reason.code)).toEqual(["industry", "unknown_source"])
    })
  })

  describe("(2) Not promising", () => {
    it("when the economic assessment is clearly unfavorable, even with full coverage", () => {
      expect(overallResult(withInput({ economic: "clearly_unfavorable" }))).toEqual({
        level: "not_promising",
        forced: false,
        step: "not_promising",
        reasons: [{ code: "economics_clearly_unfavorable" }],
      })
    })

    it("when a relevant coverage is below 70 % and both densities are low", () => {
      const result = overallResult(
        withInput({ coverage: { heating: "not_feasible", cooling: "feasible" }, buildingDensity: "low", heatDensity: "low" }),
      )
      expect(result.level).toBe("not_promising")
      expect(result.reasons).toEqual([{ code: "low_coverage_and_densities", demands: ["heating"] }])
    })

    it("with both reasons", () => {
      const result = overallResult(
        withInput({
          coverage: { heating: "not_feasible", cooling: "not_feasible" },
          buildingDensity: "low",
          heatDensity: "low",
          economic: "clearly_unfavorable",
        }),
      )
      expect(result.reasons).toEqual([
        { code: "economics_clearly_unfavorable" },
        { code: "low_coverage_and_densities", demands: ["heating", "cooling"] },
      ])
    })

    it("not when only one density is low", () => {
      const result = overallResult(withInput({ coverage: { heating: "not_feasible", cooling: "feasible" }, buildingDensity: "low" }))
      expect(result.level).toBe("further_analysis")
      expect(result.reasons).toEqual([
        { code: "coverage_below_promising", demands: ["heating"] },
        { code: "building_density_low" },
      ])
    })

    it("not for a coverage below 70 % of a demand that is not relevant", () => {
      const result = overallResult(
        withInput({ coverage: { heating: "feasible", cooling: null }, buildingDensity: "low", heatDensity: "low" }),
      )
      expect(result.level).toBe("further_analysis")
    })
  })

  describe("(3) Promising", () => {
    it("when every relevant demand is ≥ 90 %, economics favorable and no density low", () => {
      expect(overallResult(good)).toEqual({
        level: "promising",
        forced: false,
        step: "promising",
        reasons: [
          { code: "coverage_sufficient", demands: ["heating", "cooling"] },
          { code: "economics_favorable" },
          { code: "densities_not_low" },
        ],
      })
    })

    it("ignores a demand that is not relevant (= 0)", () => {
      const result = overallResult(withInput({ coverage: { heating: "conditionally_feasible", cooling: null } }))
      expect(result.level).toBe("promising")
      expect(result.reasons[0]).toEqual({ code: "coverage_sufficient", demands: ["heating"] })
    })

    it("accepts medium densities (not low)", () => {
      expect(overallResult(withInput({ buildingDensity: "medium", heatDensity: "medium" })).level).toBe("promising")
    })
  })

  describe("(4) otherwise Further analysis required", () => {
    it.each([
      [{ coverage: { heating: "limited_feasibility", cooling: "feasible" } }, [{ code: "coverage_below_promising", demands: ["heating"] }]],
      [{ economic: "unclear" }, [{ code: "economics_unclear" }]],
      [{ economic: null }, [{ code: "economics_unclear" }]],
      [{ buildingDensity: "low" }, [{ code: "building_density_low" }]],
      [{ heatDensity: "low" }, [{ code: "heat_density_low" }]],
      [{ coverage: { heating: null, cooling: null } }, [{ code: "no_relevant_demand" }]],
    ] as [Partial<OverallRuleInput>, unknown][])("%j → %j", (patch, reasons) => {
      const result = overallResult(withInput(patch))
      expect(result.level).toBe("further_analysis")
      expect(result.forced).toBe(false)
      expect(result.step).toBe("otherwise")
      expect(result.reasons).toEqual(reasons)
    })

    it("lists every unmet criterion", () => {
      const result = overallResult(
        withInput({ coverage: { heating: "not_feasible", cooling: "limited_feasibility" }, economic: "unclear", heatDensity: "low" }),
      )
      expect(result.reasons).toEqual([
        { code: "coverage_below_promising", demands: ["heating", "cooling"] },
        { code: "economics_unclear" },
        { code: "heat_density_low" },
      ])
    })
  })
})
