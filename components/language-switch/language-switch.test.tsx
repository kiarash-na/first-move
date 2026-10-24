import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { LanguageSwitch } from "./language-switch"

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/dashboard/quick-check/area",
}))

const props = {
  lang: "en" as const,
  label: "Language",
  names: { en: "English", de: "Deutsch" },
  short: { en: "EN", de: "DE" },
}

describe("LanguageSwitch", () => {
  it("links to the same page in each language", () => {
    render(<LanguageSwitch {...props} />)
    expect(screen.getByRole("navigation", { name: "Language" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "DE, Deutsch" })).toHaveAttribute("href", "/de/dashboard/quick-check/area")
    expect(screen.getByRole("link", { name: "EN, English" })).toHaveAttribute("href", "/en/dashboard/quick-check/area")
  })

  it("marks the current language", () => {
    render(<LanguageSwitch {...props} />)
    expect(screen.getByRole("link", { name: "EN, English" })).toHaveAttribute("aria-current", "true")
    expect(screen.getByRole("link", { name: "DE, Deutsch" })).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("link", { name: "DE, Deutsch" })).toHaveAttribute("lang", "de")
  })

  it("stores the choice in NEXT_LOCALE on click", async () => {
    render(<LanguageSwitch {...props} />)
    const link = screen.getByRole("link", { name: "DE, Deutsch" })
    link.addEventListener("click", (event) => event.preventDefault())
    await userEvent.click(link)
    expect(document.cookie).toContain("NEXT_LOCALE=de")
  })

  it("keeps the visible code in the accessible name (label in name)", () => {
    render(<LanguageSwitch {...props} />)
    expect(screen.getByRole("link", { name: "DE, Deutsch" })).toHaveTextContent("DE")
    expect(screen.getByRole("link", { name: "EN, English" })).toHaveTextContent("EN")
  })
})
