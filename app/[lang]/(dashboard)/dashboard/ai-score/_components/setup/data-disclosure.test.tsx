import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { Provider } from "@/lib/assistant/providers/types"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { setAcknowledged } from "./acknowledgement"
import { DataDisclosure } from "./data-disclosure"

const copy = aiScoreCopy().setup.data

/** The text of a point for a provider: some points are shared, the others keyed by provider. */
const text = (value: string | Record<Provider, string>, provider: Provider) => (typeof value === "string" ? value : value[provider])

afterEach(() => setAcknowledged(false))

describe("DataDisclosure (D-72)", () => {
  it("shows what is sent and to whom until it is confirmed, in memory only", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    renderAiScore(<DataDisclosure provider="gateway" />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("button", { name: copy.title })).toHaveAttribute("aria-expanded", "true")
    for (const point of Object.values(copy.points)) expect(screen.getByText(text(point, "gateway"))).toBeVisible()
    const box = screen.getByRole("checkbox", { name: copy.ack })
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(box).toBeChecked()
    expect(box).toHaveAccessibleDescription(copy.ackNote)
    expect(setItem).not.toHaveBeenCalled()
    setItem.mockRestore()
  })

  it("names OpenRouter as the processor when that provider is chosen", () => {
    renderAiScore(<DataDisclosure provider="openrouter" />, { store: aiScoreStore(example()).store })
    for (const point of Object.values(copy.points)) expect(screen.getByText(text(point, "openrouter"))).toBeVisible()
  })

  it("starts collapsed once confirmed", () => {
    setAcknowledged(true)
    renderAiScore(<DataDisclosure provider="gateway" />, { store: aiScoreStore(example()).store })
    expect(screen.getByRole("button", { name: copy.title })).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByRole("checkbox", { name: copy.ack })).toBeChecked()
  })
})
