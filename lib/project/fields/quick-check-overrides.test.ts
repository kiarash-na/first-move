// @vitest-environment node
import { describe, expect, it } from "vitest"
import { QUICK_CHECK_OVERRIDE_FIELDS, QUICK_CHECK_OVERRIDE_GROUPS } from "./quick-check-overrides"

const inGroup = (id: string) => QUICK_CHECK_OVERRIDE_FIELDS.filter((field) => field.group === id)
const field = (id: string) => QUICK_CHECK_OVERRIDE_FIELDS.find((entry) => entry.id === id)!

describe("parameter overrides (D-10)", () => {
  it("offers every TBL-4/5 cell that has a default, and no dash cell (OQ-13)", () => {
    expect(inGroup("quickCheck.overrides.heating")).toHaveLength(23)
    expect(inGroup("quickCheck.overrides.cooling")).toHaveLength(16)
    expect(QUICK_CHECK_OVERRIDE_FIELDS.some((entry) => entry.id.endsWith("solar_thermal.cop"))).toBe(false)
    expect(QUICK_CHECK_OVERRIDE_FIELDS.some((entry) => entry.id.startsWith("quickCheck.overrides.cooling.waste_heat"))).toBe(false)
  })

  it("lists only sources with cooling cells as rows of the cooling grid", () => {
    const cooling = QUICK_CHECK_OVERRIDE_GROUPS.find((group) => group.id === "quickCheck.overrides.cooling")!
    expect(cooling.rows?.keys).toEqual(["geothermal", "ground_water", "surface_water", "ambient_air"])
  })

  it("gives capacities kWh/a and COPs no unit, with their equations", () => {
    expect(field("quickCheck.overrides.heating.geothermal.low")).toMatchObject({ unit: "kWh/a", feeds: ["EQ-3.8a"] })
    expect(field("quickCheck.overrides.heating.geothermal.cop")).toMatchObject({ exclusiveMin: 1, feeds: ["EQ-3.8a", "EQ-3.11"] })
    expect(field("quickCheck.overrides.heating.geothermal.cop")).not.toHaveProperty("unit")
    expect(field("quickCheck.overrides.cooling.ambient_air.cop")).toMatchObject({ exclusiveMin: 0, feeds: ["EQ-3.8b", "EQ-3.11"] })
  })

  it("offers every TBL-6 row in its unit; % rows are percent, the period whole years", () => {
    expect(inGroup("quickCheck.overrides.economic")).toHaveLength(17)
    expect(field("quickCheck.overrides.economic.interest_rate")).toMatchObject({ kind: "percent", unit: "%", feeds: ["EQ-3.10e"] })
    expect(field("quickCheck.overrides.economic.depreciation_period")).toMatchObject({ kind: "integer", unit: "a" })
    expect(field("quickCheck.overrides.economic.heat_pump")).toMatchObject({ kind: "number", unit: "€/building" })
    expect(field("quickCheck.overrides.economic.installation_costs_ambient_air").openQuestions).toEqual(["OQ-18"])
  })

  it("lives on the Assumptions page", () => {
    expect(QUICK_CHECK_OVERRIDE_FIELDS.every((entry) => entry.step === "assumptions" && entry.nullable)).toBe(true)
  })
})
