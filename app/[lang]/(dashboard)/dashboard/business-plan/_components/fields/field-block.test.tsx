import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { fieldsOf } from "@/lib/project"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { FieldBlock } from "./field-block"

afterEach(stopTabs)

describe("FieldBlock", () => {
  it("draws every Business Plan field of the registry by its kind (D-05)", async () => {
    const tab = await openProject()
    for (const field of fieldsOf({ module: "businessPlan" }).filter((entry) => entry.kind !== "choice")) {
      const { unmount } = renderDashboard(<FieldBlock field={field} />, { store: tab.store })
      expect(document.querySelector(`#field-${CSS.escape(field.id)}`), field.id).not.toBeNull()
      unmount()
    }
  })

  it("leaves the scenario choice to its picker", async () => {
    const tab = await openProject()
    const choice = fieldsOf({ module: "businessPlan" }).find((entry) => entry.kind === "choice")!
    const { container } = renderDashboard(<FieldBlock field={choice} />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })

  it("uses the registry label and help", async () => {
    const tab = await openProject()
    renderDashboard(<FieldBlock field={fieldsOf({ module: "businessPlan" }).find((entry) => entry.id === "businessPlan.opportunity.painPoint")!} />, {
      store: tab.store,
    })
    expect(screen.getByLabelText("Key pain point")).toHaveAccessibleDescription("What problem does the site have today?")
  })
})
