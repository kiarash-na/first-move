import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { GATE_FAIL, GATE_PASS } from "@/lib/ai/plan-score/gates"
import { PassMeter } from "./pass-meter"
import { renderResults } from "./test-utils/render"

describe("PassMeter", () => {
  it("shows the pass probability against the engine's thresholds", () => {
    const { container } = renderResults(<PassMeter probability={0.85} />)
    expect(screen.getByText("Pass probability 85%")).toBeInTheDocument()
    expect(screen.getByText(`Probability that it passes: 85%. Passes from ${GATE_PASS * 100}%, fails up to ${GATE_FAIL * 100}%.`)).toBeInTheDocument()
    // BulletBar: 300 units wide, measure at 0.85, target at the pass threshold.
    expect(Number(container.querySelector("[data-measure]")!.getAttribute("width"))).toBeCloseTo(0.85 * 300, 6)
    expect(Number(container.querySelector("[data-target]")!.getAttribute("x1"))).toBeCloseTo(GATE_PASS * 300, 6)
    expect(container.querySelector("[data-measure]")).toHaveAttribute("fill", "var(--chart-2)")
  })

  it("formats the probability in German", () => {
    renderResults(<PassMeter probability={0.1} />, { lang: "de" })
    expect(screen.getByText(/10\s%/, { selector: "[aria-hidden=true]" })).toBeInTheDocument()
  })
})
