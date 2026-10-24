import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../_components/test-utils/project-store"
import { ResetDialog } from "./reset-dialog"

describe("ResetDialog", () => {
  it("warns before the reset and confirms it", async () => {
    const onConfirm = vi.fn()
    renderDashboard(<ResetDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />, { store: projectStore(emptyProject()).store })
    expect(screen.getByRole("alertdialog", { name: assumptions.playground.confirm.title })).toHaveTextContent(assumptions.playground.confirm.body)
    await userEvent.click(screen.getByRole("button", { name: assumptions.playground.confirm.action }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
