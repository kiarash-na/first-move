import { render, screen } from "@testing-library/react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
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
  it("never hides the keyboard focus ring of the chart surface (WCAG 2.4.7)", () => {
    const { container } = render(
      <ChartContainer id="focus" config={config}>
        <BarChart accessibilityLayer data={[{ name: "a", heat: 1 }]}>
          <Bar dataKey="heat" fill="var(--color-heat)" />
        </BarChart>
      </ChartContainer>,
    )
    const classes = container.querySelector("[data-chart]")?.className ?? ""
    expect(classes).not.toMatch(/recharts-surface\]:outline-hidden/)
    expect(classes).toContain("recharts-surface:focus-visible")
  })

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

  it("colours axis tick labels with the muted-foreground token (Recharts 3 tick-value class), not Recharts' #666", () => {
    const { container } = render(
      <ChartContainer id="ticks" config={config}>
        <BarChart width={400} height={200} layout="vertical" data={[{ name: "Revenues", heat: 1 }]}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" />
          <Bar dataKey="heat" />
        </BarChart>
      </ChartContainer>,
    )
    const wrapper = container.querySelector("[data-slot=chart]") as HTMLElement
    expect(wrapper.className).toContain("[&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground")
    const tick = container.querySelector("text.recharts-cartesian-axis-tick-value")
    // Recharts 3 draws labels in g.recharts-cartesian-axis-tick-label with a hard-coded fill="#666";
    // the wrapper must target the label's own class so the token wins over that attribute.
    expect(tick).not.toBeNull()
    expect(tick?.closest(".recharts-cartesian-axis-tick")).toBeNull()
    const selector = /\[&_\.([\w-]+)\]:fill-muted-foreground/.exec(wrapper.className)?.[1]
    expect(selector !== undefined && tick?.classList.contains(selector)).toBe(true)
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
