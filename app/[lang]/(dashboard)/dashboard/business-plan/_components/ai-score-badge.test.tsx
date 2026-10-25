import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { renderDashboard } from "../../_components/test-utils/render"
import { AiScoreBadge } from "./ai-score-badge"
import { testAiScore } from "./test-utils/ai-score"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

async function scoredProject(overrides: Parameters<typeof testAiScore>[1] = {}) {
  const tab = await openProject()
  const project = tab.store.getState().active!
  expect(tab.store.setAiScore(project.meta.id, testAiScore(project, overrides))).toBe(true)
  return tab
}

describe("AiScoreBadge (D-73, D-74)", () => {
  it("invites a run when the project has no score, and links to the AI Plan Score", async () => {
    const tab = await openProject()
    renderDashboard(<AiScoreBadge />, { store: tab.store })
    const link = screen.getByRole("link", { name: /Get an AI Plan Score/ })
    expect(link).toHaveAttribute("href", "/en/dashboard/ai-score")
    expect(link).toHaveAttribute("data-state", "none")
    expect(link).not.toHaveAttribute("data-ai-generated")
    expect(screen.queryByText("AI-generated")).toBeNull()
  })

  it("shows the saved score rounded to 5, its band, its label and that it is AI-generated", async () => {
    const tab = await scoredProject()
    renderDashboard(<AiScoreBadge />, { store: tab.store })
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("data-state", "current")
    expect(link).toHaveAttribute("data-ai-generated", "true")
    expect(screen.getByText("60")).toBeInTheDocument()
    expect(screen.getByText("± 8")).toBeInTheDocument()
    expect(screen.getByText("Band of one standard deviation: plus or minus 8 points")).toHaveClass("sr-only")
    expect(screen.getByText("Promising")).toBeInTheDocument()
    expect(screen.getByText("AI-generated")).toBeInTheDocument()
    expect(link).toHaveTextContent("Scored on 25 Oct 2026")
  })

  it("is bolder than the completeness meter: a filled orange surface and a larger number", async () => {
    const tab = await scoredProject()
    renderDashboard(<AiScoreBadge />, { store: tab.store })
    expect(screen.getByRole("link").className).toMatch(/\bbg-hot\b/)
    expect(screen.getByText("60").className).toContain("text-5xl")
  })

  it("says how many scored parts changed once a field the score read is edited", async () => {
    const tab = await scoredProject()
    renderDashboard(<AiScoreBadge />, { store: tab.store })
    tab.store.patch({ "businessPlan.opportunity.painPoint": "Gas boilers at the end of their life." })
    expect(await screen.findByText("Outdated: 1 of 3 scored parts changed since the run")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveAttribute("data-state", "outdated")
  })

  it("speaks German, with the German label names", async () => {
    const tab = await scoredProject({ level: "solid", score: 78, sd: 3.2 })
    renderDashboard(<AiScoreBadge layout="wide" />, { store: tab.store, lang: "de" })
    const copy = testDictionaries("de")["business-plan"].aiScore
    expect(screen.getByRole("link")).toHaveAttribute("href", "/de/dashboard/ai-score")
    expect(screen.getByText("80")).toHaveClass("text-6xl")
    expect(screen.getByText(copy.levels.solid)).toBeInTheDocument()
    expect(screen.getByText(copy.aiGenerated)).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent("Bewertet am 25.10.2026")
  })

  it("renders nothing without an open project", async () => {
    const tab = await openProject()
    await tab.store.close()
    const { container } = renderDashboard(<AiScoreBadge />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })
})
