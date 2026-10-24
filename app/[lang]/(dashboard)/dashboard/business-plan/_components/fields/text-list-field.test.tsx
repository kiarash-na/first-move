import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { getField } from "@/lib/project"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { TextListField } from "./text-list-field"

afterEach(stopTabs)

const field = () => getField("site.stakeholders") as Extract<NonNullable<ReturnType<typeof getField>>, { kind: "textList" }>

describe("TextListField", () => {
  it("shows one blank entry for an empty list and creates the list on typing", async () => {
    const tab = await openProject()
    renderDashboard(<TextListField field={field()} />, { store: tab.store })
    expect(screen.getByText("Stakeholders")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Remove entry/ })).toBeNull()
    await userEvent.type(screen.getByLabelText("Stakeholders 1"), "Hotel")
    expect(tab.store.getState().active?.site.stakeholders).toEqual(["Hotel"])
  })

  it("adds and removes entries", async () => {
    const tab = await openProject()
    tab.store.patch({ "site.stakeholders": ["Hotel", "Households"] })
    renderDashboard(<TextListField field={field()} />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "Add entry" }))
    await userEvent.type(screen.getByLabelText("Stakeholders 3"), "School")
    expect(tab.store.getState().active?.site.stakeholders).toEqual(["Hotel", "Households", "School"])
    await userEvent.click(screen.getByRole("button", { name: "Remove entry 2" }))
    expect(tab.store.getState().active?.site.stakeholders).toEqual(["Hotel", "School"])
  })
})
