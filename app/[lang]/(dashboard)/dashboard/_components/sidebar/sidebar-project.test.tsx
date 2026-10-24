import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { INITIAL_STATE } from "@/lib/store"
import { renderDashboard } from "../test-utils/render"
import { fakeStore } from "../test-utils/fake-store"
import { emptyProject, exampleProject, projectStore } from "../test-utils/project-store"
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
})
