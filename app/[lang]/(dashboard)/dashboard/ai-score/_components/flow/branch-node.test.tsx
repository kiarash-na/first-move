import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { BranchNode } from "./branch-node"
import type { BranchView } from "./flow-model"

const base: BranchView = {
  kind: "branch",
  id: "source-type",
  turn: 1,
  choice: "groundwater",
  probabilities: { groundwater: 0.7, borehole: 0.1, "surface-water": 0.05, wastewater: 0.05, "waste-heat": 0.05, air: 0.03, unclear: 0.02 },
  followUp: "water-permit",
}
const show = (node: Partial<BranchView>) => renderAiScore(<BranchNode node={{ ...base, ...node }} />, { store: aiScoreStore(example()).store })

describe("BranchNode", () => {
  it("shows the chosen option and how sure Jev was", () => {
    show({})
    const node = screen.getByRole("button", { name: /Main heat source/ })
    expect(node).toHaveTextContent("Groundwater")
    expect(node).toHaveTextContent("70% sure")
    expect(node).toHaveAttribute("data-follow-up", "water-permit")
  })

  it("lists every option with its probability and the follow-up it opened", async () => {
    show({})
    await userEvent.click(screen.getByRole("button", { name: /Main heat source/ }))
    const dialog = screen.getByRole("dialog", { name: "Main heat source" })
    const items = within(dialog).getAllByRole("listitem")
    expect(items).toHaveLength(7)
    expect(items[0]).toHaveAttribute("data-chosen", "true")
    expect(items[0]).toHaveTextContent("Groundwater70%")
    expect(dialog).toHaveTextContent("Permit route for water or ground")
  })

  it("shows a declined branch without a follow-up", async () => {
    show({ choice: "refused", probabilities: {}, followUp: null })
    const node = screen.getByRole("button", { name: /Main heat source/ })
    expect(node).toHaveTextContent("No answer")
    expect(node).not.toHaveTextContent("sure")
    await userEvent.click(node)
    expect(screen.getByRole("dialog")).toHaveTextContent("None")
  })
})
