// @vitest-environment node
import { describe, expect, it } from "vitest"
import { coolingCoverage } from "./eq-3-06b-cooling-coverage"

describe("EQ-3.6b cooling coverage", () => {
  it("divides the supply by the demand", () => {
    // 50 / 200 = 0.25 (25 %)
    expect(coolingCoverage(50, 200)).toBe(0.25)
  })

  it("is null without cooling demand (not relevant, OQ-22)", () => {
    expect(coolingCoverage(50, 0)).toBeNull()
  })
})
