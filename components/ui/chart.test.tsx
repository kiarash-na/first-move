import { render, screen } from "@testing-library/react"
import { Bar, BarChart } from "recharts"
import { describe, expect, it, vi } from "vitest"
import { ChartContainer, ChartStyle, ChartTooltipContent, type ChartConfig } from "./chart"

// jsdom has no layout, so the responsive wrapper would render nothing: render its children directly.
vi.mock("recharts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("recharts")>()),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

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

describe("ChartTooltipContent", () => {
  it("lists only the series that have a value at the hovered category (stacks with different series per row)", () => {
    const payload = [
      { name: "heat", dataKey: "heat", value: 1200, color: "red", payload: {} },
      { name: "cool", dataKey: "cool", value: undefined, color: "blue", payload: {} },
    ]
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent active payload={payload as never} label="Row" valueFormatter={(value) => `${value} kWh`} />
      </ChartContainer>,
    )
    expect(screen.getByText("Heat")).toBeInTheDocument()
    expect(screen.getByText("1200 kWh")).toBeInTheDocument()
    expect(screen.queryByText("Cool")).not.toBeInTheDocument()
  })
})
