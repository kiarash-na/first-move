import { act, screen, within } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"
import common from "@/dictionaries/en/common.json"
import shell from "@/dictionaries/en/shell.json"
import { renderDashboard } from "../test-utils/render"
import { fakeStore } from "../test-utils/fake-store"
import { inRail, testRail } from "../test-utils/rail"
import { revealActiveLink } from "./reveal-active-link"
import { SidebarContent } from "./sidebar-content"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard" }))
// Records when the current page's link is revealed; jsdom has no layout to scroll.
vi.mock("./reveal-active-link", () => ({ revealActiveLink: vi.fn() }))
// Records the prefetch prop, which the real Link does not put in the DOM.
vi.mock("next/link", () => ({
  default: ({ prefetch, ...props }: ComponentProps<"a"> & { prefetch?: boolean | null }) => (
    <a data-prefetch={String(prefetch)} {...props} />
  ),
}))

describe("SidebarContent", () => {
  it("holds brand, open project, navigation, footer and the privacy note", () => {
    renderDashboard(<SidebarContent footer={<p>Footer slot</p>} />, { store: fakeStore().store })
    expect(screen.getByRole("link", { name: common.app.homeLabel })).toHaveAttribute("href", "/en")
    expect(screen.getByText(shell.nav.currentProject)).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: shell.nav.label })).toBeInTheDocument()
    expect(screen.getByText("Footer slot")).toBeInTheDocument()
    expect(screen.getByText(shell.nav.privacy)).toBeInTheDocument()
  })

  it("does not prefetch the landing page, whose stylesheet the dashboard never uses", () => {
    renderDashboard(<SidebarContent />, { store: fakeStore().store })
    expect(screen.getByRole("link", { name: common.app.homeLabel })).toHaveAttribute("data-prefetch", "false")
  })

  it("has no rail controls or tooltips outside the desktop sidebar (mobile sheet, D-59)", () => {
    renderDashboard(<SidebarContent />, { store: fakeStore().store })
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: common.app.homeLabel })).not.toHaveAttribute("data-state")
  })

  it("in the collapsed rail shows the brand mark only, named in a tooltip (D-59)", async () => {
    renderDashboard(inRail(<SidebarContent />, testRail(true)), { store: fakeStore().store })
    const brand = screen.getByRole("link", { name: common.app.homeLabel })
    expect(within(brand).getByText(common.app.name)).toHaveClass("rail:hidden")
    await act(async () => brand.focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent(common.app.homeLabel)
  })

  it("reveals the current page again when the rail collapses or expands, which changes the list's height (D-07, D-59)", () => {
    const { rerender } = renderDashboard(inRail(<SidebarContent />, testRail(true)), { store: fakeStore().store })
    const scroller = screen.getByRole("navigation", { name: shell.nav.label }).parentElement
    expect(revealActiveLink).toHaveBeenLastCalledWith(scroller)
    vi.mocked(revealActiveLink).mockClear()

    rerender(inRail(<SidebarContent />, testRail(false)))
    expect(revealActiveLink).toHaveBeenCalledExactlyOnceWith(scroller)
    // A new context value in the same state is no reason to scroll.
    rerender(inRail(<SidebarContent />, testRail(false)))
    expect(revealActiveLink).toHaveBeenCalledOnce()
  })

  it("hides the navigation's scrollbar only in the rail, where a classic one would take a quarter of it (D-59)", () => {
    renderDashboard(<SidebarContent />, { store: fakeStore().store })
    expect(screen.getByRole("navigation", { name: shell.nav.label }).parentElement).toHaveClass(
      "overflow-y-auto",
      "rail:scrollbar-none",
      "rail:[&::-webkit-scrollbar]:hidden",
    )
  })
})
