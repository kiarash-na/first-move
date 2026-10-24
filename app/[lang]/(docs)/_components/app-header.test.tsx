import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/common.json"
import { AppHeader } from "./app-header"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/docs" }))

describe("AppHeader", () => {
  it("renders brand, extra actions, language switch and theme toggle", () => {
    render(
      <AppHeader lang="en" common={en}>
        <button type="button">Export</button>
      </AppHeader>,
    )
    expect(screen.getByRole("link", { name: en.app.homeLabel })).toHaveAttribute("href", "/en")
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: en.language.label })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: en.theme.switchToLight })).toBeInTheDocument()
  })
})
