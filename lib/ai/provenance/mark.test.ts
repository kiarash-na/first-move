import { describe, expect, it } from "vitest"
import { applyPatch, createProject } from "@/lib/project"
import { aiProvenance, patchesBySource } from "./mark"

describe("aiProvenance", () => {
  it("builds the applyPatch option, with the file only when there is one", () => {
    expect(aiProvenance("assistant", "claude-sonnet-5-5", "study.pdf")).toEqual({ by: "assistant", model: "claude-sonnet-5-5", file: "study.pdf" })
    expect(aiProvenance("email", "anthropic/claude-haiku-5.5")).toEqual({ by: "email", model: "anthropic/claude-haiku-5.5" })
  })
})

describe("patchesBySource", () => {
  it("groups values by the documents they came from", () => {
    const parts = patchesBySource(
      [
        { key: "buildings.total", value: 120, files: ["a.pdf"] },
        { key: "buildings.areaM2", value: 120_000, files: ["a.pdf", "a.pdf"] },
        { key: "quickCheck.networkLengthM", value: 2_300, files: ["a.pdf", "b.xlsx"] },
        { key: "sources.pv", value: true, files: [] },
      ],
      "assistant",
      "claude-haiku-5-5",
    )
    expect(parts).toEqual([
      { patch: { "buildings.total": 120, "buildings.areaM2": 120_000 }, provenance: { by: "assistant", model: "claude-haiku-5-5", file: "a.pdf" } },
      { patch: { "quickCheck.networkLengthM": 2_300 }, provenance: { by: "assistant", model: "claude-haiku-5-5", file: "a.pdf, b.xlsx" } },
      { patch: { "sources.pv": true }, provenance: { by: "assistant", model: "claude-haiku-5-5" } },
    ])
  })

  it("marks each applied value with its own document", () => {
    let project = createProject({ modules: { quickCheck: true }, now: new Date("2026-10-24T10:00:00Z") })
    const now = new Date("2026-10-24T11:00:00Z")
    for (const { patch, provenance } of patchesBySource(
      [
        { key: "buildings.total", value: 120, files: ["a.pdf"] },
        { key: "sources.pv", value: true, files: ["b.docx"] },
      ],
      "email",
      "anthropic/claude-haiku-5.5",
    )) {
      project = applyPatch(project, patch, { provenance, now }).project
    }
    expect(project.provenance.ai["buildings.total"]).toMatchObject({ by: "email", file: "a.pdf" })
    expect(project.provenance.ai["sources.pv"]).toMatchObject({ by: "email", file: "b.docx" })
  })
})
