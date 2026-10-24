// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "./create-project"
import { projectSchema } from "./schema/project"
import { METHODOLOGY_VERSION, SCHEMA_VERSION } from "./versions"

const NOW = new Date("2026-10-24T08:00:00.000Z")

describe("createProject", () => {
  it.each([
    [{ quickCheck: true }, { quickCheck: true, businessPlan: false }],
    [{ businessPlan: true }, { quickCheck: false, businessPlan: true }],
    [{ quickCheck: true, businessPlan: true }, { quickCheck: true, businessPlan: true }],
  ])("builds a valid empty project for %j", (modules, expected) => {
    const project = createProject({ modules, now: NOW })
    expect(projectSchema.safeParse(project).success).toBe(true)
    expect(project.meta.modules).toEqual(expected)
  })

  it("stamps ids, times and versions (D-13)", () => {
    const project = createProject({ modules: { quickCheck: true }, name: "Sunny Valley", now: NOW, exampleId: "example-02" })
    expect(project.meta).toMatchObject({
      name: "Sunny Valley",
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      schemaVersion: SCHEMA_VERSION,
      methodologyVersion: METHODOLOGY_VERSION,
      exampleId: "example-02",
    })
    expect(project.meta.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(createProject({ modules: { quickCheck: true } }).meta.id).not.toBe(project.meta.id)
  })

  it("keeps every section, whichever modules are on (D-01)", () => {
    const project = createProject({ modules: { businessPlan: true }, now: NOW })
    expect(project.buildings.total).toBeNull()
    expect(project.quickCheck.overrides.economic.interest_rate).toBeNull()
    expect(project.businessPlan.risks).toEqual([])
  })

  it("starts every input empty: share grid, sources, PV off, text blank (D-31)", () => {
    const project = createProject({ modules: { quickCheck: true, businessPlan: true }, now: NOW })
    expect(Object.values(project.buildings.shares).flatMap(Object.values).every((cell) => cell === null)).toBe(true)
    expect(Object.values(project.sources.potentials).every((potential) => potential === null)).toBe(true)
    expect(project.sources.pv).toBe(false)
    expect(project.site.name).toBe("")
    expect(project.businessPlan.scenarioId).toBeNull()
  })

  it("needs at least one module", () => {
    expect(() => createProject({ modules: {} })).toThrow(/at least one module/)
    expect(() => createProject({ modules: { quickCheck: false, businessPlan: false } })).toThrow()
  })

  it("rejects an invalid injected id", () => {
    expect(() => createProject({ modules: { quickCheck: true }, id: "not-a-uuid" })).toThrow()
  })
})
