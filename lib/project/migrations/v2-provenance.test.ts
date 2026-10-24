// @vitest-environment node
import { describe, expect, it } from "vitest"
import { buildExport, EXPORT_FORMAT, EXPORT_FORMAT_VERSION } from "@/lib/storage/export"
import { parseImportText } from "@/lib/storage/import"
import fixture from "./v1-baseline.fixture.json"
import { migrateProject } from "./run-migrations"
import { v2Provenance } from "./v2-provenance"

describe("v2 provenance", () => {
  it("adds an empty provenance section", () => {
    expect(v2Provenance.version).toBe(2)
    expect(v2Provenance.up({ meta: { schemaVersion: 1 } })).toEqual({ meta: { schemaVersion: 1 }, provenance: { ai: {} } })
  })

  it("migrates the frozen v1 file to v2 without losing an input", () => {
    const result = migrateProject(fixture)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result).toMatchObject({ fromVersion: 1, migrated: true })
    expect(result.project.meta.schemaVersion).toBe(2)
    expect(result.project.provenance).toEqual({ ai: {} })
    const { provenance, meta, ...inputs } = result.project
    const { meta: oldMeta, ...oldInputs } = fixture
    expect(provenance).toBeDefined()
    expect(inputs).toEqual(oldInputs)
    expect({ ...meta, schemaVersion: 1 }).toEqual(oldMeta)
  })

  it("imports a v1 export, then exports it again as v2", () => {
    const v1File = JSON.stringify({ format: EXPORT_FORMAT, formatVersion: EXPORT_FORMAT_VERSION, exportedAt: "2026-10-24T08:00:00.000Z", project: fixture })
    const imported = parseImportText(v1File)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    const again = buildExport(imported.project, new Date("2026-10-24T09:00:00.000Z"))
    expect(JSON.parse(again.text).project.meta.schemaVersion).toBe(2)
    expect(JSON.parse(again.text).project.provenance).toEqual({ ai: {} })
  })
})
