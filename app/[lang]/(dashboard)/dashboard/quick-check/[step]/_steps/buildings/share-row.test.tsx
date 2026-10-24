import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { getGroup } from "@/lib/project"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../../_components/test-utils/project-store"
import { ShareRow } from "./share-row"

describe("ShareRow", () => {
  it("renders the five period cells of one type with its total", () => {
    renderDashboard(<ShareRow group={getGroup("buildings.shares")!} type="category_b" total={12.5} />, { store: projectStore(emptyProject()).store })
    const row = screen.getByRole("group", { name: quickCheck.buildingTypes.category_b.label })
    expect(row.querySelectorAll("input")).toHaveLength(5)
    expect(screen.getByRole("textbox", { name: "Category B, 2011-today" })).toBeInTheDocument()
    expect(row).toHaveTextContent("12.5%")
    expect(row).toHaveTextContent(quickCheck.buildingTypes.category_b.description)
  })
})
