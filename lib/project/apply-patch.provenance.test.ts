// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "./apply-patch"
import { createListItem } from "./create-list-item"
import { createProject } from "./create-project"
import { FIELDS } from "./fields/registry"
import { projectSchema, type Project } from "./schema/project"
import { PROVENANCE_LIMITS } from "./schema/provenance"

const CREATED = new Date("2026-10-24T08:00:00.000Z")
const LATER = new Date("2026-10-24T09:30:00.000Z")
const AI = { by: "assistant", model: "claude-sonnet-5-5", file: "survey.pdf" } as const

const project = () => createProject({ modules: { quickCheck: true, businessPlan: true }, id: "00000000-0000-4000-8000-000000000001", now: CREATED })
const risk = (id: string, title = "", validation = "") => ({ ...createListItem("businessPlan.risks", id), title, validation })
const marks = (value: Project) => Object.keys(value.provenance.ai).sort()

describe("applyPatch: AI provenance (schema v2)", () => {
  it("marks the applied values with source, model, time and file", () => {
    const result = applyPatch(project(), { "buildings.total": 12, "site.name": "Valley" }, { now: LATER, provenance: AI })
    expect(result.ok).toBe(true)
    expect(result.project.provenance.ai["buildings.total"]).toEqual({ at: LATER.toISOString(), ...AI })
    expect(marks(result.project)).toEqual(["buildings.total", "site.name"])
    expect(projectSchema.safeParse(result.project).success).toBe(true)
  })

  it("removes the mark when the user edits the value", () => {
    const ai = applyPatch(project(), { "buildings.total": 12, "buildings.areaM2": 24_000 }, { provenance: AI }).project
    const manual = applyPatch(ai, { "buildings.total": 14 }, { now: LATER })
    expect(marks(manual.project)).toEqual(["buildings.areaM2"])
  })

  it("removes the mark when the user clears the value, and marks no empty value", () => {
    const ai = applyPatch(project(), { "buildings.total": 12 }, { provenance: AI }).project
    expect(marks(applyPatch(ai, { "buildings.total": null }).project)).toEqual([])
    expect(marks(applyPatch(project(), { "buildings.total": null, "site.name": "" }, { provenance: AI }).project)).toEqual([])
  })

  it("marks each filled property of a proposed list or row, never the row id", () => {
    const list = applyPatch(project(), { "businessPlan.risks": [risk("a", "Permits"), risk("b", "Prices", "Ask suppliers")] }, { provenance: AI })
    expect(marks(list.project)).toEqual([
      "businessPlan.risks.0.dealBreaker",
      "businessPlan.risks.0.title",
      "businessPlan.risks.1.dealBreaker",
      "businessPlan.risks.1.title",
      "businessPlan.risks.1.validation",
    ])
    const row = applyPatch(list.project, { "businessPlan.risks.0": risk("a", "Grid access", "Call the utility") }, { provenance: AI })
    expect(marks(row.project)).toContain("businessPlan.risks.0.validation")
  })

  it("drops every mark of a list the user replaces, and keeps marks of other rows on a row edit", () => {
    const ai = applyPatch(project(), { "businessPlan.risks": [risk("a", "Permits"), risk("b", "Prices")] }, { provenance: AI }).project
    expect(marks(applyPatch(ai, { "businessPlan.risks.1.title": "Energy prices" }).project)).toEqual([
      "businessPlan.risks.0.dealBreaker",
      "businessPlan.risks.0.title",
      "businessPlan.risks.1.dealBreaker",
    ])
    expect(marks(applyPatch(ai, { "businessPlan.risks": [risk("b", "Prices")] }).project)).toEqual([])
  })

  it("never changes marks for rejected keys, and changes nothing in atomic mode on failure", () => {
    const ai = applyPatch(project(), { "buildings.total": 12 }, { provenance: AI }).project
    const partial = applyPatch(ai, { "buildings.total": -1, "site.name": "Valley" }, { provenance: AI })
    expect(partial.applied).toEqual(["site.name"])
    expect(partial.project.provenance.ai["buildings.total"]).toEqual(ai.provenance.ai["buildings.total"])
    const atomic = applyPatch(ai, { "buildings.total": 13, "site.name": 5 }, { atomic: true })
    expect(atomic.project).toBe(ai)
  })

  it("cuts long model ids and file names to the schema limits", () => {
    const result = applyPatch(project(), { "buildings.total": 3 }, { provenance: { by: "email", model: "m".repeat(300), file: "f".repeat(300) } })
    const mark = result.project.provenance.ai["buildings.total"]
    expect(mark.model).toHaveLength(PROVENANCE_LIMITS.model)
    expect(mark.file).toHaveLength(PROVENANCE_LIMITS.file)
    expect(projectSchema.safeParse(result.project).success).toBe(true)
  })

  it("rejects provenance as a patch key", () => {
    const result = applyPatch(project(), { "provenance.ai": {}, provenance: {} })
    expect(result.errors.map((error) => error.code)).toEqual(["read-only", "read-only"])
  })

  it("can never hold more marks than the schema allows (every field plus every row property)", () => {
    const leaves = FIELDS.reduce((sum, field) => sum + (field.kind === "items" ? field.maxItems * field.properties.length : 1), 0)
    expect(leaves).toBeLessThanOrEqual(PROVENANCE_LIMITS.entries)
  })
})
