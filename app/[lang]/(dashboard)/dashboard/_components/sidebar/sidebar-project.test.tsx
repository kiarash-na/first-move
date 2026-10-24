import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { INITIAL_STATE } from "@/lib/store"
import { renderDashboard } from "../test-utils/render"
import { fakeStore } from "../test-utils/fake-store"
import { emptyProject, exampleProject, projectStore } from "../test-utils/project-store"
import { inRail, testRail } from "../test-utils/rail"
import { SidebarProject } from "./sidebar-project"

describe("SidebarProject", () => {
  it("shows a skeleton until the store is ready", () => {
    renderDashboard(<SidebarProject />, { store: fakeStore({ phase: INITIAL_STATE.phase }).store })
    expect(screen.getByLabelText(shell.loading)).toHaveAttribute("aria-busy", "true")
  })

  it("says that no project is open", () => {
    renderDashboard(<SidebarProject />, { store: fakeStore().store })
    expect(screen.getByText(shell.nav.noProject)).toBeInTheDocument()
    expect(screen.getByText(shell.nav.noProjectHint)).toBeInTheDocument()
  })

  it("names an example, its modules and the example tag", () => {
    const project = exampleProject("new-build-quarter")
    renderDashboard(<SidebarProject />, { store: projectStore(project).store })
    expect(screen.getByText(project.meta.name)).toBeInTheDocument()
    expect(screen.getByText(shell.fields.meta.modules.quickCheck.label)).toBeInTheDocument()
    expect(screen.getByText(shell.fields.meta.modules.businessPlan.label)).toBeInTheDocument()
    expect(screen.getByText(shell.nav.example)).toBeInTheDocument()
  })

  it("falls back to the untitled name and shows no example tag for an own project", () => {
    renderDashboard(<SidebarProject />, { store: projectStore(emptyProject()).store })
    expect(screen.getByText(shell.fields.meta.name.placeholder)).toBeInTheDocument()
    expect(screen.queryByText(shell.nav.example)).not.toBeInTheDocument()
  })

  it("has no rail button outside the desktop sidebar (mobile sheet)", () => {
    renderDashboard(<SidebarProject />, { store: projectStore(emptyProject()).store })
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(document.querySelector("[data-slot=sidebar-project]")).not.toHaveAttribute("tabindex")
  })
})

describe("SidebarProject in the collapsed rail (D-59)", () => {
  it("is an icon button with the project name in its tooltip", async () => {
    const project = exampleProject("new-build-quarter")
    renderDashboard(inRail(<SidebarProject />, testRail(true)), { store: projectStore(project).store })
    expect(document.querySelector("[data-slot=sidebar-project]")).toHaveClass("rail:hidden")
    const button = screen.getByRole("button", { name: `${shell.nav.currentProject}: ${project.meta.name}` })
    await act(async () => button.focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent(project.meta.name)
  })

  it("expands the sidebar and moves focus to the project details", async () => {
    const rail = testRail(true)
    renderDashboard(inRail(<SidebarProject />, rail), { store: projectStore(emptyProject()).store })
    await userEvent.click(screen.getByRole("button", { name: `${shell.nav.currentProject}: ${shell.fields.meta.name.placeholder}` }))
    expect(rail.setCollapsed).toHaveBeenCalledWith(false)
    expect(document.querySelector("[data-slot=sidebar-project]")).toHaveFocus()
  })

  it("says that no project is open, and shows a skeleton while loading", async () => {
    const { unmount } = renderDashboard(inRail(<SidebarProject />), { store: fakeStore().store })
    await act(async () => screen.getByRole("button", { name: shell.nav.noProject }).focus())
    expect(await screen.findByRole("tooltip")).toHaveTextContent(shell.nav.noProject)
    unmount()

    renderDashboard(inRail(<SidebarProject />), { store: fakeStore({ phase: INITIAL_STATE.phase }).store })
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
    expect(screen.getByLabelText(shell.loading)).toBeInTheDocument()
  })
})
