// @vitest-environment node
import { describe, expect, it } from "vitest"
import { quickCheckSchema } from "./quick-check"

const { manualDemand, networkLengthM } = quickCheckSchema.shape

describe("quickCheckSchema", () => {
  it("takes two optional manual totals in kWh/a, 0 included (QCT-IN-05, OQ-05)", () => {
    expect(Object.keys(manualDemand.shape)).toEqual(["heatingKwhPerYear", "coolingKwhPerYear"])
    for (const value of [null, 0, 1_250_000]) {
      expect(manualDemand.shape.heatingKwhPerYear.safeParse(value).success).toBe(true)
      expect(manualDemand.shape.coolingKwhPerYear.safeParse(value).success).toBe(true)
    }
    expect(manualDemand.shape.heatingKwhPerYear.safeParse(-5).success).toBe(false)
  })

  it("takes an optional network length above 0 m (QCT-IN-08)", () => {
    expect(networkLengthM.safeParse(null).success).toBe(true)
    expect(networkLengthM.safeParse(850).success).toBe(true)
    expect(networkLengthM.safeParse(0).success).toBe(false)
  })

  it("stores no density category: it is derived (OQ-04)", () => {
    expect(Object.keys(quickCheckSchema.shape)).toEqual(["manualDemand", "networkLengthM", "overrides"])
  })
})
