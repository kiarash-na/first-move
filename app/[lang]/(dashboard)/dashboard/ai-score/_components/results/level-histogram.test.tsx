import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectedLevel } from "@/lib/ai/plan-score/distribution"
import { LevelHistogram } from "./level-histogram"
import { renderResults } from "./test-utils/render"

describe("LevelHistogram", () => {
  it("draws one bar per level at its probability and marks the expected level", () => {
    const probabilities = [0, 0.1, 0.2, 0.5, 0.2]
    const expected = expectedLevel(probabilities)
    const { container } = renderResults(<LevelHistogram probabilities={probabilities} expected={expected} />)
    const bars = [...container.querySelectorAll<HTMLElement>("[data-level]")]
    expect(bars.map((bar) => parseFloat(bar.style.height))).toEqual([0, 10, 20, 50, 20])
    // E = 2.8: the centre of slot 2.8 of 5 is at (2.8 + 0.5) / 5 = 66 %.
    expect(parseFloat(container.querySelector<HTMLElement>("[data-expected]")!.style.left)).toBeCloseTo(66, 6)
  })

  it("reads out every probability with the level names", () => {
    renderResults(<LevelHistogram probabilities={[1, 0, 0, 0, 0]} expected={0} />)
    expect(screen.getByRole("img")).toHaveAccessibleName("Probability per level: Missing 100%, Vague 0%, Specific 0%, Quantified 0%, Evidenced 0%")
  })

  it("leaves the line out without an expected level", () => {
    const { container } = renderResults(<LevelHistogram probabilities={[0.2, 0.2, 0.2, 0.2, 0.2]} expected={null} />)
    expect(container.querySelector("[data-expected]")).toBeNull()
  })
})
