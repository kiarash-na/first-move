import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/presentation.json"
import { DECK_BOOT_STYLE_ID } from "@/lib/presentation/boot"
import { Deck, type DeckSlide } from "./deck"
import { useDeck } from "./deck-context"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/presentation" }))

function Jump() {
  const { goTo } = useDeck()
  return (
    <button type="button" onClick={() => goTo(2, { focus: true })}>
      Jump
    </button>
  )
}

const slides: DeckSlide[] = [
  { id: "why", title: "Why First Move", content: <Jump /> },
  { id: "challenge", title: "The challenge", content: <p>Two</p> },
  { id: "quickCheck", title: "Quick Check", content: <p>Three</p> },
]

const language = { label: "Language", names: { en: "English", de: "Deutsch" }, short: { en: "EN", de: "DE" } }

function setup() {
  return render(<Deck lang="en" appName="First Move" homeLabel={en.deck.home} language={language} copy={en.deck} slides={slides} />)
}

const section = (name: RegExp) => screen.getByRole("region", { name })

beforeEach(() => window.history.replaceState(null, "", "/en/presentation"))
afterEach(() => document.getElementById(DECK_BOOT_STYLE_ID)?.remove())

describe("Deck", () => {
  it("labels every slide as a slide of the deck and shows the first", () => {
    setup()
    const first = section(/^1 of 3: Why First Move/)
    expect(first).toHaveAttribute("aria-roledescription", "slide")
    expect(first).toHaveAttribute("data-state", "active")
    expect(section(/^2 of 3/)).toHaveAttribute("data-state", "after")
    expect(section(/^2 of 3/)).toHaveAttribute("inert")
    expect(screen.getByRole("heading", { level: 1, name: en.deck.label })).toBeInTheDocument()
  })

  it("opens the slide in the hash", () => {
    window.history.replaceState(null, "", "/en/presentation#3")
    setup()
    expect(section(/^3 of 3/)).toHaveAttribute("data-state", "active")
    expect(section(/^1 of 3/)).toHaveAttribute("data-state", "before")
  })

  it("moves with the keyboard, writes the hash and announces the slide", async () => {
    setup()
    await userEvent.keyboard("{ArrowRight}")
    expect(window.location.hash).toBe("#2")
    expect(section(/^2 of 3/)).toHaveAttribute("data-state", "active")
    expect(screen.getByText("Slide 2 of 3: The challenge")).toBeInTheDocument()
    await userEvent.keyboard("{End}")
    expect(window.location.hash).toBe("#3")
    await userEvent.keyboard("{ArrowRight}")
    expect(window.location.hash).toBe("#3")
    await userEvent.keyboard("{Home}")
    expect(window.location.hash).toBe("#1")
  })

  it("follows the back and forward buttons (hashchange)", () => {
    setup()
    act(() => {
      window.history.replaceState(null, "", "/en/presentation#2")
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    })
    expect(section(/^2 of 3/)).toHaveAttribute("data-state", "active")
  })

  it("moves focus to the slide it jumps to, so focus is never left on a hidden slide", async () => {
    setup()
    await userEvent.click(screen.getByRole("button", { name: "Jump" }))
    expect(section(/^3 of 3/)).toHaveFocus()
  })

  it("removes the boot script's style once it shows the deep-linked slide itself", () => {
    const style = document.createElement("style")
    style.id = DECK_BOOT_STYLE_ID
    document.head.appendChild(style)
    setup()
    expect(document.getElementById(DECK_BOOT_STYLE_ID)).toBeNull()
  })

  it("shows the progress as a share of the deck", async () => {
    const { container } = setup()
    expect(container.querySelector<HTMLElement>(".deck")?.style.getPropertyValue("--deck-progress")).toBe(String(1 / 3))
    await userEvent.click(screen.getByRole("button", { name: en.deck.next }))
    expect(container.querySelector<HTMLElement>(".deck")?.style.getPropertyValue("--deck-progress")).toBe(String(2 / 3))
  })
})
