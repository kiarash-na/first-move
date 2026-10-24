import { act, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { renderDashboard } from "../test-utils/render"
import { fakeStore } from "../test-utils/fake-store"
import { emptyProject, exampleProject, projectStore } from "../test-utils/project-store"
import { inRail, testRail } from "../test-utils/rail"
import { SidebarNav } from "./sidebar-nav"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard/overview" }))

describe("SidebarNav (D-07)", () => {
  it("lists only the start link without an open project", () => {
    renderDashboard(<SidebarNav />, { store: fakeStore().store })
    const nav = screen.getByRole("navigation", { name: shell.nav.label })
    expect(within(nav).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["/en/dashboard"])
  })

  it("adds the open project's sections, each a list named by its heading, and marks the current page", () => {
    renderDashboard(<SidebarNav />, { store: projectStore(exampleProject("housing-cooperatives")).store })
    expect(screen.getByRole("list", { name: shell.nav.sections.quickCheck })).toBeInTheDocument()
    expect(screen.getByRole("list", { name: shell.nav.sections.businessPlan })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: shell.nav.items.overview })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: shell.nav.items.businessPlan.implementation })).toHaveAttribute(
      "href",
      "/en/dashboard/business-plan/implementation",
    )
  })

  it("hides the steps of a module that is off and reports navigation", async () => {
    const onNavigate = vi.fn()
    renderDashboard(<SidebarNav onNavigate={onNavigate} />, { store: projectStore(emptyProject()).store, lang: "de" })
    expect(screen.queryByRole("link", { name: shell.nav.items.businessPlan.opportunity })).not.toBeInTheDocument()
    const area = screen.getByRole("link", { name: shell.nav.items.quickCheck.area })
    expect(area).toHaveAttribute("href", "/de/dashboard/quick-check/area")
    area.click()
    expect(onNavigate).toHaveBeenCalled()
  })

  it("shows numbers, not icons, for the steps outside the desktop sidebar (mobile sheet unchanged)", () => {
    renderDashboard(<SidebarNav />, { store: projectStore(exampleProject("housing-cooperatives")).store })
    expect(screen.getByRole("link", { name: shell.nav.items.quickCheck.buildings }).querySelector("svg")).toBeNull()
    expect(screen.getByRole("link", { name: shell.nav.items.overview }).querySelector("svg")).not.toBeNull()
    expect(document.querySelectorAll("nav span.h-px")).toHaveLength(0)
  })
})

describe("SidebarNav in the collapsed rail (D-59)", () => {
  const renderRail = () =>
    renderDashboard(inRail(<SidebarNav />, testRail(true)), { store: projectStore(exampleProject("housing-cooperatives")).store })

  it("has an icon for every entry and a short line in the section colour for every section title", () => {
    renderRail()
    const nav = screen.getByRole("navigation", { name: shell.nav.label })
    for (const link of within(nav).getAllByRole("link")) expect(link.querySelector("svg"), link.textContent ?? "").not.toBeNull()
    const lines = [...nav.querySelectorAll<HTMLElement>("span.h-px")]
    expect(lines.map((line) => line.className.match(/bg-(muted-foreground|primary|hot)/)?.[1])).toEqual(["muted-foreground", "primary", "hot"])
    for (const line of lines) expect(line).toHaveAttribute("aria-hidden", "true")
  })

  it("keeps every list named by its section title for screen readers", () => {
    renderRail()
    for (const id of ["project", "quickCheck", "businessPlan"] as const) {
      expect(screen.getByRole("list", { name: shell.nav.sections[id] })).toBeInTheDocument()
    }
    expect(screen.getByText(shell.nav.sections.quickCheck)).toHaveClass("rail:sr-only")
  })

  it.each([
    [shell.nav.items.quickCheck.buildings, "Quick Check · Buildings"],
    [shell.nav.items.overview, "Project · Overview"],
    [shell.nav.items.businessPlan["reality-check"], "Business Plan · Reality check"],
    [shell.nav.start, shell.nav.start],
  ])("names %s with its section in a tooltip on focus", async (name, tooltip) => {
    renderRail()
    await act(async () => screen.getByRole("link", { name }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent(tooltip)
  })
})
