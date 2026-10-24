import { tableText } from "./table-text"

export type XlsxText = { ok: true; text: string; sheets: string[] } | { ok: false; error: "corrupt" }

const WORKSHEET = /^xl\/worksheets\/[^/]+\.xml$/

export const isWorksheet = (name: string) => WORKSHEET.test(name)

/** A cell element with content (a self-closing one is empty), with or without a namespace prefix. */
const CELL = /<(?:[A-Za-z_][\w.-]*:)?c\b([^>]*?)(\/?)>/g
const ROW = /<(?:[A-Za-z_][\w.-]*:)?row\b[^>]*?\br\s*=\s*["'](\d{1,12})["']/g
const REF = /\br\s*=\s*["']([A-Za-z]{1,9})(\d{1,12})["']/

const columnNumber = (letters: string) => [...letters.toUpperCase()].reduce((number, char) => number * 26 + char.charCodeAt(0) - 64, 0)

/**
 * The last row and column a worksheet's XML refers to. The spreadsheet parser fills every gap up
 * to them, so a tiny file with one far-away cell would make it allocate millions of cells: the
 * caller checks rows × columns against the cap before parsing.
 */
export function sheetExtent(xml: string): { rows: number; columns: number } {
  let rows = 0
  let columns = 0
  for (const [, number] of xml.matchAll(ROW)) rows = Math.max(rows, Number(number))
  for (const [, attributes, selfClosing] of xml.matchAll(CELL)) {
    if (selfClosing) continue
    const ref = REF.exec(attributes)
    if (!ref) continue
    columns = Math.max(columns, columnNumber(ref[1]))
    rows = Math.max(rows, Number(ref[2]))
  }
  return { rows, columns }
}

/**
 * The values of every sheet as text, with read-excel-file, loaded only when a workbook is read
 * (PLAN-AGENT-03 step 2). Values only: cached results of formulas, no formula is evaluated and no
 * macro runs. Chosen over SheetJS: MIT, on npm (SheetJS ships fixed versions only from its own
 * CDN), and it reads `.xlsx` only, so less parser surface.
 */
export async function readXlsx(bytes: Uint8Array): Promise<XlsxText> {
  const { default: readExcelFile } = await import("read-excel-file/universal")
  try {
    const sheets = await readExcelFile(bytes.slice().buffer)
    return {
      ok: true,
      text: sheets.map(({ sheet, data }) => `[sheet ${JSON.stringify(sheet)}]\n${tableText(data)}`).join("\n\n"),
      sheets: sheets.map(({ sheet }) => sheet),
    }
  } catch {
    return { ok: false, error: "corrupt" }
  }
}
