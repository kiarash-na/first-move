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
})
