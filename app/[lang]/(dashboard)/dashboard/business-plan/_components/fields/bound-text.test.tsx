import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { BoundText } from "./bound-text"

afterEach(stopTabs)

describe("BoundText", () => {
  it("patches the store with the text exactly as typed (D-21)", async () => {
    const tab = await openProject()
    renderDashboard(<BoundText path="site.name" multiline={false} maxLength={120} label="Name of the site" help="Where?" />, { store: tab.store })
    const input = screen.getByLabelText("Name of the site")
    expect(screen.getByText("Where?")).toBeInTheDocument()
    await userEvent.type(input, "  Bad Gastein  ")
    expect(tab.store.getState().active?.site.name).toBe("  Bad Gastein  ")
    expect(input).toHaveValue("  Bad Gastein  ")
  })

  it("keeps line breaks in multi-line text and reads the stored value back", async () => {
    const tab = await openProject()
    tab.store.patch({ "businessPlan.opportunity.painPoint": "High gas bills" })
    renderDashboard(
      <BoundText path="businessPlan.opportunity.painPoint" multiline maxLength={5000} label="Pain point" />,
      { store: tab.store },
    )
    const area = screen.getByLabelText("Pain point")
    expect(area).toHaveValue("High gas bills")
    await userEvent.type(area, "{Enter}and old boilers")
    expect(tab.store.getState().active?.businessPlan.opportunity.painPoint).toBe("High gas bills\nand old boilers")
  })

  it("stops at the field's length limit", async () => {
    const tab = await openProject()
    renderDashboard(<BoundText path="site.units" multiline={false} maxLength={4} label="Units" />, { store: tab.store })
    await userEvent.type(screen.getByLabelText("Units"), "123456")
    expect(tab.store.getState().active?.site.units).toBe("1234")
  })

  it("shows the patch error in the UI language when the store rejects a value", async () => {
    const tab = await openProject()
    renderDashboard(<BoundText path="site.nope" multiline={false} maxLength={50} label="Broken" />, { store: tab.store })
    await userEvent.type(screen.getByLabelText("Broken"), "x")
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByLabelText("Broken")).toHaveAttribute("aria-invalid", "true")
  })
})
