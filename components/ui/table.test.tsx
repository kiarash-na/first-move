import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./table"

describe("Table", () => {
  it("renders a scrollable table with mono header cells", () => {
    render(
      <Table>
        <TableCaption>Sources</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Sewage</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )
    expect(screen.getByRole("table", { name: "Sources" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Source" }).className).toContain("font-mono")
    expect(screen.getByRole("cell", { name: "Sewage" })).toBeInTheDocument()
  })

  it("makes a labelled table's scroller a named, focusable region with a scroll cue", () => {
    render(
      <Table scrollLabel="TBL-6 Economic parameters">
        <TableBody>
          <TableRow>
            <TableCell>Interest</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const region = screen.getByRole("region", { name: "TBL-6 Economic parameters" })
    expect(region).toHaveAttribute("tabindex", "0")
    expect(region).toHaveClass("scroll-fade-x")
    expect(region).toContainElement(screen.getByRole("table"))
  })

  it("falls back to the table's aria-label and stays a plain scroller without a label", () => {
    const { container, unmount } = render(<Table aria-label="Investment" />)
    expect(screen.getByRole("region", { name: "Investment" })).toHaveAttribute("tabindex", "0")
    unmount()
    render(<Table />)
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
    expect(container.ownerDocument.querySelector("[data-slot=table-container]")).not.toHaveAttribute("tabindex")
  })
})
