// @vitest-environment node
import { describe, expect, it } from "vitest"
import { z } from "zod"
import { applyPatch, MIGRATIONS, projectSchema, type Migration, type Project } from "@/lib/project"
import fixture from "@/lib/project/migrations/v1-baseline.fixture.json"
import { buildExport, EXPORT_FORMAT } from "./export"
import { IMPORT_ERROR_CODES, parseImportText, readImportFile } from "./import"
import { IMPORT_MAX_BYTES, IMPORT_MAX_LISTED_ERRORS } from "./limits"
import { testProject } from "./test-utils/projects"

const now = new Date("2026-10-24T10:00:00.000Z")
const envelope = (project: unknown) => JSON.stringify({ format: EXPORT_FORMAT, formatVersion: 1, exportedAt: now.toISOString(), project })

describe("import: round trip", () => {
  it("brings back exactly the exported inputs", async () => {
    const project = testProject(1, { "buildings.total": 12, "sources.potentials.ground_water": "high", "meta.name": "Valley" })
    const file = buildExport(project, now)
    const result = await readImportFile(new Blob([file.text]))
    expect(result).toEqual({
      ok: true,
      project,
      fromVersion: 3,
      migrated: false,
      methodology: { file: project.meta.methodologyVersion, current: project.meta.methodologyVersion, changed: false },
    })
  })

  it("keeps the AI marks (schema v2 provenance) through export and import", async () => {
    const marked = applyPatch(testProject(1), { "buildings.total": 7 }, { provenance: { by: "email", model: "claude-haiku-5-5", file: "plan.docx" } })
    const result = await readImportFile(new Blob([buildExport(marked.project, now).text]))
    expect(result.ok && result.project.provenance).toEqual(marked.project.provenance)
    expect(result.ok && result.project.provenance.ai["buildings.total"]).toMatchObject({ by: "email", file: "plan.docx" })
  })

  it("rejects a file whose AI marks point at something that is not a field", () => {
    const project = testProject(1)
    const bad = { ...project, provenance: { ai: { "meta.id": { at: now.toISOString(), by: "email", model: "m" } } } }
    expect(parseImportText(envelope(bad))).toMatchObject({ ok: false, code: "invalid" })
  })

  it("accepts a bare project (the ingestion-agent contract, D-05)", () => {
    const result = parseImportText(JSON.stringify(fixture))
    expect(result.ok).toBe(true)
  })

  it("keeps text as typed: markup is data, never HTML (D-14)", () => {
    const name = `<img src=x onerror="alert(1)"> & <script>`
    const result = parseImportText(envelope(testProject(1, { "meta.name": name })))
    expect(result.ok && result.project.meta.name).toBe(name)
  })

  it("flags a file saved with another methodology version (results are recomputed)", () => {
    const old = testProject(1)
    const result = parseImportText(envelope({ ...old, meta: { ...old.meta, methodologyVersion: "0.9.0" } }))
    expect(result.ok && result.methodology).toEqual({ file: "0.9.0", current: old.meta.methodologyVersion, changed: true })
  })
})

describe("import: rejected files", () => {
  it("rejects files over 5 MB before reading them", async () => {
    let read = false
    const big = { size: IMPORT_MAX_BYTES + 1, text: async () => ((read = true), "") } as unknown as Blob
    expect(await readImportFile(big)).toMatchObject({ ok: false, code: "too-large", params: { maxMegabytes: 5 } })
    expect(read).toBe(false)
    expect(parseImportText(" ".repeat(11), { maxBytes: 10 })).toMatchObject({ code: "too-large" })
  })

  it.each([
    ["an empty file", "", "empty"],
    ["whitespace", "   ", "empty"],
    ["text that is not JSON", "{oops", "not-json"],
    ["a JSON array", "[]", "not-first-move"],
    ["another JSON file", JSON.stringify({ name: "x" }), "not-first-move"],
    ["a newer export format", JSON.stringify({ format: EXPORT_FORMAT, formatVersion: 2, project: {} }), "newer-version"],
    ["a project from a newer app", envelope({ meta: { schemaVersion: 4 } }), "newer-version"],
    ["a project older than any supported version", envelope({ meta: { schemaVersion: 0 } }), "unsupported-version"],
    ["an envelope without a project version", envelope({ meta: {} }), "invalid"],
  ])("rejects %s", (_, text, code) => {
    expect(parseImportText(text)).toMatchObject({ ok: false, code })
  })

  it("rejects an empty or unreadable blob", async () => {
    expect(await readImportFile(new Blob([]))).toMatchObject({ code: "empty" })
    const broken = { size: 3, text: async () => Promise.reject(new Error("io")) } as unknown as Blob
    expect(await readImportFile(broken)).toMatchObject({ code: "unreadable" })
  })

  it("lists the bad fields with their registry labels", () => {
    const project = testProject(1)
    const bad = { ...project, buildings: { ...project.buildings, total: -3 }, site: { ...project.site, extra: 1 } }
    const result = parseImportText(envelope(bad))
    expect(result).toMatchObject({ ok: false, code: "invalid", params: { version: 3 }, moreErrors: 0 })
    if (result.ok) return
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "buildings.total", code: "min", text: { area: "quick-check", key: "fields.buildings.total" } }),
        expect.objectContaining({ path: "site.extra", code: "unknown-field", text: null }),
      ]),
    )
  })

  it("lists at most 20 bad fields and counts the rest", () => {
    const project = testProject(1)
    const risks = Array.from({ length: 30 }, (_, index) => ({ id: `r${index}`, title: 1, description: "", dealBreaker: false, validation: "" }))
    const result = parseImportText(envelope({ ...project, businessPlan: { ...project.businessPlan, risks } }))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors).toHaveLength(IMPORT_MAX_LISTED_ERRORS)
    expect(result.moreErrors).toBe(10)
  })

  it("rejects a damaged envelope with the bad keys", () => {
    const text = JSON.stringify({ format: EXPORT_FORMAT, formatVersion: 1, exportedAt: "yesterday", project: {}, extra: true })
    const result = parseImportText(text)
    expect(result).toMatchObject({ ok: false, code: "invalid" })
    if (result.ok) return
    expect(result.errors.map((error) => error.path).sort()).toEqual(["exportedAt", "format"])
  })

  it.each([["1"], [1.5], [null]])("names the field when the schema version is %j (never an empty list)", (version) => {
    const project = { ...fixture, meta: { ...fixture.meta, schemaVersion: version } }
    for (const text of [JSON.stringify(project), envelope(project)]) {
      const result = parseImportText(text)
      expect(result).toMatchObject({ ok: false, code: "invalid" })
      if (!result.ok) expect(result.errors).toEqual([expect.objectContaining({ path: "meta.schemaVersion", code: "integer" })])
    }
  })

  it("never fails as invalid without a listed field", () => {
    const deep = `${"[".repeat(50_000)}${"]".repeat(50_000)}`
    const results = [
      parseImportText(envelope("not a project")),
      parseImportText(`{"meta":{"schemaVersion":1},"site":${deep}}`),
    ]
    for (const result of results) {
      expect(result.ok).toBe(false)
      if (!result.ok && result.code === "invalid") expect(result.errors.length).toBeGreaterThan(0)
    }
  })

  it("clips file-controlled paths and messages of listed fields", () => {
    const key = `<img src=x onerror=1>${"K".repeat(100_000)}`
    const result = parseImportText(JSON.stringify({ ...fixture, site: { ...fixture.site, [key]: 1 } }))
    expect(result).toMatchObject({ ok: false, code: "invalid" })
    if (result.ok) return
    for (const error of result.errors) {
      expect(error.path.length).toBeLessThanOrEqual(80)
      expect(error.message.length).toBeLessThanOrEqual(80)
    }
    expect(result.errors[0]!.path).toMatch(/^site\.<img src=x onerror=1>K+…$/)
  })

  it("has copy codes for every failure", () => {
    expect(new Set(IMPORT_ERROR_CODES).size).toBe(IMPORT_ERROR_CODES.length)
  })
})

describe("import: migrations (old files, D-13)", () => {
  // A pretend version 4 that renames the project name to `title`, so v3 files must be migrated.
  const v4Schema = projectSchema.extend({
    meta: projectSchema.shape.meta.omit({ name: true, schemaVersion: true }).extend({ title: z.string(), schemaVersion: z.literal(4) }),
  })
  const v4: Migration = {
    version: 4,
    description: "Rename meta.name to meta.title.",
    up: (project) => {
      const { name, ...meta } = project.meta as Record<string, unknown>
      return { ...project, meta: { ...meta, title: name } }
    },
  }
  const migration = { migrations: [...MIGRATIONS, v4], schema: v4Schema as unknown as z.ZodType<Project>, target: 4 }

  it("runs every step from the file's version", () => {
    const result = parseImportText(envelope(testProject(1, { "meta.name": "Old" })), { migration })
    expect(result).toMatchObject({ ok: true, fromVersion: 3, migrated: true })
    expect(result.ok && (result.project.meta as unknown as { title: string }).title).toBe("Old")
  })

  it("keeps the frozen v1 fixture importable with the real chain", () => {
    const result = parseImportText(envelope(fixture))
    expect(result).toMatchObject({ ok: true, fromVersion: 1, migrated: true })
  })
})
