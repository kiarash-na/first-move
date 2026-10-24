import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../../_components/test-utils/project-store"
import { BuildingsStep } from "./buildings-step"

const ui = quickCheck.ui.buildings
const cell = (type: string, period: string) => screen.getByRole("textbox", { name: `${type}, ${period}` })

describe("BuildingsStep (QCT-IN-04, R-03, D-31)", () => {
  it("starts empty and walks the share sum through its states", async () => {
    const { store, current } = projectStore(emptyProject())
    const { container } = renderDashboard(<BuildingsStep />, { store })
    const sum = () => container.querySelector("[data-slot=share-sum]")!
    expect(screen.getAllByRole("textbox")).toHaveLength(25)
    expect(sum()).toHaveAttribute("data-state", "empty")
    expect(screen.getByRole("status")).toHaveTextContent(ui.state.empty)

    await userEvent.type(cell("Residential buildings", "1991-2010"), "50")
    expect(current().buildings.shares.residential["1991_2010"]).toBe(50)
    expect(sum()).toHaveAttribute("data-state", "under")
    expect(screen.getByRole("status")).toHaveTextContent("50% still to assign")

    await userEvent.type(cell("Residential buildings", "2011-today"), "25")
    await userEvent.type(cell("Category A", "2011-today"), "25")
    expect(sum()).toHaveAttribute("data-state", "exact")
    expect(screen.getByRole("status")).toHaveTextContent(ui.state.exact)

    await userEvent.type(cell("Industry", "-1919"), "10")
    expect(sum()).toHaveAttribute("data-state", "over")
    expect(screen.getByRole("status")).toHaveTextContent("10% too much")
  })

  it("labels Industry and the periods verbatim (OQ-03) and clears all shares", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<BuildingsStep />, { store })
    expect(screen.getAllByText(quickCheck.buildingTypes.industry.description).length).toBeGreaterThan(0)
    expect(cell("Industry", "-1919")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: ui.clear })).toBeDisabled()
    await userEvent.type(cell("Category C", "1919-1960"), "40")
    await userEvent.click(screen.getByRole("button", { name: ui.clear }))
    expect(current().buildings.shares.category_c["1919_1960"]).toBeNull()
    expect(cell("Category C", "1919-1960")).toHaveValue("")
  })

  it("rejects a share above 100 with the applyPatch message", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<BuildingsStep />, { store })
    await userEvent.type(cell("Category B", "1961-1990"), "120")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter 100 or less.")
    expect(current().buildings.shares.category_b["1961_1990"]).toBe(12)
  })
})
