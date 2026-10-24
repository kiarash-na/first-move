import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { ExportButton } from "./export-button"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
const download = vi.hoisted(() => vi.fn())
vi.mock("@/lib/storage", async (original) => ({ ...(await original<typeof import("@/lib/storage")>()), downloadFile: download }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ExportButton (D-13)", () => {
  it.each(["en", "de"] as const)("is disabled without a project (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    renderDashboard(<ExportButton />, { store: tab.store, lang })
    expect(screen.getByRole("button", { name: testDictionaries(lang).shell.topBar.export })).toBeDisabled()
  })

  it("downloads the open project", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true }, name: "Harbour" })
    renderDashboard(<ExportButton />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "Export" }))
    await waitFor(() => expect(download).toHaveBeenCalledTimes(1))
    expect(download.mock.calls[0][0].fileName).toMatch(/^harbour-\d{4}-\d\d-\d\d\.firstmove\.json$/)
  })
})
