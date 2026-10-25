// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { Proposal } from "@/lib/ai/extract/propose"
import { applyProposal } from "./apply"
import { projectWith } from "./test-utils/project"

const NOW = new Date(Date.UTC(2026, 9, 25, 10))
const MODEL = "anthropic/claude-haiku-test"

function proposal(entries: { key: string; value: unknown; file?: string }[]): Proposal {
  const valid = entries.map(({ key, value, file }) => ({ key, value, label: key, sources: [{ quote: "q", ...(file && { file }) }] }))
  return { patch: Object.fromEntries(entries.map(({ key, value }) => [key, value])), valid, invalid: [], incomplete: [], conflicts: [], unclear: [], notes: [] }
}

describe("applyProposal", () => {
  it("applies the values through applyPatch, marked as proposed by the email agent, per file", () => {
    const { project, values } = applyProposal(projectWith({}), proposal([{ key: "buildings.total", value: 42 }, { key: "buildings.areaM2", value: 35_000, file: "plan.pdf" }]), { model: MODEL, now: NOW })
    expect(project.buildings.total).toBe(42)
    expect(project.provenance.ai["buildings.total"]).toEqual({ at: NOW.toISOString(), by: "email", model: MODEL })
    expect(project.provenance.ai["buildings.areaM2"]).toEqual({ at: NOW.toISOString(), by: "email", model: MODEL, file: "plan.pdf" })
    expect(values.map((value) => value.key)).toEqual(["buildings.total", "buildings.areaM2"])
    expect(values[1].files).toEqual(["plan.pdf"])
  })

  it("replaces the whole building mix when the new shares add up to 100", () => {
    const before = projectWith({ "buildings.shares.residential.until_1919": 50, "buildings.shares.residential.1919_1960": 50 })
    const { project } = applyProposal(
      before,
      proposal([
        { key: "buildings.shares.residential.1961_1990", value: 70 },
        { key: "buildings.shares.category_a.1991_2010", value: 30 },
      ]),
      { model: MODEL, now: NOW },
    )
    expect(project.buildings.shares.residential.until_1919).toBeNull()
    expect(project.buildings.shares.residential["1961_1990"]).toBe(70)
  })

  it("changes only the corrected cell when the shares given are not the whole mix", () => {
    const before = projectWith({ "buildings.shares.residential.until_1919": 50, "buildings.shares.residential.1919_1960": 50 })
    const { project } = applyProposal(before, proposal([{ key: "buildings.shares.residential.until_1919", value: 40 }]), { model: MODEL, now: NOW })
    expect(project.buildings.shares.residential["1919_1960"]).toBe(50)
    expect(project.buildings.shares.residential.until_1919).toBe(40)
  })
})
