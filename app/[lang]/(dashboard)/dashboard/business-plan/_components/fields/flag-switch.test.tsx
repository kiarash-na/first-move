import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import businessPlan from "@/dictionaries/en/business-plan.json"
import { fakeStore } from "../../../_components/test-utils/fake-store"
import { renderDashboard } from "../../../_components/test-utils/render"
import { FlagSwitch } from "./flag-switch"

describe("FlagSwitch", () => {
  it("is a labelled switch with its hint that reports changes", async () => {
    const onChange = vi.fn()
    renderDashboard(<FlagSwitch label="Potential deal-breaker" on={false} onChange={onChange} />, { store: fakeStore().store })
    const toggle = screen.getByRole("switch", { name: "Potential deal-breaker" })
    expect(toggle).toHaveAccessibleDescription(businessPlan.ui.dealBreaker.hint)
    await userEvent.click(toggle)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("marks an on flag in orange", () => {
    renderDashboard(<FlagSwitch label="Potential deal-breaker" on onChange={vi.fn()} />, { store: fakeStore().store })
    expect(screen.getByText(businessPlan.ui.dealBreaker.marked).parentElement).toHaveClass("text-hot")
    expect(screen.getByRole("switch")).toBeChecked()
  })
})
