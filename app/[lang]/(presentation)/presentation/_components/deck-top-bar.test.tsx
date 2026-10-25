import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
  theme: { switchToLight: "Switch to light theme", switchToDark: "Switch to dark theme" },
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

  it("offers the light/dark switch (the deck is dark by default)", async () => {
    render(
      <DeckContext.Provider value={{ index: 0, count: 10, goTo: () => {} }}>
        <DeckTopBar {...props} />
      </DeckContext.Provider>,
    )
    const toggle = screen.getByRole("button", { name: "Switch to light theme" })
    await userEvent.click(toggle)
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument()
    document.documentElement.removeAttribute("data-theme")
  })
})
