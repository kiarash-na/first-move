import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReadinessMeter } from "./readiness-meter"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

describe("ReadinessMeter", () => {
  it("shows the score and links to the full panel in step 4", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessMeter />, { store: tab.store, lang: "de" })
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/de/dashboard/business-plan/implementation#readiness")
    expect(screen.getByText(/^0\s?%$/)).toBeInTheDocument()
    expect(screen.getByText("Nicht begonnen")).toBeInTheDocument()
  })

  it("reads 100% and pitch-ready for a filled example", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<ReadinessMeter />, { store: tab.store })
    expect(screen.getByText("100%")).toBeInTheDocument()
    expect(screen.getByText("Pitch-ready")).toBeInTheDocument()
  })

  it("moves with a patch", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessMeter />, { store: tab.store })
    tab.store.patch({
      "businessPlan.scalability.geographical": "x",
      "businessPlan.scalability.economic": "x",
      "businessPlan.scalability.organisational": "x",
    })
    expect(await screen.findByText("In progress")).toBeInTheDocument()
  })

  it("renders nothing without an open project", async () => {
    const tab = await openProject()
    await tab.store.close()
    const { container } = renderDashboard(<ReadinessMeter />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })
})
