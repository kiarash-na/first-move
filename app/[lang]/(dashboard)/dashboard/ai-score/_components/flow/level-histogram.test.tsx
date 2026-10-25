import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { LevelHistogram } from "./level-histogram"

describe("LevelHistogram", () => {
  it("lists every level with its name and share, the most likely one marked", () => {
    renderAiScore(<LevelHistogram probabilities={[0.05, 0.1, 0.6, 0.2, 0.05]} label="Probability per level" />, { store: aiScoreStore(example()).store })
    const table = screen.getByRole("table", { name: "Probability per level" })
    const rows = within(table).getAllByRole("row")
    expect(rows).toHaveLength(5)
    expect(rows[2]).toHaveTextContent("2 Specific")
    expect(rows[2]).toHaveTextContent("60%")
    expect(rows[2]).toHaveAttribute("data-top", "true")
    expect(rows[0]).toHaveTextContent("0 Missing")
    expect(rows[0]).toHaveTextContent("5%")
  })
})
