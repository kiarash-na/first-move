import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../_components/test-utils/project-store"
import { BuildingTables } from "./building-tables"

describe("BuildingTables (TBL-1..3, read-only)", () => {
  it("shows each table with dashes for industry (OQ-02)", async () => {
    renderDashboard(<BuildingTables />, { store: projectStore(emptyProject()).store })
    const table = screen.getByRole("table")
    expect(within(table).getByRole("row", { name: /Residential buildings/ })).toHaveTextContent("124.4")
    expect(within(table).getAllByText(assumptions.tables.dash)).toHaveLength(5)
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: /TBL-3/ }))
    expect(screen.getByText(assumptions.tables["TBL-3"].unit)).toBeInTheDocument()
  })
})
