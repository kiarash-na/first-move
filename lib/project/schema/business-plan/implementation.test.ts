// @vitest-environment node
import { describe, expect, it } from "vitest"
import { nextStepsSchema, refinementsSchema, scalabilitySchema } from "./implementation"

describe("BM-STEP-04 schemas", () => {
  it("refine the model from feedback (04.1)", () => {
    expect(Object.keys(refinementsSchema.shape)).toEqual(["feedback", "changes"])
  })

  it("assess scalability by geographical, economic and organisational context (04.2)", () => {
    expect(Object.keys(scalabilitySchema.shape)).toEqual(["geographical", "economic", "organisational"])
  })

  it("outline data, stakeholders, partnerships, pilots and decisions (04.3)", () => {
    expect(Object.keys(nextStepsSchema.shape)).toEqual(["data", "stakeholders", "partnerships", "pilots", "decisions"])
    const filled = { data: "Meter data", stakeholders: "", partnerships: "", pilots: "", decisions: "Go/no-go in Q3" }
    expect(nextStepsSchema.safeParse(filled).success).toBe(true)
    expect(nextStepsSchema.safeParse({ ...filled, decisions: "x".repeat(5001) }).success).toBe(false)
  })
})
