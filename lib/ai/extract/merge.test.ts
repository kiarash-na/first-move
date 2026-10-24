import { describe, expect, it } from "vitest"
import { fieldCatalogue } from "./field-catalogue"
import { mergeValues } from "./merge"
import { EN_TEXTS } from "./test-utils/texts"
import type { NormalizedValue } from "./to-patch"

const catalogue = fieldCatalogue({ modules: ["quickCheck", "businessPlan"] }, "en", EN_TEXTS)
const value = (id: string, v: NormalizedValue["value"], file: string, item?: number): NormalizedValue => ({
  id,
  field: catalogue.fields.find((field) => field.id === id)!,
  value: v,
  ...(item !== undefined && { item }),
  source: { quote: String(v), file },
})

describe("mergeValues", () => {
  it("joins equal values from several files, with every source", () => {
    const { values, conflicts } = mergeValues([[value("buildings.total", 120, "a.pdf")], [value("buildings.total", 120.0000000001, "b.xlsx")]])
    expect(conflicts).toEqual([])
    expect(values).toHaveLength(1)
    expect(values[0].sources.map((source) => source.file)).toEqual(["a.pdf", "b.xlsx"])
  })

  it("lists different values for one field as a conflict, never picks one", () => {
    const { values, conflicts } = mergeValues([[value("buildings.total", 120, "a.pdf")], [value("buildings.total", 140, "b.xlsx"), value("sources.pv", true, "b.xlsx")]])
    expect(values.map((entry) => entry.id)).toEqual(["sources.pv"])
    expect(conflicts).toEqual([
      {
        id: "buildings.total",
        label: "Total number of buildings",
        candidates: [
          { value: 120, sources: [{ quote: "120", file: "a.pdf" }] },
          { value: 140, sources: [{ quote: "140", file: "b.xlsx" }] },
        ],
      },
    ])
  })

  it("compares text without case or extra spaces", () => {
    expect(mergeValues([[value("site.name", "Old Town", "a")], [value("site.name", " old  town ", "b")]]).conflicts).toEqual([])
  })

  it("collects text list entries, each once", () => {
    const { values } = mergeValues([
      [value("site.stakeholders", "Hotel", "a"), value("site.stakeholders", "Municipality", "a")],
      [value("site.stakeholders", "hotel", "b")],
    ])
    expect(values.map((entry) => [entry.value, entry.sources.length])).toEqual([
      ["Hotel", 2],
      ["Municipality", 1],
    ])
  })

  it("keeps rows of item lists apart per output, and flags conflicting properties of one row", () => {
    const { values, conflicts } = mergeValues([
      [value("businessPlan.risks[].title", "Permit delay", "a", 1), value("businessPlan.risks[].title", "Late permit", "a", 1)],
      [value("businessPlan.risks[].title", "Low uptake", "b", 1)],
    ])
    expect(values.map((entry) => [entry.row, entry.value])).toEqual([["1:1", "Low uptake"]])
    expect(conflicts.map((conflict) => [conflict.row, conflict.candidates.length])).toEqual([["0:1", 2]])
  })
})
