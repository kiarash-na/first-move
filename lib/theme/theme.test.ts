import { afterEach, describe, expect, it, vi } from "vitest"
import {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  isTheme,
  readStoredTheme,
  storeTheme,
} from "./theme"

const root = document.documentElement

afterEach(() => {
  window.localStorage.clear()
  root.setAttribute("data-theme", "dark")
  vi.restoreAllMocks()
})

describe("theme helpers", () => {
  it("guards theme values", () => {
    expect(isTheme("dark")).toBe(true)
    expect(isTheme("light")).toBe(true)
    expect(isTheme("system")).toBe(false)
    expect(isTheme(null)).toBe(false)
  })

  it("reads and applies the html attribute, defaulting to dark", () => {
    root.removeAttribute("data-theme")
    expect(currentTheme()).toBe("dark")
    applyTheme("light")
    expect(root.getAttribute("data-theme")).toBe("light")
    expect(currentTheme()).toBe("light")
  })

  it("stores and reads the choice, ignoring invalid values", () => {
    expect(readStoredTheme()).toBeNull()
    storeTheme("light")
    expect(readStoredTheme()).toBe("light")
    window.localStorage.setItem(THEME_STORAGE_KEY, "neon")
    expect(readStoredTheme()).toBeNull()
  })

  it("survives blocked storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(readStoredTheme()).toBeNull()
    expect(() => storeTheme("light")).not.toThrow()
  })
})

describe("THEME_INIT_SCRIPT", () => {
  const run = () => new Function(THEME_INIT_SCRIPT)()

  it("applies a stored light theme before paint", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light")
    run()
    expect(root.getAttribute("data-theme")).toBe("light")
  })

  it("keeps the server default for missing or invalid values", () => {
    run()
    expect(root.getAttribute("data-theme")).toBe("dark")
    window.localStorage.setItem(THEME_STORAGE_KEY, "<script>")
    run()
    expect(root.getAttribute("data-theme")).toBe("dark")
  })
})
