export type CsvDelimiter = "\t" | ";" | ","

/** Tried in this order: a semicolon before a comma, because German CSV uses the comma as decimal. */
const DELIMITERS: readonly CsvDelimiter[] = ["\t", ";", ","]
const SAMPLE_CHARS = 64 * 1024
/** Share of sample rows that must have the most common field count. */
const CONSISTENCY = 0.8

/** Parses CSV as RFC 4180 describes it: quoted fields, doubled quotes, line breaks inside quotes, CRLF or LF. */
export function parseCsv(text: string, delimiter: CsvDelimiter): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (quoted) {
      if (char !== '"') field += char
      else if (text[index + 1] === '"') {
        field += '"'
        index++
      } else quoted = false
    } else if (char === '"' && field === "") quoted = true
    else if (char === delimiter) {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else field += char
  }
  if (field !== "" || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function sample(text: string): string {
  if (text.length <= SAMPLE_CHARS) return text
  const cut = text.lastIndexOf("\n", SAMPLE_CHARS)
  return text.slice(0, cut > 0 ? cut : SAMPLE_CHARS)
}

/**
 * The delimiter of a CSV text, or null when it does not look like one: at least two rows, and
 * most of them with the same field count of two or more.
 */
export function detectDelimiter(text: string): CsvDelimiter | null {
  const head = sample(text)
  for (const delimiter of DELIMITERS) {
    const rows = parseCsv(head, delimiter).filter((row) => row.some((field) => field.trim() !== ""))
    if (rows.length < 2) continue
    const counts = new Map<number, number>()
    for (const row of rows) counts.set(row.length, (counts.get(row.length) ?? 0) + 1)
    const [width, frequency] = [...counts].sort((a, b) => b[1] - a[1])[0]
    if (width >= 2 && frequency >= rows.length * CONSISTENCY) return delimiter
  }
  return null
}
