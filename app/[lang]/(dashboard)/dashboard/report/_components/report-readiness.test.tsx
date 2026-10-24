import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { pitchReadiness } from "@/lib/business-plan"
import { createProject } from "@/lib/project"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportReadiness } from "./report-readiness"

describe("ReportReadiness (D-30, D-37)", () => {
  it("prints the score, the caveat and every pitch section with its checks, open ones named as missing", () => {
    const project = createProject({ modules: { businessPlan: true }, now: new Date("2026-10-24T08:00:00Z") })
    const { container } = renderDashboard(<ReportReadiness project={project} />, { store: projectStore(project).store })
    const { "business-plan": businessPlan } = testDictionaries()
    const readiness = pitchReadiness(project)
    expect(screen.getByText(businessPlan.readiness.caveat)).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(readiness.sections.length)
    const checks = readiness.sections.reduce((sum, section) => sum + section.checks.length, 0)
    expect(container.querySelectorAll("li")).toHaveLength(checks)
    expect(screen.getAllByText(`${businessPlan.readiness.missing}:`, { exact: false }).length).toBe(checks)
  })
})
