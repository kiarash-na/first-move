import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { KEYS } from "@/lib/assistant/keys/registry"
import { useMaskedKey } from "./use-masked-key"

afterEach(() => {
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
})

describe("useMaskedKey", () => {
  it("follows the key in memory, masked, and never returns the key", () => {
    const { result } = renderHook(() => useMaskedKey("openrouter"))
    expect(result.current).toBeNull()
    const key = `sk-or-v1-${"9d".repeat(32)}`
    act(() => KEYS.openrouter.set(key))
    expect(result.current).toBe(KEYS.openrouter.masked())
    expect(result.current).not.toContain(key.slice(0, 20))
    act(() => KEYS.openrouter.clear())
    expect(result.current).toBeNull()
  })
})
