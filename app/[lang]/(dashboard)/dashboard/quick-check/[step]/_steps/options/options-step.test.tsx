import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, exampleProject, projectStore } from "../../../../_components/test-utils/project-store"
import { OptionsStep } from "./options-step"

const fields = quickCheck.fields

describe("OptionsStep (QCT-IN-05, 08, 09)", () => {
  it("shows the estimates a known value replaces and patches the overrides", async () => {
    const { store, current } = projectStore(exampleProject("school-kindergarten-flats"))
    renderDashboard(<OptionsStep />, { store })
    const length = screen.getByRole("textbox", { name: fields.quickCheck.networkLengthM.label })
    expect(length).toHaveAccessibleDescription(expect.stringMatching(/Estimate: [\d,]+\sm/))
    await userEvent.type(length, "1.200,5")
    expect(current().quickCheck.networkLengthM).toBe(1200.5)
    await userEvent.type(screen.getByRole("textbox", { name: fields.quickCheck.manualDemand.heatingKwhPerYear.label }), "250000")
    expect(current().quickCheck.manualDemand.heatingKwhPerYear).toBe(250000)
    await userEvent.click(screen.getByRole("switch", { name: fields.sources.pv.label }))
    expect(current().sources.pv).toBe(true)
  })

  it("says that an empty field uses the estimate when there is no result yet", () => {
    const { store } = projectStore(emptyProject())
    renderDashboard(<OptionsStep />, { store })
    expect(screen.getAllByText(quickCheck.ui.field.estimated)).toHaveLength(3)
  })

  it("rejects a negative demand", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<OptionsStep />, { store })
    await userEvent.type(screen.getByRole("textbox", { name: fields.quickCheck.manualDemand.coolingKwhPerYear.label }), "-5")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter 0 or more.")
    expect(current().quickCheck.manualDemand.coolingKwhPerYear).toBeNull()
  })
})
