// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { projectSchema } from "./project"
import { isNullOnly, schemaAt } from "./schema-at"

describe("schemaAt", () => {
  it("finds leaves through objects, nullables and lists", () => {
    expect(schemaAt(projectSchema, ["buildings", "total"])?.safeParse(5).success).toBe(true)
    expect(schemaAt(projectSchema, ["buildings", "shares", "industry", "2011_today"])?.safeParse(null).success).toBe(true)
    expect(schemaAt(projectSchema, ["businessPlan", "risks", "3", "dealBreaker"])).toBeInstanceOf(z.ZodBoolean)
  })

  it("returns the root for an empty path", () => {
    expect(schemaAt(projectSchema, [])).toBe(projectSchema)
  })

  it("returns undefined for paths the schema does not have", () => {
    expect(schemaAt(projectSchema, ["buildings", "density"])).toBeUndefined()
    expect(schemaAt(projectSchema, ["buildings", "total", "x"])).toBeUndefined()
    expect(schemaAt(projectSchema, ["businessPlan", "risks", "first"])).toBeUndefined()
    expect(schemaAt(projectSchema, ["meta", "constructor"])).toBeUndefined()
  })

  it("spots null-only cells", () => {
    expect(isNullOnly(schemaAt(projectSchema, ["quickCheck", "overrides", "heating", "solar_thermal", "cop"])!)).toBe(true)
    expect(isNullOnly(schemaAt(projectSchema, ["quickCheck", "overrides", "heating", "geothermal", "cop"])!)).toBe(false)
  })
})
