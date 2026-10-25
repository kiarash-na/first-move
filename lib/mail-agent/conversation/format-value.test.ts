// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { fieldName, formatFieldValue } from "./format-value"
import { loadTexts, type MailTexts } from "./texts"

let en: MailTexts
let de: MailTexts
beforeAll(async () => {
  en = await loadTexts("en")
  de = await loadTexts("de")
})

describe("formatFieldValue", () => {
  it("formats numbers with their unit in the email's language", () => {
    expect(formatFieldValue("buildings.total", 1200, en)).toBe("1,200")
    expect(formatFieldValue("buildings.areaM2", 35_000, en)).toBe("35,000\u00a0m² (3.5\u00a0ha)")
    expect(formatFieldValue("buildings.areaM2", 35_000, de)).toBe("35.000\u00a0m² (3,5\u00a0ha)")
    expect(formatFieldValue("quickCheck.networkLengthM", 1800, en)).toBe("1,800\u00a0m")
    expect(formatFieldValue("buildings.shares.residential.1961_1990", 60, en)).toBe("60%")
  })

  it("shows options, yes and no, lists and rows readably", () => {
    expect(formatFieldValue("sources.potentials.ground_water", "high", en)).toBe("High")
    expect(formatFieldValue("sources.pv", true, de)).toBe("Ja")
    expect(formatFieldValue("site.stakeholders", ["Households", "Hotel"], en)).toBe("Households; Hotel")
    expect(formatFieldValue("businessPlan.risks", [{ id: "r", title: "Low uptake", description: "", dealBreaker: true, validation: "" }], en)).toBe("Low uptake · Yes")
    expect(formatFieldValue("buildings.total", null, en)).toBe("not entered")
  })

  it("shortens long texts", () => {
    expect(formatFieldValue("businessPlan.opportunity.needs", "x ".repeat(400), en).length).toBeLessThanOrEqual(240)
  })
})

describe("fieldName", () => {
  it("names a field as the dashboard does", () => {
    expect(fieldName("buildings.shares.residential.1961_1990", en)).toBe("Share of buildings · Residential buildings · 1961-1990")
  })
})
