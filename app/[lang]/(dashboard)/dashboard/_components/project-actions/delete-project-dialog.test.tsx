import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Toaster } from "@/components/ui/sonner"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { DeleteProjectDialog } from "./delete-project-dialog"

const tabs: TestTab[] = []
afterEach(async () => {
  toast.dismiss()
  // let sonner's removal timers fire before jsdom is torn down
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  })
  while (tabs.length) tabs.pop()!.store.stop()
})

function Harness({ project, onDeleted }: { project: { id: string; name: string }; onDeleted: () => void }) {
  const [target, setTarget] = useState<typeof project | null>(project)
  return <DeleteProjectDialog project={target} onOpenChange={(open) => !open && setTarget(null)} onDeleted={onDeleted} />
}

describe("DeleteProjectDialog (D-02)", () => {
  it.each(["en", "de"] as const)("confirms, deletes and offers undo (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "Old mill" })
    const onDeleted = vi.fn()
    const { shell } = testDictionaries(lang)
    renderDashboard(
      <>
        <Harness project={{ id: project.meta.id, name: "Old mill" }} onDeleted={onDeleted} />
        <Toaster />
      </>,
      { store: tab.store, lang },
    )
    expect(screen.getByRole("alertdialog", { name: "Delete “Old mill”?" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: shell.delete.confirm }))
    await waitFor(() => expect(tab.store.getState().projects).toHaveLength(0))
    expect(onDeleted).toHaveBeenCalledWith(expect.objectContaining({ projectId: project.meta.id }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    const [undo] = await screen.findAllByRole("button", { name: shell.delete.undo })
    await act(async () => {
      await userEvent.click(undo)
    })
    await waitFor(() => expect(tab.store.getState().projects).toHaveLength(1))
  })

  it("stays closed without a project", () => {
    renderDashboard(<DeleteProjectDialog project={null} onOpenChange={() => {}} />, { store: testTab().store })
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })
})
