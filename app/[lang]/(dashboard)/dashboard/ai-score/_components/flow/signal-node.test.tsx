import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { SignalNode } from "./signal-node"

describe("SignalNode", () => {
  it("shows the Quick Check verdict and figures as a fixed signal", async () => {
    renderAiScore(<SignalNode signal={{ level: "further_analysis", heatDensityMwhPerM: 0.734, economicRatio: 0.81 }} />, { store: aiScoreStore(example()).store })
    const node = screen.getByRole("button", { name: /Further analysis required/ })
    expect(node).toHaveAttribute("data-flow-node", "signal:quick-check")
    expect(node).toHaveTextContent("Heat density 0.73 MWh/m")
    await userEvent.click(node)
    const dialog = screen.getByRole("dialog", { name: "Quick Check signal" })
    expect(dialog).toHaveTextContent("Mixed conditions")
    expect(dialog).toHaveTextContent("Economic ratio0.81")
    expect(dialog).toHaveTextContent("The AI never computes it.")
  })

  it("says when there is no complete Quick Check", () => {
    renderAiScore(<SignalNode signal={null} />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("button", { name: /No complete Quick Check/ })).toHaveAttribute("data-level", "none")
  })
})
