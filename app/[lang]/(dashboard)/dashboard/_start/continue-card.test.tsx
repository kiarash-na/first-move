import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testBrowser, testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { ContinueCard } from "./continue-card"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  push.mockClear()
})

describe("ContinueCard (D-03)", () => {
  it("shows a skeleton until the store is ready", () => {
    const tab = testTab()
    tabs.push(tab)
    renderDashboard(<ContinueCard />, { store: tab.store })
    expect(screen.getByLabelText(testDictionaries().shell.loading)).toHaveAttribute("aria-busy", "true")
  })

  it.each(["en", "de"] as const)("welcomes when there is nothing to continue (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    renderDashboard(<ContinueCard />, { store: tab.store, lang })
    expect(await screen.findByRole("heading", { name: testDictionaries(lang).start.continue.welcomeTitle })).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("reopens the last used project in a new tab at its overview", async () => {
    const browser = testBrowser()
    const first = testTab(browser)
    tabs.push(first)
    await first.store.start()
    const project = await first.store.create({ modules: { businessPlan: true }, name: "Spa quarter" })
    await first.store.create({ modules: { quickCheck: true }, name: "Other", open: false })
    first.store.stop()

    // A fresh tab (new session): nothing open in this tab yet, the last used project is remembered.
    const tab = testTab(browser)
    tabs.push(tab)
    await tab.store.start()
    renderDashboard(<ContinueCard />, { store: tab.store })
    expect(await screen.findByRole("heading", { name: "Spa quarter" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Continue" }))
    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/dashboard/overview"))
    expect(tab.store.getState().activeId).toBe(project.meta.id)
  })
})
