import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { KpiGroup } from "./kpi-group"

describe("KpiGroup", () => {
  it("is a group named by its H3 heading", () => {
    render(
      <KpiGroup id="kpis-energy" title="Energy">
        <p>Cards</p>
      </KpiGroup>,
    )
    expect(screen.getByRole("group", { name: "Energy" })).toContainElement(screen.getByText("Cards"))
    expect(screen.getByRole("heading", { level: 3, name: "Energy" })).toBeInTheDocument()
  })
})
