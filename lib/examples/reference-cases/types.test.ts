// @vitest-environment node
import { describe, expect, it } from "vitest"
import { FICTIONAL_DISCLAIMER, REFERENCE_KINDS, REFERENCE_TIERS, withFictionalDisclaimer } from "./types"

describe("reference case types (D-76)", () => {
  it("knows two kinds and three designed tiers", () => {
    expect(REFERENCE_KINDS).toEqual(["real", "fictional"])
    expect(REFERENCE_TIERS).toEqual(["weak", "middling", "strong"])
  })

  it("states plainly in both languages that a fictional plan is neither planned nor endorsed", () => {
    expect(FICTIONAL_DISCLAIMER.en).toMatch(/^Fictional .*neither the owner nor the operator has planned or endorsed it\.$/)
    expect(FICTIONAL_DISCLAIMER.de).toMatch(/^Fiktiver .*Weder Eigentümer noch Betreiber haben ihn geplant oder befürwortet\.$/)
  })

  it("puts the disclaimer first in a fictional case's text", () => {
    expect(withFictionalDisclaimer("Owner text.", "Text der Eigentümer.")).toEqual({
      en: `${FICTIONAL_DISCLAIMER.en} Owner text.`,
      de: `${FICTIONAL_DISCLAIMER.de} Text der Eigentümer.`,
    })
  })
})
