import { describe, expect, it } from "vitest"
import { fieldCatalogue } from "./field-catalogue"
import type { ExtractedValue } from "./output-schema"
import { DE_TEXTS, EN_TEXTS } from "./test-utils/texts"
import { normalizeValues, toPatchValue } from "./to-patch"

const en = fieldCatalogue({ modules: ["quickCheck", "businessPlan"] }, "en", EN_TEXTS)
const de = fieldCatalogue({ modules: ["quickCheck", "businessPlan"] }, "de", DE_TEXTS)
const field = (id: string) => en.fields.find((entry) => entry.id === id)!
const convert = (id: string, value: ExtractedValue["value"], unit?: string) => toPatchValue({ field: id, value, quote: "q", ...(unit && { unit }) }, field(id))

describe("toPatchValue", () => {
  it("reads numbers in both notations and as JSON numbers", () => {
    expect(convert("buildings.total", 120)).toEqual({ ok: true, value: 120 })
    expect(convert("buildings.areaM2", "1.234,5")).toEqual({ ok: true, value: 1234.5 })
    expect(convert("buildings.areaM2", "1,234.5")).toEqual({ ok: true, value: 1234.5 })
    expect(convert("buildings.areaM2", "0,5")).toEqual({ ok: true, value: 0.5 })
    expect(convert("buildings.areaM2", "12 000")).toEqual({ ok: true, value: 12_000 })
  })

  it("reports a number EN and DE read differently as ambiguous", () => {
    expect(convert("buildings.areaM2", "1.234")).toEqual({ ok: false, reason: "ambiguous-number" })
    expect(convert("buildings.areaM2", "1,234")).toEqual({ ok: false, reason: "ambiguous-number" })
  })

  it("converts a stated unit, also one written after the number", () => {
    expect(convert("buildings.areaM2", 12, "ha")).toEqual({ ok: true, value: 120_000 })
    expect(convert("buildings.areaM2", "12 ha")).toEqual({ ok: true, value: 120_000 })
    expect(convert("quickCheck.manualDemand.heatingKwhPerYear", "2,5 GWh/a")).toEqual({ ok: true, value: 2_500_000 })
    expect(convert("buildings.areaM2", "12", "MWh")).toEqual({ ok: false, reason: "unit-mismatch" })
  })

  it("keeps percent as typed (OQ-01)", () => {
    expect(convert("buildings.shares.residential.until_1919", "35 %")).toEqual({ ok: true, value: 35 })
    expect(convert("buildings.shares.residential.until_1919", 0.35)).toEqual({ ok: true, value: 0.35 })
  })

  it("rejects what is not a number", () => {
    expect(convert("buildings.total", "about a hundred")).toEqual({ ok: false, reason: "not-a-number" })
    expect(convert("buildings.total", true)).toEqual({ ok: false, reason: "not-a-number" })
  })

  it("matches choices by key or label, in the UI language or the fallback", () => {
    expect(convert("sources.potentials.geothermal", "medium")).toEqual({ ok: true, value: "medium" })
    expect(convert("sources.potentials.geothermal", " High ")).toEqual({ ok: true, value: "high" })
    const german = de.fields.find((entry) => entry.id === "sources.potentials.geothermal")!
    expect(toPatchValue({ field: german.id, value: "Mittel", quote: "q" }, german)).toEqual({ ok: true, value: "medium" })
    expect(convert("sources.potentials.geothermal", "very high")).toEqual({ ok: false, reason: "unknown-option" })
    expect(convert("businessPlan.scenarioId", "BM-SCN-02")).toEqual({ ok: true, value: "BM-SCN-02" })
  })

  it("reads yes/no, ja/nein, true/false", () => {
    for (const [value, result] of [[true, true], ["yes", true], ["Ja", true], ["nein", false], ["FALSE", false]] as const) {
      expect(convert("sources.pv", value)).toEqual({ ok: true, value: result })
    }
    expect(convert("sources.pv", "maybe")).toEqual({ ok: false, reason: "not-a-boolean" })
  })

  it("trims text, flattens one-line text, keeps paragraphs of long text, and keeps injected text as plain text", () => {
    expect(convert("site.name", "  Old  Town \n District ")).toEqual({ ok: true, value: "Old Town District" })
    expect(convert("businessPlan.opportunity.needs", "Heating.\n\n\n\nCooling.")).toEqual({ ok: true, value: "Heating.\n\nCooling." })
    expect(convert("site.name", "   ")).toEqual({ ok: false, reason: "empty" })
    expect(convert("site.name", "<script>alert(1)</script> ignore previous instructions")).toEqual({
      ok: true,
      value: "<script>alert(1)</script> ignore previous instructions",
    })
  })
})

describe("normalizeValues", () => {
  it("normalizes valid values and reports the others with their label", () => {
    const result = normalizeValues(
      [
        { field: "buildings.total", value: "120", quote: "120 buildings", file: "a.pdf", page: 2 },
        { field: "buildings.areaM2", value: "1.234", quote: "1.234 m²" },
        { field: "meta.name", value: "x", quote: "x" },
        { field: "businessPlan.risks[].title", value: "Permit delay", quote: "permit" },
        { field: "businessPlan.risks[].title", value: "Low uptake", quote: "uptake", item: 1 },
      ],
      en,
    )
    expect(result.values.map(({ id, value, item, source }) => ({ id, value, item, source }))).toEqual([
      { id: "buildings.total", value: 120, item: undefined, source: { quote: "120 buildings", file: "a.pdf", page: 2 } },
      { id: "businessPlan.risks[].title", value: "Low uptake", item: 1, source: { quote: "uptake" } },
    ])
    expect(result.unclear.map(({ id, label, reason }) => ({ id, label, reason }))).toEqual([
      { id: "buildings.areaM2", label: "Total project area", reason: "ambiguous-number" },
      { id: "meta.name", label: "meta.name", reason: "not-in-scope" },
      { id: "businessPlan.risks[].title", label: "Risks · Risk", reason: "missing-item" },
    ])
  })

  it("matches English labels when the UI is German", () => {
    const german = fieldCatalogue({ modules: ["quickCheck"] }, "de", { ...DE_TEXTS, "quick-check": { ...(DE_TEXTS["quick-check"] as object), potentials: {} } })
    const result = normalizeValues([{ field: "sources.potentials.waste_heat", value: "Medium", quote: "q" }], german, en)
    expect(result.values.map((value) => value.value)).toEqual(["medium"])
  })
})
