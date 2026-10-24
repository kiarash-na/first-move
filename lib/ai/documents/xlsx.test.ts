// @vitest-environment node
import { describe, expect, it } from "vitest"
import { makeXlsx } from "./test-utils/office"
import { isWorksheet, readXlsx, sheetExtent } from "./xlsx"

describe("sheetExtent", () => {
  it("finds the last row and column with a value", () => {
    const xml = '<sheetData><row r="1"><c r="A1"><v>1</v></c><c r="C1" t="s"><v>0</v></c></row><row r="7"><c r="B7"><v>2</v></c></row></sheetData>'
    expect(sheetExtent(xml)).toEqual({ rows: 7, columns: 3 })
  })

  it("ignores empty self-closing cells but counts row numbers", () => {
    expect(sheetExtent('<row r="2"><c r="XFD2" s="1"/></row><row r="900000"/>')).toEqual({ rows: 900000, columns: 0 })
  })

  it("reads prefixed elements, attributes in any order, long column names", () => {
    // ZZZZ is column ((26 · 27 · 26 + 26) · 26 + 26) = 475,254, far beyond Excel's XFD (16,384).
    expect(sheetExtent('<x:row r="3"><x:c s="1" t="n" r="AA3"><x:v>1</x:v></x:c><x:c r="ZZZZ1"><x:v>1</x:v></x:c></x:row>')).toEqual({
      rows: 3,
      columns: 475_254,
    })
  })

  it("selects worksheet parts only", () => {
    expect(isWorksheet("xl/worksheets/sheet1.xml")).toBe(true)
    expect(isWorksheet("xl/worksheets/_rels/sheet1.xml.rels")).toBe(false)
    expect(isWorksheet("xl/sharedStrings.xml")).toBe(false)
  })
})

describe("readXlsx", () => {
  it("reads every sheet's values as text", async () => {
    const bytes = await makeXlsx([
      { name: "Buildings", rows: [["Type", "Count", "Connected"], ["Residential", 120, true], ["Office", 3.5, false]] },
      { name: "Sources", rows: [["Geothermal", "high"]] },
    ])
    expect(await readXlsx(bytes)).toEqual({
      ok: true,
      text: '[sheet "Buildings"]\nType\tCount\tConnected\nResidential\t120\tTRUE\nOffice\t3.5\tFALSE\n\n[sheet "Sources"]\nGeothermal\thigh',
      sheets: ["Buildings", "Sources"],
    })
  })

  it("reports broken workbooks as corrupt", async () => {
    expect(await readXlsx(new TextEncoder().encode("not a workbook"))).toEqual({ ok: false, error: "corrupt" })
  })
})
