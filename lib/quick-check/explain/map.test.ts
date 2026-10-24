// @vitest-environment node
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { getAt } from "@/lib/project/path"
import { run } from "../run"
import type { QuickCheckFlags } from "../types"
import { getExample, localizeExample } from "@/lib/examples"
import { FORMULA_IDS, formulaNameKey, type FormulaId } from "./formulas"
import { explainResult, inMethodologyOrder, RESULT_EXPLAIN, STEP_EXPLAIN, type ExplainedResult } from "./map"

const text = (key: string) => getAt(calc, key.split("."))

const NO_FLAGS: QuickCheckFlags = {
  incomplete: false,
  manualHeatingDemand: false,
  manualCoolingDemand: false,
  manualNetworkLength: false,
  estimatedNetworkLength: true,
  customParameters: false,
  pv: false,
  industry: false,
  unknownSources: false,
}

describe("How we calculate map (D-33)", () => {
  it("lists for every step the equations its inputs feed and its sentence describes", () => {
    expect(Object.keys(STEP_EXPLAIN)).toEqual(["area", "buildings", "sources", "options", "assumptions"])
    // calc.steps.buildings: per-group defaults of Tables 1-3, then the total annual demand
    expect(STEP_EXPLAIN.buildings.formulas).toEqual(["EQ-3.1", "EQ-3.2a", "EQ-3.2b", "EQ-3.2c", "EQ-3.2d"])
    // calc.steps.area: the length is estimated from the density (EQ-3.4a); C_overall per OQ-17
    expect(STEP_EXPLAIN.area.formulas).toEqual(["EQ-3.1", "EQ-3.3", "EQ-3.4a", "EQ-3.4b", "EQ-3.9c", "EQ-3.10d", "OQ-17"])
    // calc.steps.sources: the supply sets the coverage (EQ-3.6a/b)
    expect(STEP_EXPLAIN.sources.formulas).toEqual(["EQ-3.6a", "EQ-3.6b", "EQ-3.8a", "EQ-3.8b", "EQ-3.10b", "EQ-3.11"])
    // manual demand feeds the CH ratio (OQ-12); PV lowers C_el (OQ-06)
    expect(STEP_EXPLAIN.options.formulas).toEqual(
      expect.arrayContaining(["EQ-3.2c", "EQ-3.4a", "EQ-3.7", "OQ-12", "EQ-3.11", "OQ-06"]),
    )
    expect(STEP_EXPLAIN.assumptions.formulas).toEqual(expect.arrayContaining(["EQ-3.10d", "OQ-17", "EQ-3.11", "OQ-06"]))
    for (const [step, entry] of Object.entries(STEP_EXPLAIN)) {
      expect(typeof text(entry.text), step).toBe("string")
      expect(entry.formulas.length, step).toBeGreaterThan(0)
    }
  })

  it("explains result values that run() returns", () => {
    const { project } = applyPatch(
      createProject({ modules: { quickCheck: true } }),
      {
        "buildings.total": 4,
        "buildings.areaM2": 2_000,
        "buildings.shares.residential.2011_today": 100,
        "sources.potentials.geothermal": "high",
      },
      { atomic: true },
    )
    const result = run(project)
    if (result.status !== "complete") throw new Error("incomplete")
    for (const key of Object.keys(RESULT_EXPLAIN)) {
      if (key === "densityCategory") expect(result.classes).toHaveProperty(key)
      else if (key === "level") expect(result.assessment).toHaveProperty(key)
      else expect(result.values, key).toHaveProperty(key)
    }
  })

  it("only cites formulas that exist, with a sentence and a name for each", () => {
    for (const [key, entry] of Object.entries(RESULT_EXPLAIN)) {
      expect(typeof text(entry.text), key).toBe("string")
      for (const id of entry.formulas) expect(FORMULA_IDS, key).toContain(id)
      const variants: Record<string, { text?: string; drops?: readonly string[]; adds?: readonly string[] }> =
        "variants" in entry ? entry.variants : {}
      for (const variant of Object.values(variants)) {
        if (variant.text) expect(typeof text(variant.text), key).toBe("string")
        for (const id of variant.adds ?? []) expect(FORMULA_IDS, key).toContain(id)
      }
    }
    for (const id of FORMULA_IDS) expect(typeof text(formulaNameKey(id)), id).toBe("string")
  })

  it("drops the estimate when a manual value replaces it (OQ-05, QCT-IN-08)", () => {
    expect(explainResult("heatingDemandKwh", NO_FLAGS)).toEqual({
      text: "results.heatingDemandKwh.text",
      formulas: ["EQ-3.1", "EQ-3.2a", "EQ-3.2c"],
      tables: ["TBL-1", "TBL-3"],
    })
    expect(explainResult("heatingDemandKwh", { ...NO_FLAGS, manualHeatingDemand: true })).toEqual({
      text: "results.heatingDemandKwh.manual",
      formulas: [],
      tables: ["TBL-1", "TBL-3"],
    })
    const both = { ...NO_FLAGS, manualHeatingDemand: true, manualNetworkLength: true, estimatedNetworkLength: false }
    expect(explainResult("heatDensityMwhPerM", both).formulas).toEqual(["EQ-3.5"])
    expect(explainResult("heatDensityMwhPerM", both).text).toBe("results.heatDensityMwhPerM.text")
    expect(explainResult("networkLengthM", both).text).toBe("results.networkLengthM.manual")
  })

  it("keeps entries without variants unchanged", () => {
    const keys = Object.keys(RESULT_EXPLAIN) as ExplainedResult[]
    for (const key of keys.filter((entry) => !("variants" in RESULT_EXPLAIN[entry]))) {
      const all = { ...NO_FLAGS, manualHeatingDemand: true, manualCoolingDemand: true, manualNetworkLength: true, pv: true }
      expect(explainResult(key, all).formulas).toEqual(RESULT_EXPLAIN[key].formulas)
    }
  })

  const FLAG_SETS: QuickCheckFlags[] = [
    NO_FLAGS,
    { ...NO_FLAGS, pv: true },
    { ...NO_FLAGS, manualHeatingDemand: true, manualCoolingDemand: true, manualNetworkLength: true, pv: true },
  ]
  const allLists = () => [
    ...Object.entries(STEP_EXPLAIN).map(([step, entry]) => [step, entry.formulas] as const),
    ...(Object.keys(RESULT_EXPLAIN) as ExplainedResult[]).flatMap((key) =>
      FLAG_SETS.map((flags) => [key, explainResult(key, flags).formulas] as const),
    ),
  ]

  it("orders formulas by methodology, each OQ formula right after its equation", () => {
    expect(inMethodologyOrder(["OQ-21", "OQ-17", "EQ-3.12", "EQ-3.10d", "OQ-06", "EQ-3.11", "EQ-3.1"])).toEqual([
      "EQ-3.1",
      "EQ-3.10d",
      "OQ-17",
      "EQ-3.11",
      "OQ-06",
      "EQ-3.12",
      "OQ-21",
    ])
    for (const [step, entry] of Object.entries(STEP_EXPLAIN)) expect(entry.formulas, step).toEqual(inMethodologyOrder(entry.formulas))
  })

  it("never shows an equation the engine replaced without the OQ formula it uses (OQ-12, OQ-17)", () => {
    const follows: [FormulaId, FormulaId][] = [["EQ-3.7", "OQ-12"], ["EQ-3.10d", "OQ-17"]]
    for (const [key, formulas] of allLists()) {
      for (const [equation, resolved] of follows) {
        if (formulas.includes(equation)) expect(formulas[formulas.indexOf(equation) + 1], key).toBe(resolved)
      }
      // PV's reduction (OQ-06) only ever follows the electricity costs it reduces
      if (formulas.includes("OQ-06")) expect(formulas[formulas.indexOf("OQ-06") - 1], key).toBe("EQ-3.11")
    }
  })

  it("lists the formulas that reproduce the numbers shown (OQ-17, OQ-06)", () => {
    const example = localizeExample(getExample("housing-cooperatives")!, "en")
    const result = run(example)
    if (result.status !== "complete") throw new Error("incomplete")
    const { values, flags } = result
    // C_overall counts the installations once (OQ-17), not EQ-3.10d as printed.
    expect(values.overallInvestment).toBeCloseTo(values.heatPumpInvestment + values.networkInvestment + values.supplyInvestment, 6)
    for (const key of ["overallInvestment", "annualizedCosts", "operationAndMaintenance"] as const) {
      expect(explainResult(key, flags).formulas, key).toContain("OQ-17")
    }
    // With PV, C_el is EQ-3.11 times (1 − 0.30) (OQ-06), and OQ-06 is listed.
    expect(flags.pv).toBe(true)
    expect(values.electricityCosts).toBeCloseTo(values.electricityCostsWithoutPv * (1 - 0.3), 6)
    for (const key of ["electricityCosts", "annualCosts", "economicRatio"] as const) {
      expect(explainResult(key, flags).formulas, key).toContain("OQ-06")
      expect(explainResult(key, { ...flags, pv: false }).formulas, key).not.toContain("OQ-06")
    }
  })
})
