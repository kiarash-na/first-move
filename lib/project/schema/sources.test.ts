// @vitest-environment node
import { describe, expect, it } from "vitest"
import { SOURCES } from "@/lib/project/catalog/sources"
import { potentialSchema, sourcesSchema } from "./sources"

describe("sourcesSchema", () => {
  it("has one potential per TBL-4 source and the PV toggle", () => {
    expect(Object.keys(sourcesSchema.shape.potentials.shape)).toEqual([...SOURCES])
    expect(sourcesSchema.shape.pv.safeParse(true).success).toBe(true)
    expect(sourcesSchema.shape.pv.safeParse(null).success).toBe(false)
  })

  it("takes Low, Medium, High, Unknown, or null for a source that is not selected", () => {
    for (const value of ["low", "medium", "high", "unknown", null]) expect(potentialSchema.safeParse(value).success).toBe(true)
    for (const value of ["Low", "none", 1]) expect(potentialSchema.safeParse(value).success).toBe(false)
  })
})
