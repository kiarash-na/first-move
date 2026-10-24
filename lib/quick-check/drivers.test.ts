// @vitest-environment node
import { describe, expect, it } from "vitest"
import { keyFactors, type DriverInput } from "./drivers"

const promising: DriverInput = {
  industry: false,
  unknownSources: [],
  heatingCoverage: { classification: "feasible", value: 1.2 },
  coolingCoverage: { classification: "conditionally_feasible", value: 0.95 },
  economics: { classification: "favorable", value: 1.1 },
  heatDensity: { classification: "high", value: 2.2 },
  buildingDensity: { classification: "medium", value: 12.5 },
}

const ids = (drivers: { id: string }[]) => drivers.map((driver) => driver.id)

describe("key factors (QCT-KF-01, QCT-KF-05)", () => {
  it("lists every met Promising criterion as supporting", () => {
    const drivers = keyFactors(promising)
    expect(ids(drivers.supporting)).toEqual([
      "economics",
      "heating_coverage",
      "cooling_coverage",
      "heat_density",
      "building_density",
    ])
    expect(drivers.limiting).toEqual([])
    expect(drivers.supporting[1]).toEqual({
      id: "heating_coverage",
      effect: "supporting",
      classification: "feasible",
      value: 1.2,
    })
  })

  it("lists the unmet criteria and the forced triggers as limiting", () => {
    const drivers = keyFactors({
      ...promising,
      industry: true,
      unknownSources: ["surface_water"],
      heatingCoverage: { classification: "limited_feasibility", value: 0.8 },
      economics: { classification: "unclear", value: 0.9 },
      buildingDensity: { classification: "low", value: 4 },
    })
    expect(ids(drivers.limiting)).toEqual([
      "industry",
      "unknown_sources",
      "economics",
      "heating_coverage",
      "building_density",
    ])
    expect(drivers.limiting[1].sources).toEqual(["surface_water"])
    expect(ids(drivers.supporting)).toEqual(["cooling_coverage", "heat_density"])
  })

  it("counts an economic ratio that cannot be computed as limiting", () => {
    const drivers = keyFactors({ ...promising, economics: { classification: null, value: null } })
    expect(ids(drivers.limiting)).toEqual(["economics"])
  })

  it("leaves out a demand that is not relevant", () => {
    const drivers = keyFactors({ ...promising, coolingCoverage: { classification: null, value: null } })
    expect(ids([...drivers.supporting, ...drivers.limiting])).not.toContain("cooling_coverage")
  })
})
