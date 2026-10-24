// @vitest-environment node
import { describe, expect, it } from "vitest"
import * as model from "./index"

describe("lib/project public API", () => {
  it("exposes the model in one import", () => {
    for (const name of [
      "applyPatch",
      "createProject",
      "createListItem",
      "clearPatch",
      "inputStatus",
      "groupRuleStatus",
      "migrateProject",
      "resolvePatchPath",
      "stepEquations",
      "getField",
      "fieldsOf",
    ] as const) {
      expect(typeof model[name], name).toBe("function")
    }
    expect(model.projectSchema.safeParse).toBeTypeOf("function")
    expect(model.FIELDS.length).toBeGreaterThan(100)
    expect(model.MIGRATIONS).toHaveLength(model.SCHEMA_VERSION)
  })

  it("leaves the JSON Schema contract out of the barrel the client imports", () => {
    expect("projectJsonSchema" in model).toBe(false)
  })

  it("round-trips a project: create, patch, migrate", () => {
    const created = model.createProject({ modules: { quickCheck: true } })
    const { project } = model.applyPatch(created, { "buildings.total": 4 })
    const migrated = model.migrateProject(JSON.parse(JSON.stringify(project)))
    expect(migrated.ok && migrated.project).toEqual(project)
  })
})
