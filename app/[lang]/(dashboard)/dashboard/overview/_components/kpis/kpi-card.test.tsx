import { render, screen } from "@testing-library/react"
import { FlameIcon } from "lucide-react"
import { describe, expect, it } from "vitest"
import { KpiCard } from "./kpi-card"

describe("KpiCard", () => {
  it("shows the label, the value in display size and the unit smaller", () => {
    render(<KpiCard id="demo" icon={FlameIcon} tone="hot" label="Heating demand" value="1.23" unit="GWh/a" info={<button>info</button>} note="Some note" />)
    expect(screen.getByRole("article", { name: "Heating demand" })).toHaveAttribute("data-kpi", "demo")
    expect(screen.getByText("1.23")).toBeInTheDocument()
    expect(screen.getByText("GWh/a")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "info" })).toBeInTheDocument()
    expect(screen.getByText("Some note")).toBeInTheDocument()
  })

  it("appends an extra unit and renders the status", () => {
    render(<KpiCard id="rev" icon={FlameIcon} tone="cool" label="Revenues" value="€1.2M" unit="/a" status={<span>Favorable</span>} info={null} />)
    expect(screen.getByText("€1.2M")).toBeInTheDocument()
    expect(screen.getByText("/a")).toBeInTheDocument()
    expect(screen.getByText("Favorable")).toBeInTheDocument()
  })
})
