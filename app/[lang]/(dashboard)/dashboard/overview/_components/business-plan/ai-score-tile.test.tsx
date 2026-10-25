import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project"
import { withAiScore } from "../../../business-plan/_components/test-utils/ai-score"
import { exampleWith, renderOverview } from "../test-utils/overview-render"
import { AiScoreTile } from "./ai-score-tile"

describe("AiScoreTile (D-73, D-74)", () => {
  it("invites a run when there is no score yet", () => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<AiScoreTile project={project} />, project)
    const tile = screen.getByRole("article", { name: "AI Plan Score" })
    expect(tile).toHaveAttribute("data-state", "none")
    expect(tile).not.toHaveAttribute("data-ai-generated")
    expect(within(tile).getByRole("link", { name: /Get an AI Plan Score/ })).toHaveAttribute("href", "/en/dashboard/ai-score")
    expect(tile).toHaveTextContent("not a calculation and not a feasibility verdict")
  })

  it("shows the saved score, band and label on a filled orange strip, marked AI-generated", () => {
    const project = withAiScore(exampleWith("housing-cooperatives"))
    renderOverview(<AiScoreTile project={project} />, project)
    const tile = screen.getByRole("article", { name: /AI Plan Score/ })
    expect(tile.className).toMatch(/\bbg-hot\b/)
    expect(tile).toHaveAttribute("data-ai-generated", "true")
    expect(within(tile).getByText("60")).toBeInTheDocument()
    expect(within(tile).getByText("± 8")).toBeInTheDocument()
    expect(within(tile).getByText("Promising")).toBeInTheDocument()
    expect(within(tile).getByText("AI-generated")).toBeInTheDocument()
    expect(tile).toHaveTextContent("Scored on 25 Oct 2026")
  })

  it("marks the score outdated once a scored field changed", () => {
    const scored = withAiScore(exampleWith("housing-cooperatives"))
    const project = applyPatch(scored, { "businessPlan.opportunity.needs": "Heating 1.2 GWh a year, cooling 0.3 GWh." }).project
    renderOverview(<AiScoreTile project={project} />, project)
    expect(screen.getByRole("article", { name: /AI Plan Score/ })).toHaveAttribute("data-state", "outdated")
    expect(screen.getByText("Outdated: 1 of 3 scored parts changed since the run")).toBeInTheDocument()
  })

  it("speaks German", () => {
    const project = withAiScore(exampleWith("housing-cooperatives"), { level: "early", score: 31, sd: 0.4 })
    renderOverview(<AiScoreTile project={project} />, project, "de")
    const tile = screen.getByRole("article", { name: /KI-Plan-Score/ })
    expect(within(tile).getByText("30")).toBeInTheDocument()
    expect(within(tile).getByText("± 1")).toBeInTheDocument()
    expect(within(tile).getByText("Früh")).toBeInTheDocument()
    expect(within(tile).getByText("KI-generiert")).toBeInTheDocument()
    expect(within(tile).getByRole("link")).toHaveAttribute("href", "/de/dashboard/ai-score")
  })
})
