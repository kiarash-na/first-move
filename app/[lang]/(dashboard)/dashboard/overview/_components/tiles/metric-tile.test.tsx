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

  it("keeps the 44px info button out of the label's flow, so it never widens a narrow tile (320px reflow)", () => {
    render(<MetricTile id="operation" icon={Building2Icon} label="Operation and maintenance" value="€12k" info={<button>info</button>} />)
    const heading = screen.getByRole("heading", { name: "Operation and maintenance" })
    expect(heading).toHaveClass("min-w-0", "[overflow-wrap:anywhere]")
    expect(screen.getByRole("article")).toHaveClass("relative", "min-w-0")
    expect(screen.getByRole("button", { name: "info" }).parentElement).toHaveClass("absolute", "top-0", "right-0")
    expect(heading).not.toContainElement(screen.getByRole("button", { name: "info" }))
  })
})
