// @vitest-environment node
import { describe, expect, it } from "vitest"
import { BUSINESS_PLAN_STEPS, QUICK_CHECK_STEPS } from "./steps"

describe("steps", () => {
  it("follow the PLAN-DASH-00 routes", () => {
    expect(QUICK_CHECK_STEPS).toEqual(["area", "buildings", "sources", "options"])
    expect(BUSINESS_PLAN_STEPS).toEqual(["opportunity", "business-logic", "reality-check", "implementation"])
  })
})
