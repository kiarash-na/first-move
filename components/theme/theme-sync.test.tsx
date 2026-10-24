import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { THEME_STORAGE_KEY } from "@/lib/theme/theme"
import { ThemeSync } from "./theme-sync"

const root = document.documentElement

afterEach(() => {
  window.localStorage.clear()
  root.setAttribute("data-theme", "dark")
})

describe("ThemeSync", () => {
  it("re-applies the stored theme after mount", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light")
    render(<ThemeSync />)
    expect(root).toHaveAttribute("data-theme", "light")
  })

  it("keeps the default without a stored theme", () => {
    render(<ThemeSync />)
    expect(root).toHaveAttribute("data-theme", "dark")
  })

  it("follows changes made in another tab", () => {
    render(<ThemeSync />)
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: "light" }))
    })
    expect(root).toHaveAttribute("data-theme", "light")
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "other", newValue: "dark" }))
    })
    expect(root).toHaveAttribute("data-theme", "light")
  })
})
