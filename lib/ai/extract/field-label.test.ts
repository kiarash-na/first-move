import { describe, expect, it } from "vitest"
import { getField, type ChoiceField } from "@/lib/project"
import { fieldLabel, optionLabel, textOf } from "./field-label"
import { EN_TEXTS } from "./test-utils/texts"

const label = (id: string) => fieldLabel(getField(id)!, EN_TEXTS)

describe("fieldLabel", () => {
  it("uses a field's own label", () => {
    expect(label("buildings.total")).toBe("Total number of buildings")
  })

  it("names a grid cell by group, row and column", () => {
    expect(label("buildings.shares.residential.until_1919")).toBe("Share of buildings · Residential buildings · -1919")
    expect(label("quickCheck.overrides.heating.geothermal.low")).toBe("Heating capacity per source (Table 4) · Geothermal · Low")
  })

  it("names a list entry with its own text by group and its label", () => {
    expect(label("sources.potentials.geothermal")).toBe("Energy sources · Geothermal")
    expect(label("quickCheck.overrides.economic.interest_rate")).toBe("Economic parameters (Table 6) · Interest rate")
    expect(label("quickCheck.manualDemand.heatingKwhPerYear")).toBe("Known heating and cooling demand · Total heating demand")
  })

  it("falls back to the id when the texts are missing", () => {
    expect(fieldLabel(getField("buildings.total")!, {})).toBe("buildings.total")
  })
})

describe("optionLabel and textOf", () => {
  it("reads option labels and help texts", () => {
    expect(optionLabel(getField("sources.potentials.geothermal") as ChoiceField, "medium", EN_TEXTS)).toBe("Medium")
    expect(textOf(EN_TEXTS, getField("buildings.total")!.text, "help")).toContain("including industrial buildings")
  })
})
