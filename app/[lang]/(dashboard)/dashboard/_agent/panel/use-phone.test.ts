import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PHONE_QUERY, usePhone } from "./use-phone"

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubMatchMedia(initial: boolean) {
  const listeners = new Set<() => void>()
  const list = {
    matches: initial,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }
  const matchMedia = vi.fn(() => list)
  vi.stubGlobal("matchMedia", matchMedia)
  return {
    matchMedia,
    change(matches: boolean) {
      list.matches = matches
      for (const listener of listeners) listener()
    },
  }
}

describe("usePhone", () => {
  it("follows the viewport below md", () => {
    const media = stubMatchMedia(true)
    const { result } = renderHook(() => usePhone())
    expect(media.matchMedia).toHaveBeenCalledWith(PHONE_QUERY)
    expect(result.current).toBe(true)
    act(() => media.change(false))
    expect(result.current).toBe(false)
  })

  it("is false where matchMedia is missing", () => {
    vi.stubGlobal("matchMedia", undefined)
    expect(renderHook(() => usePhone()).result.current).toBe(false)
  })
})
