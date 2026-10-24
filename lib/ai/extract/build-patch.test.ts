import { describe, expect, it } from "vitest"
import { applyPatch, createProject } from "@/lib/project"
import { buildPatch } from "./build-patch"
import { fieldCatalogue } from "./field-catalogue"
import type { MergedValue } from "./merge"
import { EN_TEXTS } from "./test-utils/texts"

const catalogue = fieldCatalogue({ modules: ["quickCheck", "businessPlan"] }, "en", EN_TEXTS)
const merged = (id: string, value: MergedValue["value"], row?: string): MergedValue => ({
  id,
  field: catalogue.fields.find((field) => field.id === id)!,
  value,
  ...(row && { row }),
  sources: [{ quote: String(value) }],
})
const ids = () => {
  let next = 0
  return () => `row-${++next}`
}

describe("buildPatch", () => {
  const base = createProject({ modules: { quickCheck: true, businessPlan: true }, now: new Date("2026-10-24T10:00:00Z") })

  it("makes one entry per value field", () => {
    expect(buildPatch([merged("buildings.total", 120), merged("sources.pv", true)], base, ids())).toEqual([
      { key: "buildings.total", value: 120, label: "Total number of buildings", sources: [{ quote: "120" }] },
      { key: "sources.pv", value: true, label: "Photovoltaic (PV) available", sources: [{ quote: "true" }] },
    ])
  })

  it("appends text list entries to the existing ones, skipping entries already there", () => {
    const project = applyPatch(base, { "site.stakeholders": ["Hotel"] }).project
    const [entry] = buildPatch([merged("site.stakeholders", "hotel"), merged("site.stakeholders", "Municipality")], project, ids())
    expect(entry).toMatchObject({ key: "site.stakeholders", value: ["Hotel", "Municipality"] })
  })

  it("appends new rows with fresh ids after the existing rows", () => {
    const project = applyPatch(base, { "businessPlan.risks": [{ id: "kept", title: "Existing", description: "", dealBreaker: false, validation: "" }] }).project
    const [entry] = buildPatch(
      [merged("businessPlan.risks[].title", "Permit delay", "0:1"), merged("businessPlan.risks[].dealBreaker", true, "0:1"), merged("businessPlan.risks[].title", "Low uptake", "0:2")],
      project,
      ids(),
    )
    expect(entry.key).toBe("businessPlan.risks")
    expect(entry.value).toEqual([
      { id: "kept", title: "Existing", description: "", dealBreaker: false, validation: "" },
      { id: "row-1", title: "Permit delay", description: "", dealBreaker: true, validation: "" },
      { id: "row-2", title: "Low uptake", description: "", dealBreaker: false, validation: "" },
    ])
    expect(applyPatch(project, { [entry.key]: entry.value }).ok).toBe(true)
  })
})
