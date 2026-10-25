import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { setAcknowledged } from "./acknowledgement"
import { DataDisclosure } from "./data-disclosure"

const copy = aiScoreCopy().setup.data

afterEach(() => setAcknowledged(false))

describe("DataDisclosure (D-72)", () => {
  it("shows what is sent and to whom until it is confirmed, in memory only", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    renderAiScore(<DataDisclosure />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("button", { name: copy.title })).toHaveAttribute("aria-expanded", "true")
    for (const point of Object.values(copy.points)) expect(screen.getByText(point)).toBeVisible()
    const box = screen.getByRole("checkbox", { name: copy.ack })
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(box).toHaveAccessibleDescription(copy.ackNote)
    expect(setItem).not.toHaveBeenCalled()
    setItem.mockRestore()
  })

  it("starts collapsed once confirmed", () => {
    setAcknowledged(true)
    renderAiScore(<DataDisclosure />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("button", { name: copy.title })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("checkbox", { name: copy.ack })).toBeChecked()
  })
})
