import { describe, expect, it } from "vitest"
import { EXAMPLE_IDS } from "@/lib/examples"
import { exampleCards } from "./example-cards"

describe("exampleCards", () => {
  it("lists the six examples in demo order with their engine verdicts (PLAN-DASH-06 table)", () => {
    const cards = exampleCards("en")
    expect(cards.map((card) => card.id)).toEqual(EXAMPLE_IDS)
    expect(cards.map((card) => [card.level, card.forced])).toEqual([
      ["not_promising", false],
      ["promising", false],
      ["further_analysis", false],
      ["further_analysis", true],
      ["promising", false],
      ["promising", false],
    ])
  })

  it("resolves the texts and keeps the facts a card shows", () => {
    const [first] = exampleCards("de")
    expect(first.name.length).toBeGreaterThan(0)
    expect(first.summary.length).toBeGreaterThan(0)
    expect(first.scenarioId).toBe("BM-SCN-01")
    expect(first.buildings).toBe(45)
    expect(first.areaM2).toBe(1_500_000)
  })

  it("is plain serializable data", () => {
    const cards = exampleCards("en")
    expect(JSON.parse(JSON.stringify(cards))).toEqual(cards)
  })
})
