import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { DimensionsPanel } from "./dimensions-panel"
import { scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

describe("DimensionsPanel", () => {
  it("shows the bars first and the table on request", async () => {
    const copy = aiScoreCopy("en").results.dimensions
    const { container } = renderResults(<DimensionsPanel score={fixture.score} />)
    // The count comes from the engine, never retyped.
    expect(screen.getByRole("region", { name: `${DIMENSIONS.length} dimensions` })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=dimension-bars]")).not.toBeNull()
    expect(screen.getByText(copy.legend.raw)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: copy.view.table }))
    expect(screen.getByRole("table", { name: copy.table.caption })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=dimension-bars]")).toBeNull()
  })
})
