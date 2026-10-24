import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { shareSum } from "@/lib/dashboard/share-sum"
import { getGroup } from "@/lib/project"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../../_components/test-utils/project-store"
import { ShareGrid } from "./share-grid"

describe("ShareGrid (QCT-IN-04)", () => {
  it("has a row per building type, the verbatim periods and live totals", () => {
    const project = exampleProject("school-kindergarten-flats")
    const { container } = renderDashboard(<ShareGrid group={getGroup("buildings.shares")!} sum={shareSum(project)} />, {
      store: projectStore(project).store,
    })
    expect(screen.getByRole("heading", { name: quickCheck.fields.buildings.shares.label })).toBeInTheDocument()
    expect(Array.from(container.querySelectorAll("[data-row]")).map((row) => row.getAttribute("data-row"))).toEqual([
      "residential",
      "category_a",
      "category_b",
      "category_c",
      "industry",
    ])
    for (const period of Object.values(quickCheck.periods)) expect(screen.getAllByText(period.label).length).toBeGreaterThan(0)
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0)
    expect(container.querySelector("[data-slot=share-legend]")).not.toBeNull()
  })
})
