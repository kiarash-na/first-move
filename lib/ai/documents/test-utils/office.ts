import { makeZip, type FixtureEntry } from "./zip"

const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
const RELS = "http://schemas.openxmlformats.org/package/2006/relationships"
const DOC_RELS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function contentTypes(overrides: readonly [part: string, type: string][]): string {
  const items = overrides.map(([part, type]) => `<Override PartName="${part}" ContentType="${type}"/>`).join("")
  return `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${items}</Types>`
}

const rootRels = (target: string) =>
  `${XML}<Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="${DOC_RELS}/officeDocument" Target="${target}"/></Relationships>`

/** A minimal Word document with one paragraph per entry. */
export function makeDocx(paragraphs: readonly string[], extra: readonly FixtureEntry[] = []): Promise<Uint8Array> {
  const body = paragraphs.map((text) => `<w:p><w:r><w:t xml:space="preserve">${escape(text)}</w:t></w:r></w:p>`).join("")
  return makeZip([
    {
      name: "[Content_Types].xml",
      data: contentTypes([["/word/document.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"]]),
    },
    { name: "_rels/.rels", data: rootRels("word/document.xml") },
    {
      name: "word/document.xml",
      data: `${XML}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`,
    },
    ...extra,
  ])
}

export type FixtureCell = string | number | boolean | null

export interface FixtureSheet {
  name: string
  rows: readonly (readonly FixtureCell[])[]
  /** Raw `<sheetData>` content instead of `rows` (for crafted sheets). */
  sheetData?: string
}

const columnName = (index: number): string => (index >= 26 ? columnName(Math.floor(index / 26) - 1) : "") + String.fromCharCode(65 + (index % 26))

function cell(value: FixtureCell, ref: string): string {
  if (value === null) return ""
  if (typeof value === "number") return `<c r="${ref}"><v>${value}</v></c>`
  if (typeof value === "boolean") return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`
  return `<c r="${ref}" t="inlineStr"><is><t>${escape(value)}</t></is></c>`
}

function sheetXml({ rows, sheetData }: FixtureSheet): string {
  const data =
    sheetData ??
    rows.map((row, r) => `<row r="${r + 1}">${row.map((value, c) => cell(value, `${columnName(c)}${r + 1}`)).join("")}</row>`).join("")
  return `${XML}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${data}</sheetData></worksheet>`
}

/** A minimal Excel workbook with inline strings, numbers and booleans. */
export function makeXlsx(sheets: readonly FixtureSheet[], extra: readonly FixtureEntry[] = []): Promise<Uint8Array> {
  const sheetType = "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"
  const list = sheets.map((sheet, index) => `<sheet name="${escape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")
  const rels = sheets
    .map((_, index) => `<Relationship Id="rId${index + 1}" Type="${DOC_RELS}/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`)
    .join("")
  return makeZip([
    {
      name: "[Content_Types].xml",
      data: contentTypes([
        ["/xl/workbook.xml", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"],
        ...sheets.map((_, index): [string, string] => [`/xl/worksheets/sheet${index + 1}.xml`, sheetType]),
      ]),
    },
    { name: "_rels/.rels", data: rootRels("xl/workbook.xml") },
    {
      name: "xl/workbook.xml",
      data: `${XML}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${DOC_RELS}"><sheets>${list}</sheets></workbook>`,
    },
    { name: "xl/_rels/workbook.xml.rels", data: `${XML}<Relationships xmlns="${RELS}">${rels}</Relationships>` },
    ...sheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, data: sheetXml(sheet) })),
    ...extra,
  ])
}
