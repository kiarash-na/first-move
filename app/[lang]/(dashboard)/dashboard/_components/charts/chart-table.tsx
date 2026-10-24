import type { ReactNode } from "react"

import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface ChartTableRow {
  key: string
  /** The row header: the category the chart plots. */
  label: ReactNode
  /** Formatted values, one per value column. */
  cells: ReactNode[]
}

/**
 * The table view every chart has (WCAG-clean twin of the plot): the same rows as the chart, as
 * text. Numbers are already formatted by the caller.
 */
export function ChartTable({
  caption,
  heading,
  columns,
  rows,
  footer,
}: {
  caption: string
  /** Header of the first column. */
  heading: string
  columns: readonly string[]
  rows: readonly ChartTableRow[]
  footer?: ChartTableRow
}) {
  return (
    <div data-slot="chart-table" className="border">
      <Table aria-label={caption}>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">{heading}</TableHead>
            {columns.map((column) => (
              <TableHead key={column} scope="col" className="text-right">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.key}>
              <TableHead scope="row" className="font-normal text-foreground">
                {row.label}
              </TableHead>
              {row.cells.map((cell, index) => (
                <TableCell key={columns[index]} className="text-right font-mono text-sm tabular-nums">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        {footer && (
          <TableFooter>
            <TableRow>
              <TableHead scope="row" className="text-foreground">
                {footer.label}
              </TableHead>
              {footer.cells.map((cell, index) => (
                <TableCell key={columns[index]} className="text-right font-mono text-sm tabular-nums">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}
