import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { setAcknowledged, useAcknowledged } from "./acknowledgement"

afterEach(() => setAcknowledged(false))

describe("acknowledgement (memory only)", () => {
  it("is false until confirmed and stays for the tab, without touching storage", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    const { result, unmount } = renderHook(() => useAcknowledged())
    expect(result.current).toBe(false)
    act(() => setAcknowledged(true))
    expect(result.current).toBe(true)
    unmount()
    expect(renderHook(() => useAcknowledged()).result.current).toBe(true)
    expect(setItem).not.toHaveBeenCalled()
    setItem.mockRestore()
  })
})
