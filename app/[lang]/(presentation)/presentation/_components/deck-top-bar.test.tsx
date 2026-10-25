import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DeckContext } from "./deck-context"
import { DeckTopBar } from "./deck-top-bar"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/presentation" }))

const props = {
  lang: "en" as const,
  appName: "First Move",
  homeLabel: "First Move, back to the website",
  language: { label: "Language", names: { en: "English", de: "Deutsch" }, short: { en: "EN", de: "DE" } },
  fullscreen: { enterLabel: "Full screen", exitLabel: "Leave full screen" },
}

describe("DeckTopBar", () => {
  it("links home, counts the slides and keeps the slide when the language changes", () => {
    render(
      <DeckContext.Provider value={{ index: 3, count: 10, goTo: () => {} }}>
        <DeckTopBar {...props} />
      </DeckContext.Provider>,
    )
    expect(screen.getByRole("link", { name: "First Move, back to the website" })).toHaveAttribute("href", "/en")
    expect(screen.getByText("04")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "DE, Deutsch" })).toHaveAttribute("href", "/de/presentation#4")
  })
})
