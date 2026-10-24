// @vitest-environment node
import { describe, expect, it } from "vitest"
import { DERIVED_VALUES } from "@/lib/project/fields/registry"
import { TBL_10, TBL_7, TBL_8, TBL_9 } from "@/lib/quick-check/reference"
import {
  BUILDING_DENSITY_RULE,
  CH_RATIO_RULE,
  COVERAGE_RULE,
  DENSITY_CATEGORIES,
  HEAT_DENSITY_RULE,
  type ThresholdRule,
} from "./rules.config"

interface PrintedClass {
  bounds: { min?: number; max?: number; min_inclusive?: boolean; max_inclusive?: boolean }
}

/** The printed lower bounds (scaled), one per band, and the last class has none. */
function expectBounds(rule: ThresholdRule<string>, classes: readonly PrintedClass[], scale: number) {
  expect(classes).toHaveLength(rule.bands.length + 1)
  rule.bands.forEach((band, index) => {
    expect(band.min).toBeCloseTo((classes[index].bounds.min as number) * scale, 12)
    // OQ-20: inclusive unless the table says "Above".
    expect(band.inclusive).toBe(classes[index].bounds.min_inclusive !== false)
  })
  expect(classes.at(-1)!.bounds.min).toBeUndefined()
  // the lowest class ends where the lowest band starts ("Below x", exclusive)
  expect(classes.at(-1)!.bounds.max! * scale).toBeCloseTo(rule.bands.at(-1)!.min, 12)
  expect(classes.at(-1)!.bounds.max_inclusive).toBe(false)
}

describe("classification rules (OQ-20)", () => {
  it("TBL-7: coverage ≥ 100 / ≥ 90 / ≥ 70 / < 70 % (as fractions)", () => {
    expectBounds(COVERAGE_RULE, TBL_7.classes, 1 / 100)
  })

  it("TBL-8: building density > 30 / ≥ 10 / < 10 buildings/ha", () => {
    expectBounds(BUILDING_DENSITY_RULE, TBL_8.classes, 1)
    expect(BUILDING_DENSITY_RULE.bands[0].inclusive).toBe(false)
  })

  it("TBL-9: heat density > 1.5 / ≥ 0.5 / < 0.5 MWh/m", () => {
    expectBounds(HEAT_DENSITY_RULE, TBL_9.classes, 1)
    expect(HEAT_DENSITY_RULE.bands[0].inclusive).toBe(false)
  })

  it("TBL-10: CH ratio ≥ 0.8 / ≥ 0.3 / < 0.3", () => {
    expectBounds(CH_RATIO_RULE, TBL_10.classes, 1)
  })

  it("offers the density categories of the derived QCT-IN-03 value (OQ-04)", () => {
    const derived = DERIVED_VALUES.find((value) => value.id === "densityCategory")!
    expect([...DENSITY_CATEGORIES].sort()).toEqual([...derived.options].sort())
  })
})
