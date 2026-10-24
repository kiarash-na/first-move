import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { fieldsOf, groupsOf } from "@/lib/project"
import { renderDashboard } from "../../_components/test-utils/render"
import { GroupSection } from "./group-section"
import { openProject, stopTabs } from "./test-utils/open-project"

afterEach(stopTabs)

describe("GroupSection", () => {
  it("draws every field of a registry group under the group's title", async () => {
    const tab = await openProject()
    renderDashboard(<GroupSection groupId="site" index={2} />, { store: tab.store })
    expect(screen.getByRole("region", { name: "Site or district" })).toBeInTheDocument()
    for (const field of fieldsOf({ module: "businessPlan", group: "site" })) {
      expect(document.getElementById(`field-${field.id}`), field.id).not.toBeNull()
    }
  })

  it.each(groupsOf({ module: "businessPlan" }).map((group) => group.id))("renders the group %s", async (id) => {
    const tab = await openProject()
    renderDashboard(<GroupSection groupId={id} />, { store: tab.store })
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument()
  })

  it("renders nothing for an unknown group", async () => {
    const tab = await openProject()
    const { container } = renderDashboard(<GroupSection groupId="nope" />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })

  it("edits through the store", async () => {
    const tab = await openProject()
    renderDashboard(<GroupSection groupId="businessPlan.nextSteps" />, { store: tab.store })
    const field = screen.getByLabelText("Pilot opportunities")
    field.focus()
    await import("@testing-library/user-event").then(({ default: userEvent }) => userEvent.keyboard("A pilot street"))
    expect(tab.store.getState().active?.businessPlan.nextSteps.pilots).toBe("A pilot street")
  })
})
