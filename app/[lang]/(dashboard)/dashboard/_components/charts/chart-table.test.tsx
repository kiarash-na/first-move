import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ChartTable } from "./chart-table"

describe("ChartTable", () => {
  it("renders row headers, formatted values and a footer", () => {
    render(
      <ChartTable
        caption="Table view of Investment"
        heading="Item"
        columns={["Amount"]}
        rows={[
          { key: "a", label: "Network", cells: ["€1,000"] },
          { key: "b", label: "Heat pumps", cells: ["€500"] },
        ]}
        footer={{ key: "t", label: "Total", cells: ["€1,500"] }}
      />,
    )
    const table = screen.getByRole("table", { name: "Table view of Investment" })
    expect(within(table).getByRole("columnheader", { name: "Amount" })).toBeInTheDocument()
    expect(within(table).getByRole("rowheader", { name: "Network" })).toBeInTheDocument()
    expect(within(table).getByRole("cell", { name: "€500" })).toBeInTheDocument()
    expect(within(table).getByRole("rowheader", { name: "Total" })).toBeInTheDocument()
  })
})
