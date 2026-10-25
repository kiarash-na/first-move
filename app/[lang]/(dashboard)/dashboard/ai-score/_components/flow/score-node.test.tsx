import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { ScoreNode } from "./score-node"

describe("ScoreNode", () => {
  it("shows the score rounded to 5 with its band and label", async () => {
    renderAiScore(<ScoreNode result={{ score: 63.4, sd: 4.2, level: "promising", capped: true, dimensions: [] }} />, { store: aiScoreStore(example()).store })
    const node = screen.getByRole("button", { name: /65 ± 4/ })
    expect(node).toHaveTextContent("Promising")
    expect(node).toHaveAttribute("data-capped", "true")
    await userEvent.click(node)
    const dialog = screen.getByRole("dialog", { name: "AI Plan Score: 65 ± 4" })
    expect(dialog).toHaveTextContent("A must-have check failed")
    expect(dialog).toHaveTextContent("rounded to 5 points")
  })
})
