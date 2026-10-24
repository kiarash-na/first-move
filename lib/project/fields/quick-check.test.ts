// @vitest-environment node
import { describe, expect, it } from "vitest"
import { QUICK_CHECK_DERIVED, QUICK_CHECK_FIELDS, QUICK_CHECK_GROUPS } from "./quick-check"

const field = (id: string) => QUICK_CHECK_FIELDS.find((entry) => entry.id === id)!
const group = (id: string) => QUICK_CHECK_GROUPS.find((entry) => entry.id === id)!

describe("Quick Check fields", () => {
  it("asks for buildings and area first; both are required (QCT-IN-01/02)", () => {
    expect(field("buildings.total")).toMatchObject({ step: "area", kind: "integer", min: 1, max: 100_000, required: true })
    expect(field("buildings.areaM2")).toMatchObject({
      step: "area",
      unit: "m²",
      exclusiveMin: 0,
      required: true,
      companion: "hectares",
    })
    expect(field("buildings.total").feeds).toEqual(["EQ-3.1", "EQ-3.3", "EQ-3.9c", "EQ-3.10d"])
  })

  it("lays the shares out as a 5 × 5 grid that must add up to 100 (QCT-IN-04, R-03)", () => {
    const shares = group("buildings.shares")
    expect(shares.rows?.keys).toHaveLength(5)
    expect(shares.columns?.keys).toHaveLength(5)
    expect(shares.rule).toEqual({ kind: "sum", target: 100, tolerance: 1e-6 })
    expect(QUICK_CHECK_FIELDS.filter((entry) => entry.group === "buildings.shares")).toHaveLength(25)
    expect(field("buildings.shares.industry.until_1919").requirements).toContain("QCT-RULE-INDUSTRY")
    expect(field("buildings.shares.residential.until_1919").requirements).not.toContain("QCT-RULE-INDUSTRY")
  })

  it("offers each source with Low/Medium/High/Unknown, and needs one selected (QCT-IN-06/07)", () => {
    const geothermal = field("sources.potentials.geothermal")
    expect(geothermal).toMatchObject({ kind: "choice", options: ["low", "medium", "high", "unknown"], nullable: true })
    expect(group("sources.potentials").rule).toEqual({ kind: "min-selected", min: 1 })
  })

  it("feeds cooling and electricity only for sources that have them (OQ-13)", () => {
    expect(field("sources.potentials.geothermal").feeds).toEqual(["EQ-3.8a", "EQ-3.8b", "EQ-3.10b", "EQ-3.11"])
    expect(field("sources.potentials.waste_heat").feeds).toEqual(["EQ-3.8a", "EQ-3.10b", "EQ-3.11"])
    expect(field("sources.potentials.solar_thermal").feeds).toEqual(["EQ-3.8a", "EQ-3.10b"])
    expect(field("sources.potentials.solar_thermal").tables).toEqual(["TBL-4", "TBL-6"])
  })

  it("puts manual demand, network length and PV in the options step (QCT-IN-05/08/09)", () => {
    expect(field("quickCheck.manualDemand.heatingKwhPerYear")).toMatchObject({ step: "options", replaces: ["EQ-3.2c"] })
    expect(field("quickCheck.manualDemand.coolingKwhPerYear")).toMatchObject({ step: "options", replaces: ["EQ-3.2d"] })
    expect(field("quickCheck.networkLengthM")).toMatchObject({ step: "options", replaces: ["EQ-3.4a", "EQ-3.4b"] })
    expect(field("sources.pv")).toMatchObject({ step: "options", kind: "boolean", feeds: ["EQ-3.11"] })
  })

  it("shares the building stock and sources with Business Plan step 1 (D-01)", () => {
    for (const id of ["buildings.total", "buildings.shares.category_a.1991_2010", "sources.potentials.ground_water"]) {
      expect(field(id).alsoShownIn).toEqual([{ module: "businessPlan", step: "opportunity" }])
    }
  })

  it("derives the density category instead of asking for it (QCT-IN-03, OQ-04)", () => {
    expect(QUICK_CHECK_FIELDS.some((entry) => entry.requirements.includes("QCT-IN-03"))).toBe(false)
    expect(QUICK_CHECK_DERIVED[0]).toMatchObject({ requirements: ["QCT-IN-03"], computedBy: ["EQ-3.3"], tables: ["TBL-8"] })
  })
})
