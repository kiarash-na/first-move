// @vitest-environment node
import { describe, expect, it } from "vitest"
import { projectJsonSchema } from "./json-schema"

type Node = { properties?: Record<string, Node>; anyOf?: Node[]; [key: string]: unknown }
const at = (node: Node, ...keys: string[]) => keys.reduce<Node>((current, key) => current.properties![key], node)

describe("projectJsonSchema (PLAN-DASH-03 verification)", () => {
  const schema = projectJsonSchema() as Node

  it("generates without errors as draft 2020-12", () => {
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema")
    expect(Object.keys(schema.properties!)).toEqual(["meta", "site", "buildings", "sources", "quickCheck", "businessPlan"])
    expect(schema.additionalProperties).toBe(false)
  })

  it("carries the validation limits and descriptions an agent needs", () => {
    const total = at(schema, "buildings", "total")
    expect(total.anyOf).toEqual([{ type: "integer", minimum: 1, maximum: 100_000 }, { type: "null" }])
    expect(total.description).toMatch(/QCT-IN-01/)
    expect(at(schema, "sources", "potentials", "geothermal").anyOf?.[0]).toEqual({
      type: "string",
      enum: ["low", "medium", "high", "unknown"],
    })
    expect(at(schema, "quickCheck", "overrides", "heating", "solar_thermal", "cop")).toEqual({ type: "null" })
    expect(at(schema, "businessPlan", "risks").description).toMatch(/Row ids are unique/)
  })

  it("is plain JSON", () => {
    expect(JSON.parse(JSON.stringify(schema))).toEqual(schema)
  })
})
