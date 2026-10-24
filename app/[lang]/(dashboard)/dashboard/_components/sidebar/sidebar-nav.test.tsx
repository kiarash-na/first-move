import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { renderDashboard } from "../test-utils/render"
import { fakeStore } from "../test-utils/fake-store"
import { emptyProject, exampleProject, projectStore } from "../test-utils/project-store"
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
})
