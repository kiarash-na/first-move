import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { FlowHow } from "./flow-how"

describe("FlowHow (D-33)", () => {
  it("explains every step of the flow on demand", async () => {
    const copy = aiScoreCopy().flow.how
    renderAiScore(<FlowHow />, { store: aiScoreStore(example()).store })
    const trigger = screen.getByRole("button", { name: copy.title })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    expect(screen.getByText(/E = Σ k · p\(k\)/)).toBeVisible()
    expect(screen.getByText(copy.aggregate)).toBeVisible()
    expect(screen.getByText(copy.report)).toBeVisible()
  })
})
