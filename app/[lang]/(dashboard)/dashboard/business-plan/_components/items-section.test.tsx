import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { ItemsSection } from "./items-section"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

describe("ItemsSection", () => {
  it.each([
    ["businessPlan.allocation", "Allocation of investment, risk and benefit", "Add stakeholder"],
    ["businessPlan.criticalAssumptions", "Critical assumptions", "Add critical assumption"],
    ["businessPlan.risks", "Risks", "Add risk"],
  ])("%s is a panel with the list's title and an add button", async (fieldId, title, add) => {
    const tab = await openProject()
    renderDashboard(<ItemsSection fieldId={fieldId} index={1} />, { store: tab.store })
    expect(screen.getByRole("region", { name: title })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: add }))
    expect(screen.getAllByRole("article")).toHaveLength(1)
  })

  it("renders nothing for a field that is not an item list", async () => {
    const tab = await openProject()
    const { container } = renderDashboard(<ItemsSection fieldId="site.name" />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })
})
