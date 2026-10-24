// @vitest-environment node
import { describe, expect, it } from "vitest"
import { opportunitySchema } from "./opportunity"

describe("opportunitySchema (BM-STEP-01)", () => {
  it("asks for segments, needs, sources, pain point, alternatives and the network's advantage", () => {
    expect(Object.keys(opportunitySchema.shape)).toEqual([
      "customerSegments",
      "needs",
      "heatSources",
      "painPoint",
      "alternatives",
      "advantage",
    ])
  })

  it("accepts free text and rejects other types", () => {
    const filled = Object.fromEntries(Object.keys(opportunitySchema.shape).map((key) => [key, `About ${key}`]))
    expect(opportunitySchema.safeParse(filled).success).toBe(true)
    expect(opportunitySchema.safeParse({ ...filled, needs: null }).success).toBe(false)
  })
})
