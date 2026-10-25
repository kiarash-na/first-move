import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { concentration } from "@/lib/ai/plan-score/distribution"
import { ConfidenceMeter } from "./confidence-meter"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("ConfidenceMeter", () => {
  it("shows the engine's concentration as a percentage", () => {
    const probabilities = [0, 0.1, 0.2, 0.5, 0.2]
    const { container } = renderResults(<ConfidenceMeter probabilities={probabilities} />)
    const value = concentration(probabilities)
    expect(screen.getByText(`${Math.round(value * 100)}% sure`)).toBeInTheDocument()
    expect(container.querySelector("[data-slot=confidence-meter]")).toHaveAttribute("title", aiScoreCopy("en").results.parts.confidenceHelp)
  })

  it("is full when one level holds everything and empty when all are equal", () => {
    const { unmount } = renderResults(<ConfidenceMeter probabilities={[0, 0, 1, 0, 0]} />)
    expect(screen.getByText("100% sure")).toBeInTheDocument()
    unmount()
    renderResults(<ConfidenceMeter probabilities={[0.2, 0.2, 0.2, 0.2, 0.2]} />, { lang: "de" })
    expect(screen.getByText(/0\s%/)).toBeInTheDocument()
  })
})
