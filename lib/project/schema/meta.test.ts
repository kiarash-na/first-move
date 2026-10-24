// @vitest-environment node
import { describe, expect, it } from "vitest"
import { METHODOLOGY_VERSION, SCHEMA_VERSION } from "@/lib/project/versions"
import { metaSchema, modulesSchema } from "./meta"

const meta = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Sunny Valley",
  createdAt: "2026-10-24T08:00:00.000Z",
  updatedAt: "2026-10-24T08:00:00.000Z",
  schemaVersion: SCHEMA_VERSION,
  methodologyVersion: METHODOLOGY_VERSION,
  modules: { quickCheck: true, businessPlan: false },
  exampleId: null,
}

describe("metaSchema", () => {
  it("accepts valid meta", () => {
    expect(metaSchema.safeParse(meta).success).toBe(true)
    expect(metaSchema.safeParse({ ...meta, exampleId: "example-02", name: "" }).success).toBe(true)
  })

  it.each([
    ["a non-UUID id", { id: "project-1" }],
    ["a date without time", { createdAt: "2026-10-24" }],
    ["another schema version", { schemaVersion: 0 }],
    ["a malformed methodology version", { methodologyVersion: "v1" }],
    ["an example id with spaces", { exampleId: "example 2" }],
    ["a name over 120 characters", { name: "x".repeat(121) }],
  ])("rejects %s", (_, change) => {
    expect(metaSchema.safeParse({ ...meta, ...change }).success).toBe(false)
  })
})

describe("modulesSchema", () => {
  it("needs at least one module (D-01)", () => {
    expect(modulesSchema.safeParse({ quickCheck: false, businessPlan: true }).success).toBe(true)
    const result = modulesSchema.safeParse({ quickCheck: false, businessPlan: false })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({ code: "custom", params: { code: "at-least-one-module" } })
  })
})
