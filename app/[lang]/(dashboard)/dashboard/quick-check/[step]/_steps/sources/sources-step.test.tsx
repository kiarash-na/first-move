import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../../_components/test-utils/project-store"
import { SourcesStep } from "./sources-step"

const ui = quickCheck.ui.sources

describe("SourcesStep (QCT-IN-06/07)", () => {
  it("selects a source by its potential and shows the default capacity", async () => {
    const { store, current } = projectStore(emptyProject())
    const { container } = renderDashboard(<SourcesStep />, { store })
    expect(container.querySelectorAll("[data-slot=source-card]")).toHaveLength(6)
    expect(screen.getByText(ui.none)).toBeInTheDocument()
    expect(screen.getByText("0 of 6 selected")).toBeInTheDocument()

    const geothermal = container.querySelector("[data-source=geothermal]") as HTMLElement
    await userEvent.click(within(geothermal).getByRole("radio", { name: "Medium" }))
    expect(current().sources.potentials.geothermal).toBe("medium")
    expect(geothermal).toHaveTextContent("50 MWh/a")
    expect(geothermal).toHaveTextContent("COP 4.5")
    expect(screen.getByText("1 of 6 selected")).toBeInTheDocument()
    expect(screen.queryByText(ui.none)).not.toBeInTheDocument()
  })

  it("explains Unknown and the sources without cooling or heat pump (OQ-13)", async () => {
    const { store, current } = projectStore(emptyProject())
    const { container } = renderDashboard(<SourcesStep />, { store })
    const solar = container.querySelector("[data-source=solar_thermal]") as HTMLElement
    await userEvent.click(within(solar).getByRole("radio", { name: "High" }))
    expect(solar).toHaveTextContent(ui.noHeatPump)
    expect(solar).toHaveTextContent(ui.noCooling)
    const air = container.querySelector("[data-source=ambient_air]") as HTMLElement
    await userEvent.click(within(air).getByRole("radio", { name: "Unknown" }))
    expect(air).toHaveTextContent(ui.unknown)
    await userEvent.click(within(air).getByRole("button", { name: "Remove Ambient air" }))
    expect(current().sources.potentials.ambient_air).toBeNull()
  })

  it("keeps the heading outline: a (visually hidden) H2 for the group above the H3 source names", () => {
    const { store } = projectStore(emptyProject())
    renderDashboard(<SourcesStep />, { store })
    const group = screen.getByRole("heading", { level: 2 })
    expect(group).toHaveClass("sr-only")
    expect(group.textContent).not.toBe("")
    expect(screen.getByRole("region", { name: group.textContent ?? "" })).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6)
  })
})
