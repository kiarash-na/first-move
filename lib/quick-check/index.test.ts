// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project/create-project"
import * as engine from "./index"

describe("lib/quick-check public API", () => {
  it("exposes the engine in one import", () => {
    for (const name of [
      "run",
      "effectiveParameters",
      "readInputs",
      "overallResult",
      "keyFactors",
      "explainResult",
      "classifyCoverage",
      "classifyBuildingDensity",
      "classifyHeatDensity",
      "classifyChRatio",
      "classifyEconomic",
      "specificNetLength",
      "annuityFactor",
    ] as const) {
      expect(typeof engine[name], name).toBe("function")
    }
    expect(engine.FORMULA_IDS).toContain("EQ-3.4a")
    expect(engine.RESULT_LEVELS).toEqual(["promising", "further_analysis", "not_promising"])
  })

  it("runs an empty project to an incomplete result", () => {
    expect(engine.run(createProject({ modules: { quickCheck: true } })).status).toBe("incomplete")
  })
})
