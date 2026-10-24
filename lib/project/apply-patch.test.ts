// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "./apply-patch"
import { createListItem } from "./create-list-item"
import { createProject } from "./create-project"
import { projectSchema } from "./schema/project"

const CREATED = new Date("2026-10-24T08:00:00.000Z")
const LATER = new Date("2026-10-24T09:30:00.000Z")

const project = (modules = { quickCheck: true, businessPlan: true }) =>
  createProject({ modules, id: "00000000-0000-4000-8000-000000000001", now: CREATED })

const risk = (id: string, title = "") => ({ ...createListItem("businessPlan.risks", id), title })

describe("applyPatch: good patches", () => {
  it("applies Quick Check inputs and stamps updatedAt", () => {
    const result = applyPatch(
      project(),
      {
        "buildings.total": 12,
        "buildings.areaM2": 24_000,
        "buildings.shares.residential.1991_2010": 60,
        "buildings.shares.category_a.2011_today": 40,
        "sources.potentials.ground_water": "high",
        "sources.pv": true,
      },
      { now: LATER },
    )
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.applied).toHaveLength(6)
    expect(result.project.buildings.total).toBe(12)
    expect(result.project.buildings.shares.residential["1991_2010"]).toBe(60)
    expect(result.project.sources.potentials.ground_water).toBe("high")
    expect(result.project.meta.updatedAt).toBe(LATER.toISOString())
    expect(projectSchema.safeParse(result.project).success).toBe(true)
  })

  it("clears a nullable input with null", () => {
    const filled = applyPatch(project(), { "quickCheck.networkLengthM": 900 }).project
    const cleared = applyPatch(filled, { "quickCheck.networkLengthM": null })
    expect(cleared.ok).toBe(true)
    expect(cleared.project.quickCheck.networkLengthM).toBeNull()
  })

  it("stores free text exactly as typed (D-21)", () => {
    const text = "  <script>alert(1)</script>\nZweite Zeile  "
    const result = applyPatch(project(), { "businessPlan.opportunity.painPoint": text, "site.stakeholders": ["Hotel", ""] })
    expect(result.project.businessPlan.opportunity.painPoint).toBe(text)
    expect(result.project.site.stakeholders).toEqual(["Hotel", ""])
  })

  it("replaces a whole item list, then edits one row by index", () => {
    const withRows = applyPatch(project(), { "businessPlan.risks": [risk("r1"), risk("r2")] })
    expect(withRows.ok).toBe(true)
    const edited = applyPatch(withRows.project, {
      "businessPlan.risks.1.dealBreaker": true,
      "businessPlan.risks.1.validation": "Ask the owners",
    })
    expect(edited.ok).toBe(true)
    expect(edited.project.businessPlan.risks[1]).toMatchObject({ id: "r2", dealBreaker: true, validation: "Ask the owners" })
    expect(edited.project.businessPlan.risks[0]).toBe(withRows.project.businessPlan.risks[0])
  })

  it("replaces one row", () => {
    const withRows = applyPatch(project(), { "businessPlan.risks": [risk("r1")] }).project
    const result = applyPatch(withRows, { "businessPlan.risks.0": risk("r1", "Permits") })
    expect(result.project.businessPlan.risks[0].title).toBe("Permits")
  })

  it("applies keys in order, so a new list can be edited in the same patch", () => {
    const result = applyPatch(project(), {
      "businessPlan.criticalAssumptions": [{ id: "a1", statement: "", validation: "" }],
      "businessPlan.criticalAssumptions.0.statement": "Groundwater is usable",
    })
    expect(result.ok).toBe(true)
    expect(result.project.businessPlan.criticalAssumptions[0].statement).toBe("Groundwater is usable")
  })

  it("turns a module on and off while one stays on", () => {
    const result = applyPatch(project({ quickCheck: true, businessPlan: false }), {
      "meta.modules.businessPlan": true,
      "meta.modules.quickCheck": false,
    })
    expect(result.ok).toBe(true)
    expect(result.project.meta.modules).toEqual({ quickCheck: false, businessPlan: true })
  })

  it("accepts an override and a reset of it (D-10)", () => {
    const custom = applyPatch(project(), { "quickCheck.overrides.economic.interest_rate": 4.5 }).project
    expect(custom.quickCheck.overrides.economic.interest_rate).toBe(4.5)
    const reset = applyPatch(custom, { "quickCheck.overrides.economic.interest_rate": null }).project
    expect(reset.quickCheck.overrides.economic.interest_rate).toBeNull()
  })

  it("returns the same object and keeps updatedAt when nothing changes", () => {
    const base = project()
    const result = applyPatch(base, { "buildings.total": null, "site.name": "" }, { now: LATER })
    expect(result.ok).toBe(true)
    expect(result.project).toBe(base)
    expect(result.applied).toEqual(["buildings.total", "site.name"])
  })

  it("never mutates the input project or the patch values", () => {
    const base = project()
    const snapshot = structuredClone(base)
    const rows = [risk("r1")]
    const result = applyPatch(base, { "businessPlan.risks": rows, "buildings.total": 3 })
    expect(base).toEqual(snapshot)
    expect(result.project.businessPlan.risks).not.toBe(rows)
  })
})

describe("applyPatch: bad patches", () => {
  it.each([
    ["buildings.total", 0, "min", { min: 1 }],
    ["buildings.total", 100_001, "max", { max: 100_000 }],
    ["buildings.total", 2.5, "integer", { expected: "int" }],
    ["buildings.total", "12", "type", { expected: "number" }],
    ["buildings.areaM2", 0, "above", { min: 0 }],
    ["buildings.shares.residential.until_1919", 120, "max", { max: 100 }],
    ["sources.potentials.geothermal", "huge", "choice", { options: ["low", "medium", "high", "unknown"] }],
    ["sources.pv", null, "required", undefined],
    ["site.name", "x".repeat(201), "too-long", { max: 200 }],
    ["quickCheck.overrides.heating.geothermal.cop", 1, "above", { min: 1 }],
  ])("rejects %s = %j with %s", (key, value, code, params) => {
    const base = project()
    const result = applyPatch(base, { [key]: value })
    expect(result.ok).toBe(false)
    expect(result.project).toBe(base)
    expect(result.applied).toEqual([])
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({ path: key, code })
    expect(result.errors[0].params).toEqual(params)
    expect(result.errors[0].message.length).toBeGreaterThan(0)
  })

  it("rejects unknown fields, containers and system values", () => {
    const result = applyPatch(project(), {
      "buildings.density": 3,
      "buildings.shares": {},
      "meta.id": "00000000-0000-4000-8000-000000000002",
      "meta.updatedAt": "2030-01-01T00:00:00.000Z",
      "quickCheck.overrides.cooling.waste_heat.low": 5,
    })
    expect(result.errors.map((error) => [error.path, error.code])).toEqual([
      ["buildings.density", "unknown-field"],
      ["buildings.shares", "unknown-field"],
      ["meta.id", "read-only"],
      ["meta.updatedAt", "read-only"],
      ["quickCheck.overrides.cooling.waste_heat.low", "unknown-field"],
    ])
  })

  it("reports errors inside a list value by their full path", () => {
    const result = applyPatch(project(), {
      "businessPlan.risks": [risk("r1"), { ...risk("r2"), dealBreaker: "yes", extra: 1 }],
    })
    const found = result.errors.map((error) => [error.path, error.code])
    expect(found).toHaveLength(2)
    expect(found).toEqual(
      expect.arrayContaining([
        ["businessPlan.risks.1.extra", "unknown-field"],
        ["businessPlan.risks.1.dealBreaker", "type"],
      ]),
    )
  })

  it("rejects duplicate row ids and too many rows", () => {
    expect(applyPatch(project(), { "businessPlan.risks": [risk("same"), risk("same")] }).errors[0].code).toBe("duplicate-id")
    const many = Array.from({ length: 31 }, (_, index) => risk(`r${index}`))
    expect(applyPatch(project(), { "businessPlan.risks": many }).errors[0]).toMatchObject({ code: "too-many", params: { max: 30 } })
  })

  it("rejects editing a row that does not exist, and the row id", () => {
    const result = applyPatch(project(), { "businessPlan.risks.0.title": "Ghost", "businessPlan.risks.0.id": "x" })
    expect(result.errors.map((error) => [error.path, error.code])).toEqual([
      ["businessPlan.risks.0.id", "read-only"],
      ["businessPlan.risks.0.title", "not-found"],
    ])
  })

  it("rejects turning off the last module, on the field that did it (D-01)", () => {
    const base = project({ quickCheck: true, businessPlan: false })
    const result = applyPatch(base, { "meta.modules.quickCheck": false, "buildings.total": 5 })
    expect(result.ok).toBe(false)
    expect(result.errors).toEqual([
      { path: "meta.modules.quickCheck", code: "at-least-one-module", message: "At least one module must be on" },
    ])
    expect(result.applied).toEqual(["buildings.total"])
    expect(result.project.meta.modules.quickCheck).toBe(true)
    expect(result.project.buildings.total).toBe(5)
  })
})

describe("applyPatch: partial vs atomic", () => {
  const patch = { "buildings.total": 8, "buildings.areaM2": -1 }

  it("applies the valid keys by default and reports the others", () => {
    const result = applyPatch(project(), patch)
    expect(result.ok).toBe(false)
    expect(result.applied).toEqual(["buildings.total"])
    expect(result.project.buildings.total).toBe(8)
    expect(result.errors.map((error) => error.path)).toEqual(["buildings.areaM2"])
  })

  it("applies nothing in atomic mode", () => {
    const base = project()
    const result = applyPatch(base, patch, { atomic: true })
    expect(result).toMatchObject({ ok: false, applied: [] })
    expect(result.project).toBe(base)
    expect(result.errors.map((error) => error.path)).toEqual(["buildings.areaM2"])
  })

  it("applies nothing in atomic mode when a cross-field rule or a missing row fails", () => {
    const qcOnly = project({ quickCheck: true, businessPlan: false })
    const crossField = applyPatch(qcOnly, { "buildings.total": 8, "meta.modules.quickCheck": false }, { atomic: true })
    expect(crossField).toMatchObject({ ok: false, applied: [], project: qcOnly })
    const missingRow = applyPatch(qcOnly, { "buildings.total": 8, "businessPlan.risks.3.title": "x" }, { atomic: true })
    expect(missingRow).toMatchObject({ ok: false, applied: [], project: qcOnly })
    expect(missingRow.errors[0].code).toBe("not-found")
  })

  it("leaves an invalid input project unchanged and says why", () => {
    const broken = { ...project(), buildings: { ...project().buildings, total: -3 } }
    const result = applyPatch(broken, { "site.name": "Valley" })
    expect(result.ok).toBe(false)
    expect(result.project).toBe(broken)
    expect(result.errors).toContainEqual(expect.objectContaining({ path: "buildings.total", code: "min" }))
  })
})
