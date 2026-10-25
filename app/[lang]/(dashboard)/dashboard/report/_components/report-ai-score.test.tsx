import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { applyPatch, createProject } from "@/lib/project"
import { withAiScore } from "../../business-plan/_components/test-utils/ai-score"
import { projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportAiScore } from "./report-ai-score"

const plan = () => createProject({ modules: { businessPlan: true }, now: new Date("2026-10-25T08:00:00Z") })

describe("ReportAiScore (D-73, D-74)", () => {
  it("prints nothing without a saved score", () => {
    const project = plan()
    const { container } = renderDashboard(<ReportAiScore project={project} />, { store: projectStore(project).store })
    expect(container).toBeEmptyDOMElement()
  })

  it("prints the score, band and label in one line, marked AI-generated", () => {
    const project = withAiScore(plan())
    const { container } = renderDashboard(<ReportAiScore project={project} />, { store: projectStore(project).store })
    const line = container.querySelector("[data-slot=report-ai-score]")
    expect(line).toHaveAttribute("data-ai-generated", "true")
    expect(line).toHaveTextContent("AI Plan Score")
    expect(screen.getByText("60")).toBeInTheDocument()
    expect(screen.getByText("± 8")).toBeInTheDocument()
    expect(screen.getByText("Promising")).toBeInTheDocument()
    expect(line).toHaveTextContent("AI-generated · Scored on 25 Oct 2026")
  })

  it("says when the score is outdated", () => {
    const scored = withAiScore(plan())
    const project = applyPatch(scored, { "businessPlan.opportunity.painPoint": "Boilers at the end of their life." }).project
    const { container } = renderDashboard(<ReportAiScore project={project} />, { store: projectStore(project).store, lang: "de" })
    expect(container.querySelector("[data-slot=report-ai-score]")).toHaveAttribute("data-state", "outdated")
    expect(container).toHaveTextContent("Veraltet: 1 von 3 bewerteten Teilen seit dem Lauf geändert")
    expect(screen.getByText("Vielversprechend")).toBeInTheDocument()
  })
})
