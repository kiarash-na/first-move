import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../../_components/test-utils/project-store"
import { ClearSharesDialog } from "./clear-shares-dialog"

const copy = quickCheck.ui.buildings.confirmClear

describe("ClearSharesDialog (D-02)", () => {
  it("confirms or cancels", async () => {
    const { store } = projectStore(emptyProject())
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    renderDashboard(<ClearSharesDialog open onCancel={onCancel} onConfirm={onConfirm} />, { store })
    expect(screen.getByRole("alertdialog", { name: copy.title })).toHaveTextContent(copy.body)
    await userEvent.click(screen.getByRole("button", { name: copy.cancel }))
    expect(onCancel).toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: copy.clear }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it("is hidden while closed", () => {
    const { store } = projectStore(emptyProject())
    renderDashboard(<ClearSharesDialog open={false} onCancel={vi.fn()} onConfirm={vi.fn()} />, { store })
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })
})
