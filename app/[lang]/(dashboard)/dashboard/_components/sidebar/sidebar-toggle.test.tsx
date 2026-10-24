import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { SIDEBAR_ATTRIBUTE, SIDEBAR_COLLAPSED } from "@/lib/dashboard/sidebar-state"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { inRail, testRail } from "../test-utils/rail"
import { renderDashboard } from "../test-utils/render"
import { SidebarToggle } from "./sidebar-toggle"

const root = document.documentElement
afterEach(() => root.removeAttribute(SIDEBAR_ATTRIBUTE))

describe("SidebarToggle (D-59)", () => {
  it("renders nothing outside the desktop sidebar (the mobile sheet has no rail)", () => {
    const { container } = renderDashboard(<SidebarToggle />, { store: fakeStore().store })
    expect(container).toBeEmptyDOMElement()
  })

  it.each(["en", "de"] as const)("collapses the expanded sidebar, and says so (%s)", async (lang) => {
    const { shell } = testDictionaries(lang)
    const rail = testRail(false)
    renderDashboard(inRail(<SidebarToggle />, rail), { store: fakeStore().store, lang })
    const button = screen.getByRole("button", { name: shell.nav.rail.collapse })
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(button).toHaveAttribute("aria-controls", rail.id)
    expect(button).toHaveClass("size-11")
    await userEvent.click(button)
    expect(rail.setCollapsed).toHaveBeenCalledWith(true)
  })

  it("expands the collapsed rail again", async () => {
    const { shell } = testDictionaries("en")
    root.setAttribute(SIDEBAR_ATTRIBUTE, SIDEBAR_COLLAPSED)
    const rail = testRail(true)
    renderDashboard(inRail(<SidebarToggle />, rail), { store: fakeStore().store })
    const button = screen.getByRole("button", { name: shell.nav.rail.expand })
    expect(button).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(button)
    expect(rail.setCollapsed).toHaveBeenCalledWith(false)
  })

  it("flips what the page shows, not React's copy, so a click before hydration catches up is not lost", async () => {
    // The pre-paint script has drawn the rail; React still holds the server snapshot (expanded).
    root.setAttribute(SIDEBAR_ATTRIBUTE, SIDEBAR_COLLAPSED)
    const rail = testRail(false)
    renderDashboard(inRail(<SidebarToggle />, rail), { store: fakeStore().store })
    await userEvent.click(screen.getByRole("button"))
    expect(rail.setCollapsed).toHaveBeenCalledExactlyOnceWith(false)
  })

  it("draws both icons and lets CSS pick one from the html attribute, so the first paint is right", () => {
    renderDashboard(inRail(<SidebarToggle />, testRail(false)), { store: fakeStore().store })
    const [close, open] = [...screen.getByRole("button").querySelectorAll("svg")]
    expect(close).toHaveClass("lucide-panel-left-close", "rail:hidden")
    expect(open).toHaveClass("lucide-panel-left-open", "hidden", "rail:block")
  })

  it("names itself in a tooltip in both states, since it is an icon in both", async () => {
    const { shell } = testDictionaries("en")
    renderDashboard(inRail(<SidebarToggle />, testRail(false)), { store: fakeStore().store })
    await act(async () => screen.getByRole("button", { name: shell.nav.rail.collapse }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent(shell.nav.rail.collapse)
  })
})
