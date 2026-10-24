import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { RemoveRowDialog } from "./remove-row-dialog"

afterEach(stopTabs)

describe("RemoveRowDialog", () => {
  it("confirms or cancels", async () => {
    const tab = await openProject()
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    renderDashboard(<RemoveRowDialog open onCancel={onCancel} onConfirm={onConfirm} />, { store: tab.store })
    expect(screen.getByRole("alertdialog", { name: "Remove this entry?" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }))
    expect(onCancel).toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it("is hidden while closed", async () => {
    const tab = await openProject()
    renderDashboard(<RemoveRowDialog open={false} onCancel={vi.fn()} onConfirm={vi.fn()} />, { store: tab.store })
    expect(screen.queryByRole("alertdialog")).toBeNull()
  })
})
