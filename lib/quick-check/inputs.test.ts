// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { readInputs } from "./inputs"

const empty = () => createProject({ modules: { quickCheck: true }, id: "00000000-0000-4000-8000-000000000000" })

describe("readInputs", () => {
  it("reads an empty project as not entered", () => {
    const inputs = readInputs(empty())
    expect(inputs.totalBuildings).toBeNull()
    expect(inputs.projectAreaM2).toBeNull()
    expect(inputs.shares.residential.until_1919).toBe(0)
    expect(inputs.sources).toEqual([])
    expect(inputs.pv).toBe(false)
    expect(inputs.manualHeatingDemandKwh).toBeNull()
    expect(inputs.manualNetworkLengthM).toBeNull()
    expect(inputs.industry).toBe(false)
    expect(inputs.unknownSources).toEqual([])
  })

  it("divides the shares by 100 (OQ-01) and lists the selected sources in table order", () => {
    const { project } = applyPatch(
      empty(),
      {
        "buildings.total": 12,
        "buildings.areaM2": 5_000,
        "buildings.shares.residential.1991_2010": 50,
        "buildings.shares.industry.2011_today": 12.5,
        "sources.potentials.ambient_air": "unknown",
        "sources.potentials.geothermal": "high",
        "sources.pv": true,
        "quickCheck.manualDemand.coolingKwhPerYear": 0,
        "quickCheck.networkLengthM": 250,
      },
      { atomic: true },
    )
    const inputs = readInputs(project)
    expect(inputs.totalBuildings).toBe(12)
    expect(inputs.projectAreaM2).toBe(5_000)
    expect(inputs.shares.residential["1991_2010"]).toBe(0.5)
    expect(inputs.shares.industry["2011_today"]).toBe(0.125)
    expect(inputs.sources).toEqual([
      { source: "geothermal", potential: "high" },
      { source: "ambient_air", potential: "unknown" },
    ])
    expect(inputs.pv).toBe(true)
    expect(inputs.manualCoolingDemandKwh).toBe(0)
    expect(inputs.manualNetworkLengthM).toBe(250)
    expect(inputs.industry).toBe(true)
    expect(inputs.unknownSources).toEqual(["ambient_air"])
  })

  it("does not flag industry for a share of 0", () => {
    const { project } = applyPatch(empty(), { "buildings.shares.industry.until_1919": 0 })
    expect(readInputs(project).industry).toBe(false)
  })
})
