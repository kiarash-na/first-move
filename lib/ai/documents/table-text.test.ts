import { describe, expect, it } from "vitest"
import { tableText } from "./table-text"

describe("tableText", () => {
  it("writes one line per row with tabs between cells", () => {
    expect(tableText([["Type", "Count", "Area m²"], ["Residential", 120, 15000.5]])).toBe("Type\tCount\tArea m²\nResidential\t120\t15000.5")
  })

  it("writes booleans, ISO dates and empty cells", () => {
    expect(tableText([[true, false, null, new Date(Date.UTC(2026, 9, 24)), new Date(Date.UTC(2026, 9, 24, 13, 5))]])).toBe(
      "TRUE\tFALSE\t\t2026-10-24\t2026-10-24T13:05:00.000Z",
    )
  })

  it("drops empty rows and trailing empty cells, flattens whitespace inside cells", () => {
    expect(tableText([["a", "", null], [null, ""], ["multi\nline\tcell", undefined]])).toBe("a\nmulti line cell")
  })
})
