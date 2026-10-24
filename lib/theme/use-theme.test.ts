import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { THEME_STORAGE_KEY } from "./theme"
import { useTheme } from "./use-theme"

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.setAttribute("data-theme", "dark")
})

describe("useTheme", () => {
  it("reports the html attribute", () => {
    document.documentElement.setAttribute("data-theme", "light")
    const { result } = renderHook(() => useTheme())
    expect(result.current[0]).toBe("light")
  })

  it("applies and stores a new theme", async () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current[1]("light"))
    await waitFor(() => expect(result.current[0]).toBe("light"))
    expect(document.documentElement.getAttribute("data-theme")).toBe("light")
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
  })

  it("follows attribute changes made elsewhere", async () => {
    const { result } = renderHook(() => useTheme())
    act(() => document.documentElement.setAttribute("data-theme", "light"))
    await waitFor(() => expect(result.current[0]).toBe("light"))
  })
})
