import { afterEach, describe, expect, it, vi } from "vitest"
import { clearGatewayKey, isPlausibleGatewayKey, maskedGatewayKey, readGatewayKey, setGatewayKey, subscribeGatewayKey } from "./key"

afterEach(() => clearGatewayKey())

describe("Gateway key in memory (D-71)", () => {
  it("keeps the key only in memory and shows the last four characters", () => {
    const listener = vi.fn()
    const stop = subscribeGatewayKey(listener)
    setGatewayKey("  vck_abcdefghijklmnopqrstuvwxyz1234  ")
    expect(readGatewayKey()).toBe("vck_abcdefghijklmnopqrstuvwxyz1234")
    expect(maskedGatewayKey()).toBe("…1234")
    clearGatewayKey()
    expect(readGatewayKey()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)
    stop()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })

  it("rejects what cannot be a key", () => {
    expect(isPlausibleGatewayKey("")).toBe(false)
    expect(isPlausibleGatewayKey("short")).toBe(false)
    expect(isPlausibleGatewayKey("vck_abc def ghi jkl mno pqr")).toBe(false)
    expect(isPlausibleGatewayKey("vck_abcdefghijklmnopqrstuvwxyz")).toBe(true)
  })
})
