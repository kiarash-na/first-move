import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useSlideHash } from "./use-slide-hash"

beforeEach(() => window.history.replaceState(null, "", "/en/presentation"))

describe("useSlideHash", () => {
  it("reads the slide from the hash, 1-based, and falls back to the first", () => {
    window.history.replaceState(null, "", "/en/presentation#4")
    expect(renderHook(() => useSlideHash(10)).result.current[0]).toBe(3)
    window.history.replaceState(null, "", "/en/presentation#42")
    expect(renderHook(() => useSlideHash(10)).result.current[0]).toBe(0)
  })

  it("writes the hash without a new history entry and clamps to the deck", () => {
    const { result } = renderHook(() => useSlideHash(10))
    const length = window.history.length
    act(() => result.current[1](5))
    expect(window.location.hash).toBe("#6")
    expect(result.current[0]).toBe(5)
    act(() => result.current[1](99))
    expect(window.location.hash).toBe("#10")
    expect(window.history.length).toBe(length)
  })
})
