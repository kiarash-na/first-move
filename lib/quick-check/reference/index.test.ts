// @vitest-environment node
import { describe, expect, it } from "vitest"
import { ECONOMIC_PARAMETERS } from "@/lib/project/catalog/economic-parameters"
import { buildingTableValue, capacityTableValue, economicTableValue } from "./index"

describe("reference tables", () => {
  it("reads TBL-1..3 by type and period (printed values)", () => {
    expect(buildingTableValue("TBL-1", "residential", "until_1919")).toBe(124.4)
    expect(buildingTableValue("TBL-1", "category_c", "2011_today")).toBe(90)
    expect(buildingTableValue("TBL-2", "residential", "1991_2010")).toBe(8.5)
    expect(buildingTableValue("TBL-3", "category_a", "1961_1990")).toBe(1050)
    expect(buildingTableValue("TBL-3", "category_b", "1919_1960")).toBe(1508.8)
  })

  it("returns null for the industry dashes (OQ-02)", () => {
    expect(buildingTableValue("TBL-1", "industry", "1961_1990")).toBeNull()
    expect(buildingTableValue("TBL-3", "industry", "2011_today")).toBeNull()
  })

  it("reads TBL-4/5 cells, null for a dash (OQ-13)", () => {
    expect(capacityTableValue("heating", "ground_water", "high")).toBe(150000)
    expect(capacityTableValue("heating", "ground_water", "cop")).toBe(5)
    expect(capacityTableValue("heating", "solar_thermal", "cop")).toBeNull()
    expect(capacityTableValue("cooling", "surface_water", "cop")).toBe(4.5)
    expect(capacityTableValue("cooling", "waste_heat", "medium")).toBeNull()
  })

  it("reads every TBL-6 default in its printed unit", () => {
    expect(economicTableValue("heat_pump")).toBe(15000)
    expect(economicTableValue("interest_rate")).toBe(3)
    expect(economicTableValue("pv_cost_reduction")).toBe(30)
    expect(economicTableValue("installation_costs_ambient_air")).toBeNull()
    for (const key of ECONOMIC_PARAMETERS) expect(() => economicTableValue(key)).not.toThrow()
    expect(() => economicTableValue("missing" as never)).toThrow("missing")
  })
})
