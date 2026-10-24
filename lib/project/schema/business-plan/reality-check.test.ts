// @vitest-environment node
import { describe, expect, it } from "vitest"
import { assumptionsSchema, criticalAssumptionsSchema, risksSchema } from "./reality-check"

const risk = (id: string, dealBreaker = false) => ({
  id,
  title: "Low connection rate",
  description: "Owners decide one by one.",
  dealBreaker,
  validation: "Letters of intent from the anchor customers.",
})

describe("assumptionsSchema (BM-STEP-03.2)", () => {
  it("covers connection rates, tariffs, capex, financing and subsidies", () => {
    expect(Object.keys(assumptionsSchema.shape)).toEqual(["connectionRate", "tariffs", "capex", "financing", "subsidies"])
  })
})

describe("criticalAssumptionsSchema (BM-STEP-03.3/4)", () => {
  it("pairs each statement with how to validate it", () => {
    expect(criticalAssumptionsSchema.safeParse([{ id: "a", statement: "Groundwater is usable", validation: "Test drilling" }]).success).toBe(true)
    expect(criticalAssumptionsSchema.safeParse([{ id: "a", statement: "No validation" }]).success).toBe(false)
  })
})

describe("risksSchema (BM-STEP-03.3/4)", () => {
  it("holds a risk register with a deal-breaker flag and validation", () => {
    expect(risksSchema.safeParse([risk("r1", true), risk("r2")]).success).toBe(true)
  })

  it("rejects a non-boolean flag and duplicate ids", () => {
    expect(risksSchema.safeParse([{ ...risk("r1"), dealBreaker: "yes" }]).success).toBe(false)
    expect(risksSchema.safeParse([risk("r1"), risk("r1")]).success).toBe(false)
  })
})
