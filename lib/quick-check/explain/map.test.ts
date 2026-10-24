// @vitest-environment node
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { applyPatch } from "@/lib/project/apply-patch"
import { createProject } from "@/lib/project/create-project"
import { getAt } from "@/lib/project/path"
import { run } from "../run"
import type { QuickCheckFlags } from "../types"
import { FORMULA_IDS, formulaNameKey } from "./formulas"
import { explainResult, RESULT_EXPLAIN, STEP_EXPLAIN, type ExplainedResult } from "./map"

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
  it("lists for every step the equations its inputs feed, with a sentence", () => {
    expect(Object.keys(STEP_EXPLAIN)).toEqual(["area", "buildings", "sources", "options", "assumptions"])
    expect(STEP_EXPLAIN.buildings.formulas).toEqual(["EQ-3.1"])
    expect(STEP_EXPLAIN.area.formulas).toEqual(["EQ-3.1", "EQ-3.3", "EQ-3.4b", "EQ-3.9c", "EQ-3.10d"])
    // manual demand feeds the CH ratio, whose formula is the OQ-12 answer
    expect(STEP_EXPLAIN.options.formulas).toEqual(expect.arrayContaining(["EQ-3.2c", "EQ-3.4a", "EQ-3.7", "OQ-12", "EQ-3.11"]))
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
      for (const variant of Object.values("manual" in entry ? entry.manual : {})) {
        if ("text" in variant) expect(typeof text(variant.text as string), key).toBe("string")
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

  it("keeps entries without manual variants unchanged", () => {
    const keys = Object.keys(RESULT_EXPLAIN) as ExplainedResult[]
    for (const key of keys.filter((entry) => !("manual" in RESULT_EXPLAIN[entry]))) {
      const all = { ...NO_FLAGS, manualHeatingDemand: true, manualCoolingDemand: true, manualNetworkLength: true }
      expect(explainResult(key, all).formulas).toEqual(RESULT_EXPLAIN[key].formulas)
    }
  })
})
