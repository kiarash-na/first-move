import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { ImportFailure } from "@/lib/storage"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { renderDashboard } from "../test-utils/render"
import { ImportFailureDialog } from "./import-failure-dialog"

const failure = (patch: Partial<ImportFailure>): ImportFailure => ({ ok: false, code: "not-json", params: {}, errors: [], moreErrors: 0, ...patch })

describe("ImportFailureDialog (D-14)", () => {
  it("stays closed without a failure", () => {
    renderDashboard(<ImportFailureDialog failure={null} onClose={vi.fn()} />, { store: fakeStore().store })
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it.each(["en", "de"] as const)("says why the file was rejected and closes (%s)", async (lang) => {
    const { shell } = testDictionaries(lang)
    const onClose = vi.fn()
    renderDashboard(<ImportFailureDialog failure={failure({})} onClose={onClose} />, { store: fakeStore().store, lang })
    const dialog = screen.getByRole("alertdialog", { name: shell.importFlow.failedTitle })
    expect(dialog).toHaveTextContent(shell.storage.import.error["not-json"])
    await userEvent.click(screen.getByRole("button", { name: shell.importFlow.close }))
    expect(onClose).toHaveBeenCalled()
  })

  it("lists the first bad fields as text, then how many more", () => {
    const { shell } = testDictionaries()
    const errors = [{ path: "site.areaM2", code: "required" as const, message: "required", text: null }]
    renderDashboard(<ImportFailureDialog failure={failure({ code: "invalid", errors, moreErrors: 3 })} onClose={vi.fn()} />, {
      store: fakeStore().store,
    })
    const items = screen.getAllByRole("listitem")
    expect(items[0]).toHaveTextContent(`site.areaM2: ${shell.validation.required}`)
    expect(items[1]).toHaveTextContent("and 3 more")
  })
})
