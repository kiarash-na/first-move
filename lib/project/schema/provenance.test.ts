// @vitest-environment node
import { describe, expect, it } from "vitest"
import { PROVENANCE_LIMITS, provenanceSchema } from "./provenance"

const mark = { at: "2026-10-24T08:00:00.000Z", by: "assistant", model: "claude-sonnet-5-5" }

describe("provenanceSchema (schema v2)", () => {
  it("accepts no marks, and marks on fields and row properties", () => {
    expect(provenanceSchema.safeParse({ ai: {} }).success).toBe(true)
    const marks = { "buildings.total": mark, "businessPlan.risks.0.title": { ...mark, by: "email", file: "survey.pdf" } }
    expect(provenanceSchema.parse({ ai: marks })).toEqual({ ai: marks })
  })

  it.each([
    ["a key that is not a field", { ai: { "buildings.density": mark } }],
    ["a system value", { ai: { "meta.id": mark } }],
    ["a row id", { ai: { "businessPlan.risks.0.id": mark } }],
    ["an unknown source", { ai: { "buildings.total": { ...mark, by: "someone" } } }],
    ["an empty model", { ai: { "buildings.total": { ...mark, model: "" } } }],
    ["a long model id", { ai: { "buildings.total": { ...mark, model: "m".repeat(PROVENANCE_LIMITS.model + 1) } } }],
    ["a long file name", { ai: { "buildings.total": { ...mark, file: "f".repeat(PROVENANCE_LIMITS.file + 1) } } }],
    ["a date that is not ISO", { ai: { "buildings.total": { ...mark, at: "yesterday" } } }],
    ["an extra property on a mark", { ai: { "buildings.total": { ...mark, note: "x" } } }],
    ["an extra section", { ai: {}, human: {} }],
  ])("rejects %s", (_, value) => {
    expect(provenanceSchema.safeParse(value).success).toBe(false)
  })

  it(`allows at most ${PROVENANCE_LIMITS.entries} marks`, () => {
    const many = (count: number) =>
      Object.fromEntries(Array.from({ length: count }, (_, index) => [`businessPlan.risks.${index}.title`, mark]))
    expect(provenanceSchema.safeParse({ ai: many(PROVENANCE_LIMITS.entries) }).success).toBe(true)
    expect(provenanceSchema.safeParse({ ai: many(PROVENANCE_LIMITS.entries + 1) }).success).toBe(false)
  })
})
