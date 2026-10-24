// @vitest-environment node
import { describe, expect, it } from "vitest"
import fixture from "./v1-baseline.fixture.json"
import { migrateProject } from "./run-migrations"
import { v1Baseline } from "./v1-baseline"

describe("v1 baseline", () => {
  it("anchors the chain at version 1 and changes nothing", () => {
    const data = { meta: { schemaVersion: 1 } }
    expect(v1Baseline.version).toBe(1)
    expect(v1Baseline.up(data)).toEqual(data)
  })

  it("keeps a filled v1 file importable with the current schema (frozen fixture)", () => {
    const result = migrateProject(fixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.fromVersion).toBe(1)
    expect(result.project.buildings.total).toBe(12)
    expect(result.project.businessPlan.risks[0].dealBreaker).toBe(true)
  })
})
