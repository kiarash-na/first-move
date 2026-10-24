import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SeriesLegend } from "./series-legend"

describe("SeriesLegend", () => {
  it("names every series and hatches the marked one", () => {
    render(
      <SeriesLegend
        label="Revenues"
        items={[
          { id: "a", label: "Base prices", color: "var(--chart-1)" },
          { id: "b", label: "Connection fees", color: "var(--chart-5)", hatched: true },
        ]}
      />,
    )
    expect(screen.getByText("Revenues")).toBeInTheDocument()
    expect(screen.getByText("Base prices")).toBeInTheDocument()
    const hatched = screen.getByText("Connection fees").querySelector("span")!
    expect(hatched.style.background).toContain("repeating-linear-gradient")
  })
})
