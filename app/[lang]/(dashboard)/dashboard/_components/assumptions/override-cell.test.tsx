import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project"
import { renderDashboard } from "../test-utils/render"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { OverrideCell } from "./override-cell"

const props = { label: "Interest rate", dash: "No default value", defaultValue: 3 }

describe("OverrideCell (D-10)", () => {
  it("shows the default when not playing and a dash without field", () => {
    const { store } = projectStore(emptyProject())
    const { unmount } = renderDashboard(<OverrideCell {...props} fieldId="quickCheck.overrides.economic.interest_rate" playing={false} />, { store })
    expect(screen.getByText("3")).toBeInTheDocument()
    unmount()
    renderDashboard(<OverrideCell {...props} fieldId={null} defaultValue={null} playing />, { store })
    expect(screen.getByText("No default value")).toHaveClass("sr-only")
  })

  it("shows a stored custom value when not playing, marked and named as yours (the report)", () => {
    const { store } = projectStore(applyPatch(emptyProject(), { "quickCheck.overrides.economic.interest_rate": 9.75 }).project)
    const { container } = renderDashboard(<OverrideCell {...props} fieldId="quickCheck.overrides.economic.interest_rate" playing={false} />, { store })
    const cell = container.querySelector("[data-custom]")
    expect(cell).toHaveClass("border-hot")
    expect(cell?.textContent).toBe("9.75 (Your value)")
    expect(screen.queryByText("3")).not.toBeInTheDocument()
  })

  it("marks a custom value while playing", async () => {
    const { store, current } = projectStore(emptyProject())
    const { container } = renderDashboard(<OverrideCell {...props} fieldId="quickCheck.overrides.economic.interest_rate" playing />, { store })
    await userEvent.type(screen.getByRole("textbox", { name: "Interest rate" }), "4,5")
    expect(current().quickCheck.overrides.economic.interest_rate).toBe(4.5)
    expect(container.querySelector("[data-custom]")).toHaveClass("border-hot")
  })
})
