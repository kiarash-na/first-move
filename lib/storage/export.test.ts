// @vitest-environment node
import { describe, expect, it } from "vitest"
import { METHODOLOGY_VERSION, projectSchema } from "@/lib/project"
import { buildExport, buildExportEnvelope, EXPORT_FORMAT, EXPORT_MIME_TYPE, withCurrentMethodology } from "./export"
import { testProject } from "./test-utils/projects"

const now = new Date("2026-10-24T10:00:00.000Z")

describe("export (.firstmove.json, D-13)", () => {
  it("holds the inputs and their versions, nothing else", () => {
    const project = testProject(1, { "buildings.total": 12, "meta.name": "Valley" })
    const file = buildExport(project, now)
    expect(file.mimeType).toBe(EXPORT_MIME_TYPE)
    expect(file.fileName).toMatch(/^valley-\d{4}-\d{2}-\d{2}\.firstmove\.json$/)

    const parsed = JSON.parse(file.text)
    expect(Object.keys(parsed)).toEqual(["format", "formatVersion", "exportedAt", "project"])
    expect(parsed).toMatchObject({ format: EXPORT_FORMAT, formatVersion: 1, exportedAt: now.toISOString() })
    expect(parsed.project.meta).toMatchObject({ schemaVersion: 2, methodologyVersion: METHODOLOGY_VERSION })
    // Inputs only: the file is exactly a valid project (results are never part of it).
    expect(projectSchema.parse(parsed.project)).toEqual(project)
  })

  it("stamps the current methodology version", () => {
    const old = { ...testProject(1), meta: { ...testProject(1).meta, methodologyVersion: "0.9.0" } }
    expect(buildExportEnvelope(old, now).project.meta.methodologyVersion).toBe(METHODOLOGY_VERSION)
    const current = testProject(1)
    expect(withCurrentMethodology(current)).toBe(current)
  })
})
