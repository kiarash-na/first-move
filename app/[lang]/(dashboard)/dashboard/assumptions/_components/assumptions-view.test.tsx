import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { AssumptionsView } from "./assumptions-view"

const copy = assumptions.playground

describe("AssumptionsView (D-10)", () => {
  it("is read-only until playing; an override shows the badge, reset restores the defaults", async () => {
    const { store, current } = projectStore(exampleProject("school-kindergarten-flats"))
    renderDashboard(<AssumptionsView />, { store })
    expect(screen.queryAllByRole("textbox")).toHaveLength(0)
    expect(screen.getByText(copy.none)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: copy.reset })).toBeDisabled()

    await userEvent.click(screen.getByRole("switch", { name: copy.toggle }))
    const interest = screen.getByRole("textbox", { name: quickCheck.parameters.interest_rate.label })
    expect(interest).toHaveAttribute("placeholder", "3")
    await userEvent.type(interest, "5")
    expect(current().quickCheck.overrides.economic.interest_rate).toBe(5)
    expect(screen.getByText(quickCheck.ui.customParameters.label)).toBeInTheDocument()
    expect(screen.getByText("1 custom values in use")).toBeInTheDocument()

    await userEvent.type(screen.getByRole("textbox", { name: "TBL-4 Geothermal, COP" }), "1")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a value above 1.")

    await userEvent.click(screen.getByRole("button", { name: copy.reset }))
    const dialog = screen.getByRole("alertdialog", { name: copy.confirm.title })
    await userEvent.click(within(dialog).getByRole("button", { name: copy.confirm.action }))
    expect(current().quickCheck.overrides.economic.interest_rate).toBeNull()
    expect(screen.queryByText(quickCheck.ui.customParameters.label)).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryAllByRole("textbox")).toHaveLength(0))
  })

  it("asks before switching off with custom values in use", async () => {
    const { store, patch, current } = projectStore(exampleProject("school-kindergarten-flats"))
    patch({ "quickCheck.overrides.cooling.ambient_air.cop": 4 })
    renderDashboard(<AssumptionsView />, { store })
    const toggle = screen.getByRole("switch", { name: copy.toggle })
    expect(toggle).toHaveAttribute("aria-checked", "true")
    await userEvent.click(toggle)
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: copy.confirm.cancel }))
    expect(current().quickCheck.overrides.cooling.ambient_air.cop).toBe(4)
    expect(toggle).toHaveAttribute("aria-checked", "true")
  })

  it("shows the tables, the OQ answers and How we calculate", () => {
    const { store } = projectStore(exampleProject("school-kindergarten-flats"))
    const { container } = renderDashboard(<AssumptionsView />, { store })
    for (const section of Object.values(assumptions.sections)) expect(screen.getByRole("heading", { name: section })).toBeInTheDocument()
    expect(container.querySelectorAll("[data-slot=capacity-table]")).toHaveLength(2)
    expect(container.querySelector("[data-slot=economic-table]")).not.toBeNull()
    expect(container.querySelector("[data-slot=building-tables]")).not.toBeNull()
    expect(container.querySelector("[data-slot=how-we-calculate]")).not.toBeNull()
  })
})
