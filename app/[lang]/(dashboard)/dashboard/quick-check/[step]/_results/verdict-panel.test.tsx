import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { applyPatch } from "@/lib/project"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { VerdictPanel } from "./verdict-panel"

const renderPanel = (id: string, patch: Record<string, unknown> = {}, lang: "en" | "de" = "en") => {
  const project = applyPatch(exampleProject(id), patch, { atomic: true }).project
  return renderDashboard(<VerdictPanel result={run(project) as QuickCheckComplete} />, { store: projectStore(project).store, lang })
}

describe("VerdictPanel (QCT-KF-01, KF-05, KF-06)", () => {
  it("names the forced reasons: industry and unknown sources", () => {
    const { container } = renderPanel("school-kindergarten-flats", {
      "buildings.shares.industry.2011_today": 10,
      "buildings.shares.category_a.1991_2010": 2.5,
      "sources.potentials.geothermal": "unknown",
      "sources.potentials.waste_heat": "unknown",
    })
    expect(container.querySelector("[data-level]")).toHaveAttribute("data-level", "further_analysis")
    expect(screen.getByText(quickCheck.ui.results.forced)).toBeInTheDocument()
    expect(container.querySelector("[data-reason=industry]")).toHaveTextContent(quickCheck.results.reasons.industry.label)
    expect(container.querySelector("[data-reason=unknown_source]")).toHaveTextContent("The potential of geothermal and waste heat is unknown.")
  })

  it("shows a not-promising result with its reason and the level explanation", () => {
    const { container } = renderPanel("rural-village-hotel")
    expect(screen.getByRole("heading", { level: 2, name: quickCheck.results.levels.not_promising.label })).toBeInTheDocument()
    expect(container.querySelector("[data-reason=low_coverage_and_densities]")).not.toBeNull()
    expect(screen.queryByText(quickCheck.ui.results.forced)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: `${calc.ui.info}: ${quickCheck.ui.results.overall}` })).toBeInTheDocument()
  })
})
