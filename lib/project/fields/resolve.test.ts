// @vitest-environment node
import { describe, expect, it } from "vitest"
import { resolvePatchPath } from "./resolve"

describe("resolvePatchPath", () => {
  it("resolves a registry field", () => {
    expect(resolvePatchPath("buildings.shares.residential.1991_2010")).toMatchObject({
      kind: "field",
      field: { id: "buildings.shares.residential.1991_2010" },
      segments: ["buildings", "shares", "residential", "1991_2010"],
    })
  })

  it("resolves a whole item list as a field, and a row or a row property as an item", () => {
    expect(resolvePatchPath("businessPlan.risks")).toMatchObject({ kind: "field", field: { kind: "items" } })
    expect(resolvePatchPath("businessPlan.risks.2")).toMatchObject({ kind: "item", index: 2, property: null })
    expect(resolvePatchPath("businessPlan.risks.0.validation")).toMatchObject({ kind: "item", index: 0, property: "validation" })
  })

  it("treats system values and row ids as read-only", () => {
    for (const path of ["meta.id", "meta.updatedAt", "meta.schemaVersion", "meta.exampleId", "businessPlan.risks.0.id"]) {
      expect(resolvePatchPath(path), path).toEqual({ kind: "read-only" })
    }
  })

  it("rejects unknown paths, containers and malformed paths", () => {
    for (const path of [
      "buildings.density",
      "buildings.shares",
      "buildings",
      "businessPlan.risks.0.owner",
      "businessPlan.risks.first.title",
      "businessPlan.risks.0.title.x",
      "quickCheck.overrides.heating.solar_thermal.cop",
      "__proto__.polluted",
      "",
    ]) {
      expect(resolvePatchPath(path), path).toEqual({ kind: "unknown-field" })
    }
  })
})
