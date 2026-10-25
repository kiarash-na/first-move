// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project/create-project"
import { projectSchema } from "./project"

const empty = () =>
  createProject({
    modules: { quickCheck: true, businessPlan: true },
    id: "00000000-0000-4000-8000-000000000001",
    now: new Date("2026-10-24T08:00:00.000Z"),
  })

describe("projectSchema", () => {
  it("accepts an empty project", () => {
    expect(projectSchema.safeParse(empty()).success).toBe(true)
  })

  it("has the six sections of the PLAN-DASH-00 data model, plus provenance (v2) and aiScore (v3)", () => {
    expect(Object.keys(projectSchema.shape)).toEqual(["meta", "site", "buildings", "sources", "quickCheck", "businessPlan", "provenance", "aiScore"])
  })

  it.each([
    ["a fractional building count", (p: ReturnType<typeof empty>) => ({ ...p, buildings: { ...p.buildings, total: 2.5 } })],
    ["a share above 100", (p: ReturnType<typeof empty>) => ({
      ...p,
      buildings: { ...p.buildings, shares: { ...p.buildings.shares, residential: { ...p.buildings.shares.residential, until_1919: 101 } } },
    })],
    ["an unknown potential", (p: ReturnType<typeof empty>) => ({ ...p, sources: { ...p.sources, potentials: { ...p.sources.potentials, geothermal: "huge" } } })],
    ["an unknown section", (p: ReturnType<typeof empty>) => ({ ...p, results: {} })],
    ["a missing section", (p: ReturnType<typeof empty>) => ({ ...p, site: undefined })],
    ["a newer schema version", (p: ReturnType<typeof empty>) => ({ ...p, meta: { ...p.meta, schemaVersion: 4 } })],
    ["no provenance section", (p: ReturnType<typeof empty>) => ({ ...p, provenance: undefined })],
    ["no aiScore section", (p: ReturnType<typeof empty>) => ({ ...p, aiScore: undefined })],
    ["no module", (p: ReturnType<typeof empty>) => ({ ...p, meta: { ...p.meta, modules: { quickCheck: false, businessPlan: false } } })],
  ])("rejects %s", (_, change) => {
    expect(projectSchema.safeParse(change(empty())).success).toBe(false)
  })

  it("rejects non-objects", () => {
    for (const value of [null, "project", 1, []]) expect(projectSchema.safeParse(value).success).toBe(false)
  })
})
