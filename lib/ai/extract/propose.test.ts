import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project"
import { fieldCatalogue } from "./field-catalogue"
import { buildProposal } from "./propose"
import { EN_TEXTS } from "./test-utils/texts"

const project = createProject({ modules: { quickCheck: true, businessPlan: true }, now: new Date("2026-10-24T10:00:00Z") })
const catalogue = fieldCatalogue({ modules: ["quickCheck", "businessPlan"] }, "en", EN_TEXTS)

describe("buildProposal", () => {
  it("goes from two model outputs to a reviewed proposal", () => {
    let next = 0
    const proposal = buildProposal(
      [
        {
          file: "study.pdf",
          output: {
            values: [
              { field: "buildings.total", value: 120, quote: "120 buildings", page: 1 },
              { field: "buildings.areaM2", value: "12", unit: "ha", quote: "12 ha" },
              { field: "quickCheck.networkLengthM", value: 2_300, quote: "2.3 km of pipes" },
              { field: "businessPlan.risks[].title", value: "Permit delay", item: 1, quote: "permits may take a year" },
            ],
            unclear: [{ topic: "Cooling demand", reason: "Not stated" }],
          },
        },
        {
          file: "data.xlsx",
          output: {
            values: [
              { field: "buildings.total", value: 120, quote: "120" },
              { field: "quickCheck.networkLengthM", value: 2_500, quote: "2500" },
              { field: "sources.potentials.geothermal", value: "excellent", quote: "excellent geothermal" },
            ],
            unclear: [],
          },
        },
      ],
      project,
      catalogue,
      EN_TEXTS,
      { newId: () => `row-${++next}` },
    )
    expect(proposal.patch).toEqual({
      "buildings.total": 120,
      "buildings.areaM2": 120_000,
      "businessPlan.risks": [{ id: "row-1", title: "Permit delay", description: "", dealBreaker: false, validation: "" }],
    })
    expect(proposal.valid.find((entry) => entry.key === "buildings.total")?.sources).toEqual([
      { quote: "120 buildings", page: 1, file: "study.pdf" },
      { quote: "120", file: "data.xlsx" },
    ])
    expect(proposal.conflicts.map((conflict) => [conflict.id, conflict.candidates.map((candidate) => candidate.value)])).toEqual([["quickCheck.networkLengthM", [2_300, 2_500]]])
    expect(proposal.unclear.map((value) => [value.id, value.reason, value.source.file])).toEqual([["sources.potentials.geothermal", "unknown-option", "data.xlsx"]])
    expect(proposal.notes).toEqual([{ topic: "Cooling demand", reason: "Not stated" }])
    expect(proposal.invalid).toEqual([])
  })
})
