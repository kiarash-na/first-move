import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../_components/test-utils/project-store"
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

  it("marks a custom value while playing", async () => {
    const { store, current } = projectStore(emptyProject())
    const { container } = renderDashboard(<OverrideCell {...props} fieldId="quickCheck.overrides.economic.interest_rate" playing />, { store })
    await userEvent.type(screen.getByRole("textbox", { name: "Interest rate" }), "4,5")
    expect(current().quickCheck.overrides.economic.interest_rate).toBe(4.5)
    expect(container.querySelector("[data-custom]")).toHaveClass("border-hot")
  })
})
