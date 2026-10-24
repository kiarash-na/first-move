// @vitest-environment node
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { getAt } from "@/lib/project/path"
import {
  CH_RATIO_CLASSES,
  COVERAGE_CLASSES,
  DENSITY_CLASSES,
  ECONOMIC_CLASSES,
} from "./classify/rules.config"
import { DRIVER_IDS } from "./drivers"
import { DEMANDS, REASON_CODES, RESULT_LEVELS } from "./overall-rule"
import { TBL_10, TBL_7, TBL_8, TBL_9 } from "./reference"

const label = (...path: string[]) => getAt(quickCheck, ["results", ...path, "label"])

const expectLabel = (...path: string[]) =>
  expect(typeof label(...path) === "string" && (label(...path) as string).length > 0, path.join(".")).toBe(true)

describe("result copy (EN, D-32)", () => {
  it("names every result level (QCT-RES-LEVELS)", () => {
    for (const level of RESULT_LEVELS) expectLabel("levels", level)
  })

  it("has a sentence for every reason and every driver effect", () => {
    for (const code of REASON_CODES) expectLabel("reasons", code)
    for (const id of DRIVER_IDS) {
      expectLabel("drivers", id, "limiting")
      if (id !== "industry" && id !== "unknown_sources") expectLabel("drivers", id, "supporting")
    }
    for (const demand of DEMANDS) expectLabel("demands", demand)
  })

  it.each([
    ["coverage", COVERAGE_CLASSES, TBL_7.classes],
    ["buildingDensity", DENSITY_CLASSES, TBL_8.classes],
    ["heatDensity", DENSITY_CLASSES, TBL_9.classes],
    ["chRatio", CH_RATIO_CLASSES, TBL_10.classes],
  ] as const)("shows the %s classes with their table text verbatim (KF-02)", (indicator, classes, printed) => {
    classes.forEach((value, index) => {
      expect(label("classes", indicator, value)).toBe(printed[index].classification)
      expect(getAt(quickCheck, ["results", "classes", indicator, value, "interpretation"])).toBe(
        printed[index].interpretation,
      )
    })
  })

  it("explains every economic class (OQ-21)", () => {
    for (const value of ECONOMIC_CLASSES) {
      expectLabel("classes", "economic", value)
      expect(typeof getAt(quickCheck, ["results", "classes", "economic", value, "interpretation"])).toBe("string")
    }
  })
})
