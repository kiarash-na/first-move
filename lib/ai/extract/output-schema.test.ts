import { describe, expect, it } from "vitest"
import { z } from "zod"
import { extractionSchema } from "./output-schema"

const schema = extractionSchema(["buildings.total", "buildings.areaM2"])
const value = { field: "buildings.total", value: 120, quote: "120 buildings" }

describe("extractionSchema", () => {
  it("accepts values with quotes, sources and units, and unclear topics", () => {
    const output = {
      values: [value, { field: "buildings.areaM2", value: "12", unit: "ha", quote: "12 ha", file: "a.pdf", page: 2 }],
      unclear: [{ topic: "Cooling demand", reason: "Two different figures" }],
    }
    expect(schema.parse(output)).toEqual(output)
  })

  it("accepts only the fields of the scope", () => {
    expect(schema.safeParse({ values: [{ ...value, field: "meta.name" }], unclear: [] }).success).toBe(false)
  })

  it("rejects extra properties, bad pages and items, and floods", () => {
    expect(schema.safeParse({ values: [{ ...value, extra: true }], unclear: [] }).success).toBe(false)
    expect(schema.safeParse({ values: [{ ...value, page: 0 }], unclear: [] }).success).toBe(false)
    expect(schema.safeParse({ values: [{ ...value, item: 31 }], unclear: [] }).success).toBe(false)
    expect(schema.safeParse({ values: Array.from({ length: 301 }, () => value), unclear: [] }).success).toBe(false)
    expect(schema.safeParse({ values: [{ ...value, quote: "x".repeat(301) }], unclear: [] }).success).toBe(false)
  })

  it("needs at least one field", () => {
    expect(() => extractionSchema([])).toThrow("no fields")
  })

  it("converts to a JSON Schema with closed objects and the field ids as an enum", () => {
    const json = z.toJSONSchema(schema) as unknown as { additionalProperties: boolean; properties: { values: { items: { additionalProperties: boolean; properties: { field: { enum: string[] } } } } } }
    expect(json.additionalProperties).toBe(false)
    expect(json.properties.values.items.additionalProperties).toBe(false)
    expect(json.properties.values.items.properties.field.enum).toEqual(["buildings.total", "buildings.areaM2"])
  })
})
