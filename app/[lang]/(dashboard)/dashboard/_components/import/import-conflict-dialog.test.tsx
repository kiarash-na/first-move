import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { renderDashboard } from "../test-utils/render"
import { ImportConflictDialog } from "./import-conflict-dialog"

const render = (name: string | null, onChoose = vi.fn(), lang: "en" | "de" = "en") => {
  renderDashboard(<ImportConflictDialog name={name} onChoose={onChoose} />, { store: fakeStore().store, lang })
  return onChoose
}

describe("ImportConflictDialog (PLAN-DASH-04)", () => {
  it("stays closed without a conflict", () => {
    render(null)
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it.each(["en", "de"] as const)("names the stored project and offers keep both, replace and cancel (%s)", async (lang) => {
    const copy = testDictionaries(lang).shell.importFlow
    const onChoose = render("Harbour district", vi.fn(), lang)
    expect(screen.getByRole("alertdialog", { name: copy.conflictTitle })).toHaveTextContent("Harbour district")
    await userEvent.click(screen.getByRole("button", { name: copy.copy }))
    expect(onChoose).toHaveBeenCalledWith("copy")
  })

  it("replaces the stored version", async () => {
    const copy = testDictionaries().shell.importFlow
    const replace = render("Harbour district")
    await userEvent.click(screen.getByRole("button", { name: copy.replace }))
    expect(replace).toHaveBeenCalledWith("replace")
  })

  it("cancels with null and names an untitled project by the placeholder", async () => {
    const { shell } = testDictionaries()
    const onChoose = render("")
    expect(screen.getByRole("alertdialog")).toHaveTextContent(shell.fields.meta.name.placeholder)
    await userEvent.click(screen.getByRole("button", { name: shell.importFlow.cancel }))
    expect(onChoose).toHaveBeenCalledWith(null)
  })
})
