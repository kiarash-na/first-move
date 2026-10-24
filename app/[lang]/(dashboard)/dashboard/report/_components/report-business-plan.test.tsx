import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EXAMPLES, localizeExample } from "@/lib/examples"
import { createProject } from "@/lib/project"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportBusinessPlan } from "./report-business-plan"

describe("ReportBusinessPlan", () => {
  it("prints the four steps with their progress and what was written", () => {
    const project = EXAMPLES.map((example) => localizeExample(example, "en")).find((entry) => entry.meta.modules.businessPlan)!
    renderDashboard(<ReportBusinessPlan project={project} />, { store: projectStore(project).store })
    const { shell, "business-plan": businessPlan } = testDictionaries()
    for (const step of ["opportunity", "business-logic", "reality-check", "implementation"] as const) {
      expect(screen.getByRole("heading", { level: 3, name: shell.nav.items.businessPlan[step] })).toBeInTheDocument()
    }
    expect(screen.getByText(businessPlan.fields.site.name.label)).toBeInTheDocument()
    expect(screen.getAllByText(/of \d+ filled in/).length).toBe(4)
  })

  it("says so when a step is still empty", () => {
    const project = createProject({ modules: { businessPlan: true }, now: new Date("2026-10-24T08:00:00Z") })
    renderDashboard(<ReportBusinessPlan project={project} />, { store: projectStore(project).store })
    expect(screen.getAllByText(testDictionaries().report.businessPlan.empty)).toHaveLength(4)
  })
})
