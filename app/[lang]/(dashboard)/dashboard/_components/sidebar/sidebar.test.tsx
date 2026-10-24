import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { SIDEBAR_ATTRIBUTE, SIDEBAR_STORAGE_KEY } from "@/lib/dashboard/sidebar-state"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { Sidebar } from "./sidebar"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard/business-plan/opportunity" }))

const root = document.documentElement
const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  window.localStorage.clear()
  root.removeAttribute(SIDEBAR_ATTRIBUTE)
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

  it("is a named complementary landmark, so it stays distinct from other asides on the page", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith() })
    expect(screen.getByRole("complementary", { name: shell.nav.sidebar })).toHaveAttribute("data-slot", "sidebar")
  })
})

describe("Sidebar as a collapsible rail (D-59)", () => {
  it("takes its width from the CSS variable that the html attribute switches", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith() })
    expect(screen.getByRole("complementary", { name: shell.nav.sidebar }).parentElement).toHaveClass("w-(--sidebar-width)")
  })

  it("has a toggle above the privacy note that controls the sidebar", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith() })
    const aside = screen.getByRole("complementary", { name: shell.nav.sidebar })
    const toggle = within(aside).getByRole("button", { name: shell.nav.rail.collapse })
    expect(toggle).toHaveAttribute("aria-controls", aside.id)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    const note = screen.getByText(shell.nav.privacy)
    expect(toggle.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("collapses: the html attribute and the stored key follow, and the toggle reports it", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith() })
    await userEvent.click(screen.getByRole("button", { name: shell.nav.rail.collapse }))
    expect(root.getAttribute(SIDEBAR_ATTRIBUTE)).toBe("collapsed")
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("collapsed")
    const toggle = await screen.findByRole("button", { name: shell.nav.rail.expand })
    expect(toggle).toHaveAttribute("aria-expanded", "false")

    await userEvent.click(toggle)
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBeNull()
    expect(await screen.findByRole("button", { name: shell.nav.rail.collapse })).toHaveAttribute("aria-expanded", "true")
  })

  it("reads a collapse from the html attribute and names its entries in tooltips", async () => {
    root.setAttribute(SIDEBAR_ATTRIBUTE, "collapsed")
    renderDashboard(<Sidebar />, { store: await storeWith({ quickCheck: true, businessPlan: true }) })
    expect(screen.getByRole("button", { name: shell.nav.rail.expand })).toHaveAttribute("aria-expanded", "false")
    const buildings = await screen.findByRole("link", { name: shell.nav.items.quickCheck.buildings })
    await act(async () => buildings.focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Quick Check · Buildings")
    expect(screen.getByRole("button", { name: `${shell.nav.currentProject}: Harbour district` })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: shell.nav.rail.privacy })).toBeInTheDocument()
  })

  it("puts a stored collapse back on <html> after mount (React's dev remount clears the script's attribute)", async () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "collapsed")
    renderDashboard(<Sidebar />, { store: await storeWith() })
    expect(root.getAttribute(SIDEBAR_ATTRIBUTE)).toBe("collapsed")
    await waitFor(() => expect(screen.getByRole("button", { name: shell.nav.rail.expand })).toBeInTheDocument())
  })

  it("leaves an expanded sidebar alone when nothing is stored", async () => {
    renderDashboard(<Sidebar />, { store: await storeWith() })
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
  })
})
