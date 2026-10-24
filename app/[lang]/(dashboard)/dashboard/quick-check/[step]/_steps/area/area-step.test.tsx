import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../../_components/test-utils/project-store"
import { AreaStep } from "./area-step"

const fields = quickCheck.fields.buildings

describe("AreaStep (QCT-IN-01..03)", () => {
  it("patches both inputs and derives the density category read-only (OQ-04)", async () => {
    const { store, current } = projectStore(emptyProject())
    const { container } = renderDashboard(<AreaStep />, { store })
    expect(screen.getByText(quickCheck.ui.area.pending)).toBeInTheDocument()
    await userEvent.type(screen.getByRole("textbox", { name: fields.total.label }), "8")
    await userEvent.type(screen.getByRole("textbox", { name: fields.areaM2.label }), "7200")
    expect(current().buildings).toMatchObject({ total: 8, areaM2: 7200 })
    expect(screen.getByText("11.1")).toBeInTheDocument()
    expect(container.querySelector("[data-category]")).toHaveTextContent(quickCheck.derived.densityCategory.options.sub_urban.label)
    expect(screen.getByText("= 0.72 ha")).toBeInTheDocument()
    expect(screen.queryAllByRole("textbox")).toHaveLength(2)
  })

  it("validates through applyPatch: whole buildings, area above 0", async () => {
    const { store, current } = projectStore(emptyProject())
    renderDashboard(<AreaStep />, { store })
    await userEvent.type(screen.getByRole("textbox", { name: fields.total.label }), "0")
    expect(screen.getByRole("alert")).toHaveTextContent("Enter 1 or more.")
    await userEvent.type(screen.getByRole("textbox", { name: fields.areaM2.label }), "0")
    expect(screen.getAllByRole("alert")[1]).toHaveTextContent(shell.validation.above.replace("{min}", "0"))
    expect(current().buildings).toMatchObject({ total: null, areaM2: null })
  })
})
