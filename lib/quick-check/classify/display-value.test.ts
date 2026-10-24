// @vitest-environment node
import { describe, expect, it } from "vitest"
import { classifyBuildingDensity } from "./building-density"
import { classifyChRatio } from "./ch-ratio"
import { classifyCoverage } from "./coverage"
import { indicatorDisplayValue, roundWithinClass } from "./display-value"
import { classifyEconomic } from "./economic"
import { classifyHeatDensity } from "./heat-density"
import { COVERAGE_RULE } from "./rules.config"

describe("roundWithinClass (QCT-KF-02/03: the shown number matches its class)", () => {
  it("rounds normally inside a class", () => {
    expect(roundWithinClass(0.954, COVERAGE_RULE, 2)).toBe(0.95)
    expect(roundWithinClass(0.956, COVERAGE_RULE, 2)).toBe(0.96)
    expect(roundWithinClass(1.006, COVERAGE_RULE, 2)).toBe(1.01)
  })

  it.each([
    ["coverage", 0.9976, 0.99, classifyCoverage],
    ["coverage", 0.8996, 0.89, classifyCoverage],
    ["coverage", 0.6951, 0.69, classifyCoverage],
    ["economic", 0.996, 0.99, classifyEconomic],
    ["economic", 0.6996, 0.69, classifyEconomic],
    ["heatDensity", 0.496, 0.49, classifyHeatDensity],
    ["heatDensity", 1.5004, 1.51, classifyHeatDensity], // "Above 1.5" is exclusive
    ["buildingDensity", 9.96, 9.9, classifyBuildingDensity],
    ["buildingDensity", 30.04, 30.1, classifyBuildingDensity], // "Above 30" is exclusive
    ["chRatio", 0.7996, 0.79, classifyChRatio],
    ["chRatio", 0.2999, 0.29, classifyChRatio],
  ] as const)("%s %s is shown as %s, in its own class", (indicator, value, shown, classify) => {
    expect(indicatorDisplayValue(indicator, value)).toBe(shown)
    expect(classify(shown)).toBe(classify(value))
  })

  it("keeps values at the boundary as they are", () => {
    expect(indicatorDisplayValue("coverage", 1)).toBe(1)
    expect(indicatorDisplayValue("coverage", 0.8999999999999999)).toBe(0.9)
    expect(indicatorDisplayValue("buildingDensity", 30)).toBe(30)
  })
})
