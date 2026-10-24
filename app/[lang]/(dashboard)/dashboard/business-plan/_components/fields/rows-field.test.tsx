import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { getField } from "@/lib/project"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { RowsField } from "./rows-field"

afterEach(stopTabs)

const risks = () => getField("businessPlan.risks") as Extract<NonNullable<ReturnType<typeof getField>>, { kind: "items" }>

describe("RowsField", () => {
  it("adds a row with a fresh id and edits its properties by row path", async () => {
    const tab = await openProject()
    renderDashboard(<RowsField field={risks()} />, { store: tab.store })
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Add risk" }))
    const [row] = tab.store.getState().active!.businessPlan.risks
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/)
    await userEvent.type(screen.getByLabelText("Risk"), "Few owners connect")
    await userEvent.type(screen.getByLabelText("How to validate it"), "Ask them")
    expect(tab.store.getState().active?.businessPlan.risks[0]).toMatchObject({
      id: row.id,
      title: "Few owners connect",
      validation: "Ask them",
    })
  })

  it("keeps one potential deal-breaker: marking another row moves the flag", async () => {
    const tab = await openProject()
    renderDashboard(<RowsField field={risks()} />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "Add risk" }))
    await userEvent.click(screen.getByRole("button", { name: "Add risk" }))
    const switches = screen.getAllByRole("switch", { name: "Potential deal-breaker" })
    await userEvent.click(switches[0])
    expect(tab.store.getState().active?.businessPlan.risks.map((risk) => risk.dealBreaker)).toEqual([true, false])
    expect(screen.getByText("Marked as deal-breaker")).toBeInTheDocument()
    await userEvent.click(switches[1])
    expect(tab.store.getState().active?.businessPlan.risks.map((risk) => risk.dealBreaker)).toEqual([false, true])
  })

  it("removes an empty row at once", async () => {
    const tab = await openProject()
    renderDashboard(<RowsField field={risks()} />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "Add risk" }))
    await userEvent.click(screen.getByRole("button", { name: "Remove Risk 1" }))
    expect(tab.store.getState().active?.businessPlan.risks).toEqual([])
  })

  it("asks before it removes a row that holds text (D-02)", async () => {
    const tab = await openProject()
    renderDashboard(<RowsField field={risks()} />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "Add risk" }))
    await userEvent.type(screen.getByLabelText("Risk"), "Gas price drop")
    await userEvent.click(screen.getByRole("button", { name: "Remove Risk 1" }))
    const dialog = screen.getByRole("alertdialog")
    await userEvent.click(within(dialog).getByRole("button", { name: "Keep it" }))
    expect(tab.store.getState().active?.businessPlan.risks).toHaveLength(1)
    await userEvent.click(screen.getByRole("button", { name: "Remove Risk 1" }))
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Remove" }))
    expect(tab.store.getState().active?.businessPlan.risks).toEqual([])
  })

  it("can hide its own heading when a panel already has one", async () => {
    const tab = await openProject()
    renderDashboard(<RowsField field={risks()} headless />, { store: tab.store })
    expect(screen.queryByRole("heading", { level: 3 })).toBeNull()
  })

  it("puts the row titles one level below the panel's H2 when it has no heading of its own, else below its H3", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    const headless = renderDashboard(<RowsField field={risks()} headless />, { store: tab.store })
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBeGreaterThan(0)
    expect(screen.queryByRole("heading", { level: 4 })).toBeNull()
    headless.unmount()
    renderDashboard(<RowsField field={risks()} />, { store: tab.store })
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1)
    expect(screen.getAllByRole("heading", { level: 4 }).length).toBeGreaterThan(0)
  })
})
