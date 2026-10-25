import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PROMISING_FROM, SOLID_FROM } from "@/lib/ai/plan-score/aggregate"
import { ScoreScale } from "./score-scale"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("ScoreScale", () => {
  it("marks the zones at the engine's thresholds, the band and the score as shown", () => {
    const { container } = renderResults(<ScoreScale score={57.3} sd={6.2} level="promising" />)
    const zones = [...container.querySelectorAll<HTMLElement>("[data-zone]")]
    expect(zones.map((zone) => [zone.dataset.zone, zone.style.left, zone.style.width])).toEqual([
      ["early", "0%", `${PROMISING_FROM}%`],
      ["promising", `${PROMISING_FROM}%`, `${SOLID_FROM - PROMISING_FROM}%`],
      ["solid", `${SOLID_FROM}%`, `${100 - SOLID_FROM}%`],
    ])
    const band = container.querySelector<HTMLElement>("[data-band]")!
    expect(parseFloat(band.style.left)).toBeCloseTo(55 - 6, 6)
    expect(parseFloat(band.style.width)).toBeCloseTo(2 * 6, 6)
    expect(container.querySelector<HTMLElement>("[data-marker]")!.style.left).toBe("55%")
  })

  it("keeps the mark in the zone of the label: 68 shows as 70, Solid (D-81)", () => {
    const { container } = renderResults(<ScoreScale score={68} sd={2} level="solid" />)
    expect(parseFloat(container.querySelector<HTMLElement>("[data-marker]")!.style.left)).toBeGreaterThanOrEqual(SOLID_FROM)
  })

  it("keeps the band inside the scale", () => {
    const { container } = renderResults(<ScoreScale score={3} sd={8} level="early" />)
    const band = container.querySelector<HTMLElement>("[data-band]")!
    expect(band.style.left).toBe("0%")
    expect(parseFloat(band.style.width)).toBeCloseTo(5 + 8, 6)
  })

  it.each(["en", "de"] as const)("names the zones and highlights the current label (%s)", (lang) => {
    const copy = aiScoreCopy(lang)
    renderResults(<ScoreScale score={75} sd={3} level="solid" />, { lang })
    expect(screen.getByText(copy.results.summary.scale.label)).toBeInTheDocument()
    expect(screen.getByText(copy.labels.scoreLevels.solid.name)).toHaveAttribute("data-current", "true")
    expect(screen.getByText(copy.labels.scoreLevels.early.name)).not.toHaveAttribute("data-current")
  })
})
