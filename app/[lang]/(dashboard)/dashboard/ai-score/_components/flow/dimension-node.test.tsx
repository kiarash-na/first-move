import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { DimensionNode } from "./dimension-node"

describe("DimensionNode", () => {
  it("shows the points, the part a cap cut off and the cap", async () => {
    renderAiScore(<DimensionNode dimension={{ id: "participation", weight: 0.15, score: 0.5, raw: 0.62, sd: 0.04, cap: 2 }} />, { store: aiScoreStore(example()).store })
    const node = screen.getByRole("button", { name: /Participation and commitment/ })
    expect(node).toHaveTextContent("50")
    expect(node).toHaveTextContent("Capped at level 2")
    expect(node.querySelector("[data-slot='cut']")).not.toBeNull()
    await userEvent.click(node)
    const dialog = screen.getByRole("dialog", { name: "Participation and commitment" })
    expect(dialog).toHaveTextContent("Weight15%")
    expect(dialog).toHaveTextContent("Before caps62 of 100")
    expect(dialog).toHaveTextContent("After caps50 of 100")
    expect(dialog).toHaveTextContent("± 4")
  })

  it("draws no cut without a cap", () => {
    renderAiScore(<DimensionNode dimension={{ id: "value", weight: 0.15, score: 0.7, raw: 0.7, sd: 0.03, cap: null }} />, { store: aiScoreStore(example()).store })
    const node = screen.getByRole("button", { name: /Customer value/ })
    expect(node.querySelector("[data-slot='cut']")).toBeNull()
    expect(node).not.toHaveTextContent("Capped")
  })
})
