import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { AiScoreHow } from "./ai-score-how"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

describe("AiScoreHow (D-33)", () => {
  it("is collapsed by default and explains the score with a link to the docs", async () => {
    const tab = await openProject()
    renderDashboard(<AiScoreHow />, { store: tab.store })
    const toggle = screen.getByRole("button", { name: /How the AI Plan Score is made/ })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(screen.getByText(/five evidence levels/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /The full method in the docs/ })).toHaveAttribute("href", "/en/docs/ai-plan-score")
  })

  it("links to the German docs page in German", async () => {
    const tab = await openProject()
    renderDashboard(<AiScoreHow />, { store: tab.store, lang: "de" })
    await userEvent.click(screen.getByRole("button", { name: /So entsteht der KI-Plan-Score/ }))
    expect(screen.getByRole("link", { name: /Die ganze Methode/ })).toHaveAttribute("href", "/de/docs/ai-plan-score")
  })
})
