// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch, type ProjectPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import type { Project } from "@/lib/project/schema/project"
import { run } from "./run"
import type { QuickCheckComplete, QuickCheckRun } from "./types"

const ID = "00000000-0000-4000-8000-000000000000"

function project(patch: ProjectPatch): Project {
  const result = applyPatch(createProject({ modules: { quickCheck: true }, id: ID }), patch, { atomic: true })
  if (!result.ok) throw new Error(JSON.stringify(result.errors))
  return result.project
}

function complete(result: QuickCheckRun): QuickCheckComplete {
  if (result.status !== "complete") throw new Error(`incomplete: ${result.missing.join(", ")}`)
  return result
}

/**
 * The QCT-IN-04 example: 4 buildings on 2 000 m², 50 % residential 1991-2010, 25 % residential
 * 2011-today, 25 % Category A 2011-today; ground water high, waste heat medium; PV.
 */
const SMALL: ProjectPatch = {
  "buildings.total": 4,
  "buildings.areaM2": 2_000,
  "buildings.shares.residential.1991_2010": 50,
  "buildings.shares.residential.2011_today": 25,
  "buildings.shares.category_a.2011_today": 25,
  "sources.potentials.ground_water": "high",
  "sources.potentials.waste_heat": "medium",
  "sources.pv": true,
}

describe("run: end to end for a small project (hand-computed)", () => {
  const result = complete(run(project(SMALL)))
  const { values } = result

  it("splits the buildings and estimates the demand (EQ-3.1, EQ-3.2a-d)", () => {
    const cell = (type: string, period: string) => result.cells.find((c) => c.type === type && c.period === period)!
    // N = 4 · 0.5 = 2, 4 · 0.25 = 1, 4 · 0.25 = 1
    expect(cell("residential", "1991_2010").buildings).toBe(2)
    expect(cell("category_a", "2011_today").buildings).toBe(1)
    // 2 · 92.5 · 408 = 75 480 · 1 · 86.3 · 347.8 = 30 015.14 · 1 · 67.5 · 1 166.7 = 78 752.25
    expect(cell("residential", "1991_2010").heatingDemandKwh).toBeCloseTo(75_480, 6)
    expect(cell("residential", "2011_today").heatingDemandKwh).toBeCloseTo(30_015.14, 6)
    expect(cell("category_a", "2011_today").heatingDemandKwh).toBeCloseTo(78_752.25, 6)
    expect(result.cells).toHaveLength(25)
    // Σ = 184 247.39 kWh/a heating; 6 936 + 1 739 + 4 900.14 = 13 575.14 kWh/a cooling
    expect(values.heatingDemandKwh).toBeCloseTo(184_247.39, 6)
    expect(values.estimatedHeatingDemandKwh).toBeCloseTo(184_247.39, 6)
    expect(values.coolingDemandKwh).toBeCloseTo(13_575.14, 6)
  })

  it("computes density, network length and heat density (EQ-3.3, 3.4a/b, 3.5)", () => {
    // 4 · 10⁴ / 2 000 = 20 buildings/ha
    expect(values.buildingDensity).toBe(20)
    // 171.22 / (1 + 8.817 · e^(−10.98)) = 171.1943 m/ha → · 0.2 ha = 34.2389 m
    expect(values.specificNetworkLength).toBeCloseTo(171.1943, 4)
    expect(values.networkLengthM).toBeCloseTo(34.2389, 4)
    expect(values.estimatedNetworkLengthM).toBe(values.networkLengthM)
    // 184 247.39 / 34.2389 = 5 381.24 kWh/m = 5.381 MWh/m
    expect(values.heatDensityKwhPerM).toBeCloseTo(5_381.237, 2)
    expect(values.heatDensityMwhPerM).toBeCloseTo(5.381237, 5)
  })

  it("computes supply per source and coverage (EQ-3.8a/b, 3.6a/b)", () => {
    const [waste, ground] = result.sources
    expect(result.sources.map((source) => source.source)).toEqual(["waste_heat", "ground_water"])
    // waste heat medium: 30 000 · 4.5 / 3.5 = 38 571.43; no cooling (OQ-13)
    expect(waste.heatingSupplyKwh).toBeCloseTo(38_571.428571, 5)
    expect(waste.coolingSupplyKwh).toBe(0)
    expect(waste.coolingCop).toBeNull()
    // ground water high: 150 000 · 5 / 4 = 187 500 heating, 150 000 · 5 / 6 = 125 000 cooling
    expect(ground.heatingSupplyKwh).toBe(187_500)
    expect(ground.coolingSupplyKwh).toBeCloseTo(125_000, 6)
    // 226 071.43 / 184 247.39 = 1.2270; 125 000 / 13 575.14 = 9.2080
    expect(values.heatingSupplyKwh).toBeCloseTo(226_071.428571, 5)
    expect(values.heatingCoverage).toBeCloseTo(1.226999, 6)
    expect(values.coolingCoverage).toBeCloseTo(9.208008, 6)
  })

  it("computes the CH ratio (OQ-12)", () => {
    // 13 575.14 / 184 247.39 = 0.073679, heating dominant
    expect(values.chRatio).toBeCloseTo(0.073679, 6)
    expect(values.dominantDemand).toBe("heating")
  })

  it("computes the revenues (EQ-3.9a-c)", () => {
    // base: (2 · 408 + 347.8 + 1 166.7) · 6 = 2 330.5 · 6 = 13 983; energy 184 247.39 · 0.12 = 22 109.69
    expect(values.heatingBaseRevenue).toBeCloseTo(13_983, 6)
    expect(values.heatingEnergyRevenue).toBeCloseTo(22_109.6868, 4)
    expect(values.heatingRevenue).toBeCloseTo(36_092.6868, 4)
    // 2 330.5 · 3 = 6 991.5; 13 575.14 · 0.08 = 1 086.01
    expect(values.coolingRevenue).toBeCloseTo(8_077.5112, 4)
    // 1 000 · 4 · 0.0672157 = 268.86 → R = 36 092.69 + 8 077.51 + 268.86 = 44 439.06
    expect(values.annuityFactor).toBeCloseTo(0.0672157, 7)
    expect(values.connectionFeeRevenue).toBeCloseTo(268.8628, 4)
    expect(values.overallRevenue).toBeCloseTo(44_439.0608, 4)
  })

  it("computes the investment and annual costs (EQ-3.10a-f, 3.11, 3.12)", () => {
    // C_net = 500 · 34.2389 = 17 119.43
    expect(values.networkInvestment).toBeCloseTo(17_119.4281, 4)
    // C_i: 1.0 · 187 500 + 0.5 · 38 571.43 = 206 785.71
    expect(result.sources.map((source) => source.investment)).toEqual([expect.closeTo(19_285.7143, 4), 187_500])
    expect(values.supplyInvestment).toBeCloseTo(206_785.7143, 4)
    // C_HP · N = 15 000 · 4 = 60 000 → C_overall = 60 000 + 17 119.43 + 206 785.71 = 283 905.14
    expect(values.heatPumpInvestment).toBe(60_000)
    expect(values.overallInvestment).toBeCloseTo(283_905.1424, 4)
    // C_annual = 283 905.14 · 0.0672157 = 19 082.89
    expect(values.annualizedCosts).toBeCloseTo(19_082.885, 3)
    // C_el = (187 500 / 5 + 125 000 / 5) · 0.2 + 38 571.43 / 4.5 · 0.2 = 12 500 + 1 714.29 = 14 214.29
    expect(values.electricityCostsWithoutPv).toBeCloseTo(14_214.2857, 4)
    // with PV: · (1 − 0.3) = 9 950
    expect(values.electricityCosts).toBeCloseTo(9_950, 6)
    expect(result.sources[1].electricityCosts).toBeCloseTo(12_500 * 0.7, 6)
    // C_O&M = 0.02 · 283 905.14 = 5 678.10
    expect(values.operationAndMaintenance).toBeCloseTo(5_678.1028, 4)
  })

  it("computes the economic ratio (OQ-21)", () => {
    // 19 082.89 + 9 950 + 5 678.10 = 34 710.99 → E = 44 439.06 / 34 710.99 = 1.2803
    expect(values.annualCosts).toBeCloseTo(34_710.9879, 4)
    expect(values.economicRatio).toBeCloseTo(1.280259, 6)
  })

  it("classifies, assesses and explains the result", () => {
    expect(result.classes).toEqual({
      heatingCoverage: "feasible",
      coolingCoverage: "feasible",
      buildingDensity: "medium",
      densityCategory: "sub_urban",
      heatDensity: "high",
      chRatio: "unbalanced",
      economic: "favorable",
    })
    expect(result.assessment.level).toBe("promising")
    expect(result.assessment.forced).toBe(false)
    expect(result.drivers.limiting).toEqual([])
    expect(result.drivers.supporting.map((driver) => driver.id)).toEqual([
      "economics",
      "heating_coverage",
      "cooling_coverage",
      "heat_density",
      "building_density",
    ])
  })

  it("sets the flags", () => {
    expect(result.flags).toEqual({
      incomplete: false,
      manualHeatingDemand: false,
      manualCoolingDemand: false,
      manualNetworkLength: false,
      estimatedNetworkLength: true,
      customParameters: false,
      pv: true,
      industry: false,
      unknownSources: false,
    })
    expect(result.parameters.isCustom).toBe(false)
  })
})

describe("run: input rules", () => {
  it("has no result without the required inputs (R-03)", () => {
    const result = run(createProject({ modules: { quickCheck: true }, id: ID }))
    expect(result.status).toBe("incomplete")
    if (result.status !== "incomplete") return
    expect(result.missing).toEqual(["buildings.total", "buildings.areaM2", "buildings.shares", "sources.potentials"])
    expect(result.incompleteSteps).toEqual(["area", "buildings", "sources"])
    expect(result.flags.incomplete).toBe(true)
  })

  it("has no result when the shares do not add up to 100 (R-03)", () => {
    const result = run(project({ ...SMALL, "buildings.shares.category_a.2011_today": 24 }))
    expect(result.status).toBe("incomplete")
    if (result.status === "incomplete") expect(result.missing).toEqual(["buildings.shares"])
  })

  it("lets a manual total replace the demand estimate; base prices still use N · A (OQ-05)", () => {
    const result = complete(
      run(
        project({
          ...SMALL,
          "quickCheck.manualDemand.heatingKwhPerYear": 100_000,
          "quickCheck.manualDemand.coolingKwhPerYear": 20_000,
        }),
      ),
    )
    expect(result.values.heatingDemandKwh).toBe(100_000)
    expect(result.values.estimatedHeatingDemandKwh).toBeCloseTo(184_247.39, 6)
    // base unchanged 13 983; energy 100 000 · 0.12 = 12 000
    expect(result.values.heatingBaseRevenue).toBeCloseTo(13_983, 6)
    expect(result.values.heatingEnergyRevenue).toBeCloseTo(12_000, 6)
    // 226 071.43 / 100 000 = 2.2607; 125 000 / 20 000 = 6.25
    expect(result.values.heatingCoverage).toBeCloseTo(2.260714, 6)
    expect(result.values.coolingCoverage).toBe(6.25)
    // CH = 20 000 / 100 000 = 0.2
    expect(result.values.chRatio).toBe(0.2)
    expect(result.flags.manualHeatingDemand).toBe(true)
    expect(result.flags.manualCoolingDemand).toBe(true)
  })

  it("lets an entered network length replace EQ-3.4b (QCT-IN-08, KF-07)", () => {
    const result = complete(run(project({ ...SMALL, "quickCheck.networkLengthM": 100 })))
    expect(result.values.networkLengthM).toBe(100)
    expect(result.values.estimatedNetworkLengthM).toBeCloseTo(34.2389, 4)
    // 184 247.39 / 100 = 1 842.47 kWh/m; C_net = 500 · 100 = 50 000
    expect(result.values.heatDensityKwhPerM).toBeCloseTo(1_842.4739, 4)
    expect(result.values.networkInvestment).toBe(50_000)
    expect(result.flags.manualNetworkLength).toBe(true)
    expect(result.flags.estimatedNetworkLength).toBe(false)
  })

  it("keeps the electricity costs without PV (OQ-06)", () => {
    const result = complete(run(project({ ...SMALL, "sources.pv": false })))
    expect(result.values.electricityCosts).toBeCloseTo(14_214.2857, 4)
    expect(result.values.electricityCosts).toBe(result.values.electricityCostsWithoutPv)
  })

  it("adds nothing for a source with Unknown potential and forces Further analysis (R-01, QCT-RULE-UNKNOWN)", () => {
    const base = complete(run(project(SMALL)))
    const result = complete(run(project({ ...SMALL, "sources.potentials.ambient_air": "unknown" })))
    const ambient = result.sources.find((source) => source.source === "ambient_air")!
    expect(ambient).toMatchObject({
      potential: "unknown",
      heatingAvailableKwh: 0,
      heatingSupplyKwh: 0,
      coolingSupplyKwh: 0,
      investment: 0,
      electricityCosts: 0,
    })
    expect(result.values.heatingSupplyKwh).toBe(base.values.heatingSupplyKwh)
    expect(result.values.overallInvestment).toBe(base.values.overallInvestment)
    expect(result.assessment).toMatchObject({ level: "further_analysis", forced: true })
    expect(result.assessment.reasons).toEqual([{ code: "unknown_source", sources: ["ambient_air"] }])
    expect(result.drivers.limiting[0]).toMatchObject({ id: "unknown_sources", sources: ["ambient_air"] })
    expect(result.flags.unknownSources).toBe(true)
  })

  it("adds no demand or floor area for industry, but counts it in N_total (OQ-02, R-02)", () => {
    const result = complete(
      run(project({ ...SMALL, "buildings.shares.category_a.2011_today": null, "buildings.shares.industry.2011_today": 25 })),
    )
    const industry = result.cells.find((cell) => cell.type === "industry" && cell.period === "2011_today")!
    expect(industry).toMatchObject({ buildings: 1, hasDefaults: false, heatingDemandKwh: 0, coolingDemandKwh: 0 })
    // 75 480 + 30 015.14 = 105 495.14 kWh/a; base (816 + 347.8) · 6 = 6 982.8
    expect(result.values.heatingDemandKwh).toBeCloseTo(105_495.14, 6)
    expect(result.values.heatingBaseRevenue).toBeCloseTo(6_982.8, 6)
    // EQ-3.3 and EQ-3.10d use all 4 buildings
    expect(result.values.buildingDensity).toBe(20)
    expect(result.values.heatPumpInvestment).toBe(60_000)
    expect(result.assessment).toMatchObject({ level: "further_analysis", forced: true, reasons: [{ code: "industry" }] })
    expect(result.flags.industry).toBe(true)
  })

  it("has no electricity and no cooling from solar thermal (OQ-13)", () => {
    const result = complete(run(project({ ...SMALL, "sources.potentials.solar_thermal": "high" })))
    const solar = result.sources.find((source) => source.source === "solar_thermal")!
    // 50 000 kWh/a, no heat pump; 0.7 €/(kWh/a) · 50 000 = 35 000 €
    expect(solar).toMatchObject({
      heatingSupplyKwh: 50_000,
      heatingCop: null,
      coolingSupplyKwh: 0,
      electricityCosts: 0,
      investment: 35_000,
    })
  })

  it("uses 0 installation cost for ambient air (OQ-18)", () => {
    const result = complete(run(project({ ...SMALL, "sources.potentials.ambient_air": "low" })))
    const ambient = result.sources.find((source) => source.source === "ambient_air")!
    // 10 000 · 3 / 2 = 15 000 kWh/a; cost 0 · 15 000 = 0
    expect(ambient.heatingSupplyKwh).toBe(15_000)
    expect(ambient.installationCostPerKwh).toBe(0)
    expect(ambient.investment).toBe(0)
  })

  it("applies parameter overrides and flags them (D-10)", () => {
    const result = complete(
      run(
        project({
          ...SMALL,
          "quickCheck.overrides.economic.interest_rate": 0,
          "quickCheck.overrides.heating.ground_water.high": 200_000,
        }),
      ),
    )
    // i = 0 → a = 1 / 20 = 0.05; 200 000 · 5 / 4 = 250 000
    expect(result.values.annuityFactor).toBe(0.05)
    expect(result.sources[1].heatingSupplyKwh).toBe(250_000)
    expect(result.flags.customParameters).toBe(true)
    expect(result.parameters.customFields).toHaveLength(2)
  })

  it("treats a demand of 0 as not relevant (OQ-22)", () => {
    const result = complete(run(project({ ...SMALL, "quickCheck.manualDemand.coolingKwhPerYear": 0 })))
    expect(result.values.coolingCoverage).toBeNull()
    expect(result.classes.coolingCoverage).toBeNull()
    expect(result.values.chRatio).toBe(0)
    expect(result.assessment.level).toBe("promising")
    expect(result.assessment.reasons[0]).toEqual({ code: "coverage_sufficient", demands: ["heating"] })
  })
})

describe("run: guards against values the schema forbids", () => {
  const broken = (mutate: (project: Project) => void) => {
    const value = structuredClone(project(SMALL))
    mutate(value)
    return run(value)
  }

  it.each([
    ["a heating COP of 1", (p: Project) => (p.quickCheck.overrides.heating.ground_water.cop = 1), "quickCheck.overrides.heating.ground_water.cop"],
    ["a heating COP of 0", (p: Project) => (p.quickCheck.overrides.heating.ground_water.cop = 0), "quickCheck.overrides.heating.ground_water.cop"],
    ["a cooling COP of 0", (p: Project) => (p.quickCheck.overrides.cooling.ground_water.cop = 0), "quickCheck.overrides.cooling.ground_water.cop"],
    ["a cooling COP of −1", (p: Project) => (p.quickCheck.overrides.cooling.ground_water.cop = -1), "quickCheck.overrides.cooling.ground_water.cop"],
    ["a depreciation period of 0", (p: Project) => (p.quickCheck.overrides.economic.depreciation_period = 0), "quickCheck.overrides.economic.depreciation_period"],
    ["an area of 0", (p: Project) => (p.buildings.areaM2 = 0), "buildings.areaM2"],
    ["a network length of 0", (p: Project) => (p.quickCheck.networkLengthM = 0), "quickCheck.networkLengthM"],
  ])("reports %s as incomplete", (_, mutate, field) => {
    const result = broken(mutate)
    expect(result.status).toBe("incomplete")
    if (result.status === "incomplete") {
      expect(result.missing).toContain(field)
      expect(result.incompleteSteps.length).toBeGreaterThan(0)
    }
  })
})

describe("run: overall levels with real numbers", () => {
  it("is Not promising for a sparse area with little supply", () => {
    // 10 buildings on 100 ha (0.1 buildings/ha, low); 18.3 m/ha · 100 ha = 1 832 m,
    // 538 900 kWh/a / 1 832 m = 0.29 MWh/m (low); geothermal low covers 2.4 % (< 70 %)
    const result = complete(
      run(
        project({
          "buildings.total": 10,
          "buildings.areaM2": 1_000_000,
          "buildings.shares.residential.1961_1990": 100,
          "sources.potentials.geothermal": "low",
        }),
      ),
    )
    expect(result.classes).toMatchObject({ heatingCoverage: "not_feasible", buildingDensity: "low", heatDensity: "low" })
    expect(result.assessment.level).toBe("not_promising")
    expect(result.assessment.reasons).toEqual([{ code: "low_coverage_and_densities", demands: ["heating", "cooling"] }])
  })

  it("is Not promising when no demand is relevant: no energy revenue makes E clearly unfavorable", () => {
    const result = complete(
      run(
        project({
          ...SMALL,
          "quickCheck.manualDemand.heatingKwhPerYear": 0,
          "quickCheck.manualDemand.coolingKwhPerYear": 0,
        }),
      ),
    )
    expect(result.values.chRatio).toBeNull()
    expect(result.values.dominantDemand).toBeNull()
    expect(result.classes).toMatchObject({ heatingCoverage: null, coolingCoverage: null, chRatio: null })
    expect(result.assessment).toMatchObject({ level: "not_promising", reasons: [{ code: "economics_clearly_unfavorable" }] })
  })

  it("is Further analysis for mixed results", () => {
    // 2 buildings, waste heat medium + ground water low: 0.851 heating coverage (70–90 %), E = 1.52
    const result = complete(
      run(
        project({
          "buildings.total": 2,
          "buildings.areaM2": 1_600,
          "buildings.shares.residential.2011_today": 100,
          "sources.potentials.waste_heat": "medium",
          "sources.potentials.ground_water": "low",
        }),
      ),
    )
    expect(result.values.heatingCoverage).toBeCloseTo(0.851, 3)
    expect(result.assessment).toMatchObject({
      level: "further_analysis",
      step: "otherwise",
      reasons: [{ code: "coverage_below_promising", demands: ["heating"] }],
    })
  })

  // OQ-26 check: Promising stays reachable for about 2–15 buildings with several sources.
  it.each([
    [2, { "sources.potentials.waste_heat": "medium", "sources.potentials.ground_water": "low", "sources.potentials.ambient_air": "low" }],
    [5, { "sources.potentials.waste_heat": "high", "sources.potentials.ground_water": "medium" }],
    [15, { "sources.potentials.waste_heat": "high", "sources.potentials.ground_water": "high", "sources.potentials.surface_water": "high" }],
  ] as const)("reaches Promising for %i residential buildings (OQ-26)", (buildings, sources) => {
    const result = complete(
      run(
        project({
          "buildings.total": buildings,
          "buildings.areaM2": buildings * 800,
          "buildings.shares.residential.2011_today": 100,
          ...sources,
        }),
      ),
    )
    expect(result.assessment.level).toBe("promising")
  })
})
