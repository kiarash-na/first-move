import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { REASON_CODES } from "@/lib/quick-check"
import { driverText, joinList, reasonText } from "./result-text"

describe("result texts (QCT-KF-01, KF-05, KF-06)", () => {
  it("joins names per language", () => {
    expect(joinList(["a", "b", "c"], "en")).toBe("a, b and c")
    expect(joinList(["a", "b"], "de")).toBe("a und b")
  })

  it("names the unknown sources in the forced reason", () => {
    expect(reasonText({ code: "unknown_source", sources: ["geothermal", "waste_heat"] }, quickCheck, "en")).toBe(
      "The potential of geothermal and waste heat is unknown. It needs to be clarified before a reliable initial assessment can be made.",
    )
  })

  it("names the demands of a coverage reason", () => {
    expect(reasonText({ code: "coverage_below_promising", demands: ["heating", "cooling"] }, quickCheck, "en")).toBe(
      "The selected sources cover too little of the heating and cooling demand for a promising result.",
    )
    expect(reasonText({ code: "industry" }, quickCheck, "en")).toBe(quickCheck.results.reasons.industry.label)
  })

  it("has a text for every reason without leftover placeholders", () => {
    for (const code of REASON_CODES) {
      expect(reasonText({ code, demands: ["heating"], sources: ["ambient_air"] }, quickCheck, "en")).not.toMatch(/\{\w+\}/)
    }
  })

  it("labels drivers by effect", () => {
    expect(driverText({ id: "unknown_sources", effect: "limiting", classification: null, value: null, sources: ["geothermal"] }, quickCheck, "en")).toBe(
      "Unknown source potential: geothermal",
    )
    expect(driverText({ id: "economics", effect: "supporting", classification: "favorable", value: 1.2 }, quickCheck, "en")).toBe(
      quickCheck.results.drivers.economics.supporting.label,
    )
  })
})
