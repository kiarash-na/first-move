import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { getField } from "@/lib/project"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { RowCard } from "./row-card"

afterEach(stopTabs)

const items = (id: string) => getField(id) as Extract<NonNullable<ReturnType<typeof getField>>, { kind: "items" }>

describe("RowCard", () => {
  it("lays out the allocation row: stakeholder first, then investment, risk and benefit side by side", async () => {
    const tab = await openProject()
    tab.store.patch({
      "businessPlan.allocation": [{ id: "a1", stakeholder: "Municipality", investment: "Pipes", risk: "Few connect", benefit: "Local heat" }],
    })
    const row = tab.store.getState().active!.businessPlan.allocation[0]
    renderDashboard(
      <ol>
        <RowCard field={items("businessPlan.allocation")} index={0} row={row} onToggleFlag={vi.fn()} onRemove={vi.fn()} />
      </ol>,
      { store: tab.store },
    )
    expect(screen.getByRole("heading", { name: "Municipality" })).toBeInTheDocument()
    for (const label of ["Stakeholder", "Investment", "Risk", "Benefit"]) expect(screen.getByLabelText(label)).toBeInTheDocument()
    expect(screen.getByLabelText("Investment")).toHaveValue("Pipes")
    expect(screen.queryByRole("switch")).toBeNull()
  })

  it("falls back to a numbered name and reports flag and remove events", async () => {
    const tab = await openProject()
    tab.store.patch({ "businessPlan.risks": [{ id: "r1", title: "", description: "", dealBreaker: false, validation: "" }] })
    const row = tab.store.getState().active!.businessPlan.risks[0]
    const onToggleFlag = vi.fn()
    const onRemove = vi.fn()
    renderDashboard(
      <ol>
        <RowCard field={items("businessPlan.risks")} index={1} row={row} onToggleFlag={onToggleFlag} onRemove={onRemove} />
      </ol>,
      { store: tab.store },
    )
    expect(screen.getByRole("heading", { name: "Risk 2" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("switch", { name: "Potential deal-breaker" }))
    expect(onToggleFlag).toHaveBeenCalledWith("dealBreaker", true)
    await userEvent.click(screen.getByRole("button", { name: "Remove Risk 2" }))
    expect(onRemove).toHaveBeenCalled()
  })
})
