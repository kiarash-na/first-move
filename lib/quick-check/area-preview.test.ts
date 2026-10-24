import { describe, expect, it } from "vitest"
import { areaPreview } from "./area-preview"

describe("areaPreview (QCT-IN-03, OQ-04)", () => {
  it("is null until both inputs are entered", () => {
    expect(areaPreview(null, 10_000)).toBeNull()
    expect(areaPreview(10, null)).toBeNull()
    expect(areaPreview(10, 0)).toBeNull()
  })

  it("derives the density, its TBL-8 class and the category", () => {
    expect(areaPreview(5, 10_000)).toEqual({ buildingDensity: 5, densityClass: "low", densityCategory: "rural" })
    expect(areaPreview(10, 10_000)).toEqual({ buildingDensity: 10, densityClass: "medium", densityCategory: "sub_urban" })
    expect(areaPreview(31, 10_000)).toMatchObject({ densityClass: "high", densityCategory: "urban" })
  })
})
