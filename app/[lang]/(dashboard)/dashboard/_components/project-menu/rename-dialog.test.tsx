import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { RenameDialog } from "./rename-dialog"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("RenameDialog", () => {
  it.each(["en", "de"] as const)("renames through meta.name and closes (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "Draft" })
    const onOpenChange = vi.fn()
    const { shell } = testDictionaries(lang)
    renderDashboard(<RenameDialog project={{ id: project.meta.id, name: "Draft" }} onOpenChange={onOpenChange} />, { store: tab.store, lang })
    const input = screen.getByLabelText(shell.rename.label)
    expect(input).toHaveValue("Draft")
    await userEvent.clear(input)
    await userEvent.type(input, "Harbour district")
    await userEvent.click(screen.getByRole("button", { name: shell.rename.save }))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(tab.store.getState().active?.meta.name).toBe("Harbour district")
  })
})
