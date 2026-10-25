// @vitest-environment node
import { describe, expect, it } from "vitest"
import { parseImportText } from "@/lib/storage/import"
import { EXPORT_FORMAT, EXPORT_FORMAT_VERSION } from "@/lib/storage/export"
import fixture from "./v1-baseline.fixture.json"
import { v2Provenance } from "./v2-provenance"
import { v3AiScore } from "./v3-ai-score"

describe("v3 aiScore (D-73)", () => {
  it("adds an empty AI Plan Score", () => {
    expect(v3AiScore.version).toBe(3)
    expect(v3AiScore.up({ meta: { schemaVersion: 2 }, provenance: { ai: {} } })).toEqual({
      meta: { schemaVersion: 2 },
      provenance: { ai: {} },
      aiScore: null,
    })
  })

  it("imports a v2 file with aiScore null and every other value kept", () => {
    const v2 = { ...v2Provenance.up(structuredClone(fixture)), meta: { ...fixture.meta, schemaVersion: 2 } }
    const file = JSON.stringify({ format: EXPORT_FORMAT, formatVersion: EXPORT_FORMAT_VERSION, exportedAt: "2026-10-24T08:00:00.000Z", project: v2 })
    const imported = parseImportText(file)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    expect(imported.project.meta.schemaVersion).toBe(3)
    expect(imported.project.aiScore).toBeNull()
    const { aiScore, meta, ...rest } = imported.project
    const { meta: oldMeta, ...oldRest } = v2
    expect(aiScore).toBeNull()
    expect(rest).toEqual(oldRest)
    expect({ ...meta, schemaVersion: 2 }).toEqual(oldMeta)
  })
})
