import { render, screen } from "@testing-library/react"
import { Building2Icon } from "lucide-react"
import { describe, expect, it } from "vitest"
import { MetricTile } from "./metric-tile"

describe("MetricTile", () => {
  it("shows label, value, unit, detail and the info slot", () => {
    render(<MetricTile id="density" icon={Building2Icon} label="Building density" value="11.1" unit="buildings/ha" detail="High density" info={<button>info</button>} />)
    expect(screen.getByRole("article", { name: "Building density" })).toHaveAttribute("data-tile", "density")
    expect(screen.getByText("11.1")).toBeInTheDocument()
    expect(screen.getByText("buildings/ha")).toBeInTheDocument()
    expect(screen.getByText("High density")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "info" })).toBeInTheDocument()
  })
})
