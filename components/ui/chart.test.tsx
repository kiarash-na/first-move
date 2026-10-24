import { render } from "@testing-library/react"
import { Bar, BarChart } from "recharts"
import { describe, expect, it } from "vitest"
import { ChartContainer, ChartStyle, type ChartConfig } from "./chart"

const config = {
  heat: { label: "Heat", color: "var(--chart-2)" },
  cool: { label: "Cool", theme: { dark: "var(--chart-1)", light: "var(--chart-3)" } },
} satisfies ChartConfig

describe("ChartStyle", () => {
  it("writes series colours for dark (default) and light", () => {
    const { container } = render(<ChartStyle id="chart-x" config={config} />)
    const css = container.querySelector("style")?.innerHTML ?? ""
    expect(css).toContain("[data-chart=chart-x]")
    expect(css).toContain("--color-heat: var(--chart-2)")
    expect(css).toContain("[data-theme=light] [data-chart=chart-x]")
    expect(css).toContain("--color-cool: var(--chart-3)")
  })

  it("renders nothing without colours", () => {
    const { container } = render(<ChartStyle id="c" config={{ a: { label: "A" } }} />)
    expect(container.innerHTML).toBe("")
  })
})

describe("ChartContainer", () => {
  it("wraps a Recharts chart with its config", () => {
    const { container } = render(
      <ChartContainer id="demand" config={config}>
        <BarChart data={[{ name: "a", heat: 1 }]}>
          <Bar dataKey="heat" fill="var(--color-heat)" />
        </BarChart>
      </ChartContainer>,
    )
    expect(container.querySelector("[data-chart=chart-demand]")).not.toBeNull()
  })
})
