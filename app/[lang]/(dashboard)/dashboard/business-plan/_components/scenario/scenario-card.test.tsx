import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { ScenarioCard } from "./scenario-card"

afterEach(stopTabs)

describe("ScenarioCard", () => {
  it("lists exactly the facts the scenario states and is chosen by its button", async () => {
    const tab = await openProject()
    const onChoose = vi.fn()
    renderDashboard(<ScenarioCard id="BM-SCN-02" selected={false} onChoose={onChoose} />, { store: tab.store })
    expect(screen.getByRole("heading", { name: "Scenario 02: Urban outskirts, no district heating planned" })).toBeInTheDocument()
    expect(screen.getByText("Secondary school, Kindergarten, Multi-family buildings")).toBeInTheDocument()
    expect(screen.getByText("Natural gas")).toBeInTheDocument()
    expect(screen.getByText("Approx. 80 units")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Use this scenario" }))
    expect(onChoose).toHaveBeenCalled()
  })

  it("marks the selected scenario and omits facts the scenario does not state", async () => {
    const tab = await openProject()
    renderDashboard(<ScenarioCard id="BM-SCN-01" selected onChoose={vi.fn()} />, { store: tab.store })
    expect(screen.getByText("Selected")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Use this scenario" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByText("Current energy supply")).toBeNull()
  })

  it("the custom use case prefills nothing", async () => {
    const tab = await openProject()
    renderDashboard(<ScenarioCard id="custom" selected={false} onChoose={vi.fn()} />, { store: tab.store })
    expect(screen.getByText("Prefills nothing. You describe the use case yourself.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Use my own" })).toBeInTheDocument()
  })
})
