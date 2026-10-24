import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { afterEach, describe, expect, it, vi } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { Toaster } from "@/components/ui/sonner"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { renderDashboard } from "../test-utils/render"
import { NoticeToasts } from "./notice-toasts"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))

afterEach(() => {
  toast.dismiss()
})

function setup(lang: "en" | "de" = "en") {
  const fake = fakeStore()
  renderDashboard(
    <>
      <NoticeToasts />
      <Toaster closeButton toastOptions={{ closeButtonAriaLabel: shell.notices.dismiss }} />
    </>,
    { store: fake.store, lang },
  )
  return fake
}

describe("NoticeToasts", () => {
  it.each(["en", "de"] as const)("shows the tab-sync notice as a toast (%s)", async (lang) => {
    const fake = setup(lang)
    act(() => fake.set({ notices: [{ id: 1, kind: "changed-elsewhere", projectId: "p", count: null }] }))
    expect(await screen.findByText(testDictionaries(lang).shell.storage.notice["changed-elsewhere"])).toBeInTheDocument()
  })

  it("fills the count and offers Export on the reminder", async () => {
    const fake = setup()
    act(() =>
      fake.set({
        notices: [
          { id: 1, kind: "recovered", projectId: null, count: 2 },
          { id: 2, kind: "export-reminder", projectId: "p", count: null },
        ],
      }),
    )
    expect(await screen.findByText("Projects restored from a backup copy: 2")).toBeInTheDocument()
    await userEvent.click(await screen.findByRole("button", { name: shell.notices.export }))
    await waitFor(() => expect(fake.spies.exportProject).toHaveBeenCalledWith("p"))
  })

  it("dismisses the notice when the toast closes", async () => {
    const fake = setup()
    act(() => fake.set({ notices: [{ id: 7, kind: "conflict", projectId: "p", count: null }] }))
    const message = await screen.findByText(shell.storage.notice.conflict)
    const close = message.closest("li")!.querySelector(`button[aria-label="${shell.notices.dismiss}"]`)
    expect(close).not.toBeNull()
    await userEvent.click(close!)
    await waitFor(() => expect(fake.spies.dismissNotice).toHaveBeenCalledWith(7))
  })
})
