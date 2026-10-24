// @vitest-environment node
import { describe, expect, it } from "vitest"
import { BUILDING_TYPES } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS } from "@/lib/project/catalog/construction-periods"
import { emptyValue } from "@/lib/project/empty-value"
import { buildingsSchema, shareGridSchema, shareSchema } from "./buildings"

describe("buildingsSchema", () => {
  it("holds total, area and a 5 × 5 share grid", () => {
    expect(Object.keys(buildingsSchema.shape)).toEqual(["total", "areaM2", "shares"])
    expect(Object.keys(shareGridSchema.shape)).toEqual([...BUILDING_TYPES])
    expect(Object.keys(shareGridSchema.shape.residential.shape)).toEqual([...CONSTRUCTION_PERIODS])
  })

  it("starts with an empty grid (D-31)", () => {
    const grid = emptyValue(shareGridSchema) as Record<string, Record<string, unknown>>
    expect(Object.values(grid).flatMap((row) => Object.values(row))).toEqual(Array(25).fill(null))
  })

  it("limits the building count to 1–100 000 whole buildings (QCT-IN-01)", () => {
    const total = buildingsSchema.shape.total
    expect([1, 100_000, null].every((value) => total.safeParse(value).success)).toBe(true)
    expect([0, 100_001, 2.5, -1, Number.NaN, "10"].some((value) => total.safeParse(value).success)).toBe(false)
  })

  it("needs an area above 0 m² (QCT-IN-02)", () => {
    const area = buildingsSchema.shape.areaM2
    expect(area.safeParse(0.5).success).toBe(true)
    expect(area.safeParse(0).success).toBe(false)
    expect(area.safeParse(Number.POSITIVE_INFINITY).success).toBe(false)
  })

  it("keeps a share within 0–100 % as typed (OQ-01)", () => {
    expect([0, 33.3, 100, null].every((value) => shareSchema.safeParse(value).success)).toBe(true)
    expect([-1, 100.5, "50"].some((value) => shareSchema.safeParse(value).success)).toBe(false)
  })

  it("accepts a grid that does not add up to 100: that is incompleteness, not invalid input (R-03)", () => {
    const grid = emptyValue(shareGridSchema) as { residential: Record<string, number | null> }
    grid.residential["1991_2010"] = 40
    expect(shareGridSchema.safeParse(grid).success).toBe(true)
  })
})
