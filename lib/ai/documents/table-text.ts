/** A cell as a parser returns it: text, number, boolean, date or empty; anything else is written as text. */
export type TableCell = unknown

function cellText(cell: TableCell): string {
  if (cell === null || cell === undefined) return ""
  if (cell instanceof Date) {
    if (Number.isNaN(cell.getTime())) return ""
    const iso = cell.toISOString()
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso
  }
  if (typeof cell === "boolean") return cell ? "TRUE" : "FALSE"
  return String(cell).replace(/\s+/g, " ").trim()
}

/**
 * A table as text a model reads well: one line per row, tab between cells, numbers as they are
 * stored (dot decimal), dates as ISO. Empty rows and trailing empty cells are dropped.
 */
export function tableText(rows: readonly (readonly TableCell[])[]): string {
  const lines: string[] = []
  for (const row of rows) {
    const cells = row.map(cellText)
    while (cells.length > 0 && cells[cells.length - 1] === "") cells.pop()
    if (cells.length > 0) lines.push(cells.join("\t"))
  }
  return lines.join("\n")
}
