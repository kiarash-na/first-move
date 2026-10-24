import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { THEME_STORAGE_KEY } from "@/lib/theme/theme"
import { ThemeToggle } from "./theme-toggle"

const labels = { switchToLight: "Switch to light theme", switchToDark: "Switch to dark theme" }

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.setAttribute("data-theme", "dark")
})

describe("ThemeToggle", () => {
  it("switches between dark and light and stores the choice", async () => {
    document.documentElement.setAttribute("data-theme", "dark")
    render(<ThemeToggle labels={labels} />)

    await userEvent.click(screen.getByRole("button", { name: labels.switchToLight }))
    expect(document.documentElement).toHaveAttribute("data-theme", "light")
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")

    await userEvent.click(await screen.findByRole("button", { name: labels.switchToDark }))
    expect(document.documentElement).toHaveAttribute("data-theme", "dark")
  })
})
