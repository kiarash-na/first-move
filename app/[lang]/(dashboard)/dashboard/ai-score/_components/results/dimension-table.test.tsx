import { screen, within } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"
import { DimensionTable } from "./dimension-table"
import { CAPPED, scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let capped: Scored
beforeAll(async () => {
  capped = await scored(CAPPED)
})

describe("DimensionTable", () => {
  it("lists every dimension with the engine's numbers and the score as the total", () => {
    renderResults(<DimensionTable score={capped.score} />)
    const copy = aiScoreCopy("en")
    const table = screen.getByRole("table", { name: copy.results.dimensions.table.caption })
    const governance = capped.score.dimensions.find((dimension) => dimension.id === "governance")!
    const row = within(table).getByRole("rowheader", { name: copy.labels.dimensions.governance.name }).closest("tr")!
    const cells = within(row).getAllByRole("cell").map((cell) => cell.textContent)
    expect(cells).toEqual([
      String(Math.round(governance.score * 100)),
      String(Math.round(governance.raw * 100)),
      "Level 2 (50)",
      String(Math.round(governance.sd * 100)),
      "20%",
      (governance.weight * governance.score * 100).toFixed(1),
    ])
    const total = within(table).getByRole("rowheader", { name: copy.results.dimensions.table.total }).closest("tr")!
    expect(total).toHaveTextContent("100%")
    expect(total).toHaveTextContent(capped.score.score.toFixed(1))
  })

  it("adds up: the weighted points sum to the AI Plan Score", () => {
    const sum = capped.score.dimensions.reduce((total, dimension) => total + dimension.weight * dimension.score * 100, 0)
    expect(sum).toBeCloseTo(capped.score.score, 1)
  })

  it("uses German number formats", () => {
    renderResults(<DimensionTable score={capped.score} />, { lang: "de" })
    expect(screen.getByRole("table")).toHaveTextContent(capped.score.score.toFixed(1).replace(".", ","))
  })
})
