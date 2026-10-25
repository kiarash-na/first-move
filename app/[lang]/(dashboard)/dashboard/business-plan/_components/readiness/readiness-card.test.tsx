import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import type { ReadinessGroup } from "@/lib/business-plan"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { ReadinessCard } from "./readiness-card"

afterEach(stopTabs)

const group: ReadinessGroup<string> = {
  id: "scalability",
  met: 1,
  total: 2,
  score: 0.5,
  checks: [
    { id: "scalabilityEconomic", met: true, step: "implementation", field: "businessPlan.scalability.economic" },
    { id: "scalabilityGeographical", met: false, step: "implementation", field: "businessPlan.scalability.geographical" },
  ],
}

describe("ReadinessCard", () => {
  it("shows the score, covered and open checks as text, and a link only for the open one", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessCard label="Scalability" question="Can it travel?" group={group} badge={<span>Tag</span>} />, { store: tab.store })
    expect(screen.getByRole("article", { name: "Scalability" })).toBeInTheDocument()
    expect(screen.getByText("Can it travel?")).toBeInTheDocument()
    expect(screen.getByText("Tag")).toBeInTheDocument()
    expect(screen.getByText(/1\/2 · 50%/)).toBeInTheDocument()
    expect(screen.getByText(/^Covered:/).closest("li")).toHaveTextContent("Economic conditions")
    expect(screen.getByText(/^Open:/).closest("li")).toHaveTextContent("Geographical conditions")
    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.queryByText("Complete")).toBeNull()
  })

  it("says complete when every check is covered", async () => {
    const tab = await openProject()
    const done = { ...group, met: 2, score: 1, checks: group.checks.map((check) => ({ ...check, met: true })) }
    renderDashboard(<ReadinessCard label="Scalability" group={done} />, { store: tab.store })
    expect(screen.getByText("Complete")).toBeInTheDocument()
  })
})
