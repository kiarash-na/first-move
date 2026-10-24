import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { Sidebar } from "./sidebar"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard/business-plan/opportunity" }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

async function storeWith(modules?: { quickCheck?: boolean; businessPlan?: boolean }) {
  const tab = testTab()
  tabs.push(tab)
  await tab.store.start()
  if (modules) await tab.store.create({ modules, name: "Harbour district" })
  return tab.store
}

describe("Sidebar (D-07)", () => {
  it("shows a skeleton for the project until the store is ready", () => {
    const tab = testTab()
    tabs.push(tab)
    renderDashboard(<Sidebar />, { store: tab.store })
    expect(screen.getByLabelText(shell.loading)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: shell.nav.start })).toHaveAttribute("href", "/en/dashboard")
  })

  it.each(["en", "de"] as const)("lists only the start link without an open project (%s)", async (lang) => {
    renderDashboard(<Sidebar />, { store: await storeWith(), lang })
    const copy = testDictionaries(lang)
    expect(await screen.findByText(copy.shell.nav.noProject)).toBeInTheDocument()
    const nav = screen.getByRole("navigation", { name: copy.shell.nav.label })
    expect(within(nav).getAllByRole("link")).toHaveLength(1)
    expect(screen.getByRole("link", { name: copy.common.app.homeLabel })).toHaveAttribute("href", `/${lang}`)
  })

  it("shows the open project's modules and marks the current page", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith({ businessPlan: true }) })
    expect(await screen.findByText("Harbour district")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: shell.nav.items.overview })).toHaveAttribute("href", "/en/dashboard/overview")
    expect(screen.getByRole("link", { name: shell.nav.items.businessPlan.opportunity })).toHaveAttribute("aria-current", "page")
    expect(screen.queryByRole("link", { name: shell.nav.items.quickCheck.area })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: shell.nav.items.assumptions })).not.toBeInTheDocument()
  })

  it("adds the Quick Check steps, results and assumptions when the module is on", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith({ quickCheck: true, businessPlan: true }) })
    expect(await screen.findByRole("link", { name: shell.nav.items.quickCheck.results })).toHaveAttribute(
      "href",
      "/en/dashboard/quick-check/results",
    )
    expect(screen.getByRole("link", { name: shell.nav.items.assumptions })).toHaveAttribute("href", "/en/dashboard/assumptions")
    expect(screen.getByRole("list", { name: shell.nav.sections.quickCheck })).toBeInTheDocument()
  })
})
