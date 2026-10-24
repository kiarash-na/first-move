// @vitest-environment node
import { describe, expect, it } from "vitest"
import { ECONOMIC_PARAMETERS } from "@/lib/project/catalog/economic-parameters"
import { ECONOMIC_LIMITS, LIMITS, MIN_SELECTED_SOURCES, SHARE_SUM, TEXT_LIMITS, type NumberLimit } from "./limits"

const lower = (limit: NumberLimit) => limit.min ?? limit.exclusiveMin

describe("limits", () => {
  it("set the documented Quick Check bounds (PLAN-DASH-03)", () => {
    expect(LIMITS.buildingsTotal).toEqual({ min: 1, max: 100_000, integer: true })
    expect(LIMITS.areaM2.exclusiveMin).toBe(0)
    expect(LIMITS.share).toEqual({ min: 0, max: 100 })
    expect(SHARE_SUM).toEqual({ target: 100, tolerance: 1e-6 })
    expect(MIN_SELECTED_SOURCES).toBe(1)
  })

  it("keep COPs where EQ-3.8a and EQ-3.11 are defined", () => {
    expect(LIMITS.heatingCop.exclusiveMin).toBe(1)
    expect(LIMITS.coolingCop.exclusiveMin).toBe(0)
  })

  it("are well formed: one lower bound, below the upper bound", () => {
    for (const limit of [...Object.values(LIMITS), ...Object.values(ECONOMIC_LIMITS)] as NumberLimit[]) {
      expect(limit.min !== undefined && limit.exclusiveMin !== undefined).toBe(false)
      expect(lower(limit)).toBeDefined()
      expect(lower(limit)!).toBeLessThan(limit.max)
    }
  })

  it("cover every TBL-6 row; % rows stay within 0–100", () => {
    expect(Object.keys(ECONOMIC_LIMITS)).toEqual([...ECONOMIC_PARAMETERS])
    for (const key of ["pv_cost_reduction", "interest_rate"] as const) expect(ECONOMIC_LIMITS[key]).toEqual({ min: 0, max: 100 })
  })

  it("bound free text", () => {
    expect(TEXT_LIMITS.short).toBeLessThan(TEXT_LIMITS.long)
  })
})
