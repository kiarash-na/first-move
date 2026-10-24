import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { applyPatch } from "@/lib/project"
import { run, type QuickCheckIncomplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { ResultsIncomplete } from "./results-incomplete"

describe("ResultsIncomplete (R-03)", () => {
  it("links the step whose shares no longer add up to 100", () => {
    const project = applyPatch(exampleProject("new-build-quarter"), { "buildings.shares.residential.2011_today": null }).project
    const result = run(project) as QuickCheckIncomplete
    renderDashboard(<ResultsIncomplete result={result} />, { store: projectStore(project).store })
    expect(screen.getByText(quickCheck.ui.results.incomplete.body)).toBeInTheDocument()
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["/en/dashboard/quick-check/buildings"])
  })
})
