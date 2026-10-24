import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportHeader } from "./report-header"

describe("ReportHeader", () => {
  it.each(["en", "de"] as const)("names First Move, the project and the day, with the module and example badges (%s)", (lang) => {
    const project = exampleProject("housing-cooperatives")
    const { container } = renderDashboard(<ReportHeader project={project} created="2026-10-24T09:00:00.000Z" />, {
      store: projectStore(project).store,
      lang,
    })
    const { report, shell } = testDictionaries(lang)
    expect(screen.getByRole("heading", { level: 1, name: project.meta.name })).toBeInTheDocument()
    expect(screen.getByText(report.header.eyebrow)).toBeInTheDocument()
    expect(screen.getByText(lang === "en" ? /24 Oct 2026/ : /24\.10\.2026/)).toBeInTheDocument()
    expect(screen.getByText(shell.illustrative)).toBeInTheDocument()
    expect(container.querySelector(".brand-mark")).not.toBeNull()
  })

  it("titles an unnamed project as everywhere else", () => {
    const project = applyPatch(exampleProject("housing-cooperatives"), { "meta.name": "" }).project
    renderDashboard(<ReportHeader project={project} created="2026-10-24T09:00:00.000Z" />, { store: projectStore(project).store })
    expect(screen.getByRole("heading", { level: 1, name: testDictionaries().shell.fields.meta.name.placeholder })).toBeInTheDocument()
  })
})
