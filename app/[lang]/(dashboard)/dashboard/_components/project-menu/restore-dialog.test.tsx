import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { RestoreDialog } from "./restore-dialog"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("RestoreDialog (D-11)", () => {
  it.each(["en", "de"] as const)("says when there are no versions yet (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { quickCheck: true } })
    renderDashboard(<RestoreDialog projectId={project.meta.id} onOpenChange={() => {}} />, { store: tab.store, lang })
    expect(await screen.findByText(testDictionaries(lang).shell.restore.empty)).toBeInTheDocument()
  })

  it("lists kept versions with their reason and restores one", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "First" })
    // An import that replaces the project keeps the replaced state as a "before-import" snapshot.
    const file = (await tab.store.exportProject())!
    const { parseImportText } = await import("@/lib/storage")
    const parsed = parseImportText(file.text.replace('"name": "First"', '"name": "Second"'))
    if (!parsed.ok) throw new Error("bad fixture")
    await tab.store.adoptImport(parsed, { onConflict: "replace" })
    expect(tab.store.getState().active?.meta.name).toBe("Second")

    const onOpenChange = vi.fn()
    const { shell } = testDictionaries()
    renderDashboard(<RestoreDialog projectId={project.meta.id} onOpenChange={onOpenChange} />, { store: tab.store })
    expect(await screen.findByText(new RegExp(shell.storage.snapshotReason["before-import"]))).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole("button", { name: shell.restore.action })[0])
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(tab.store.getState().active?.meta.name).toBe("First")
  })
})
