import { afterEach, describe, expect, it } from "vitest"
import { readGatewayKey } from "../gateway/key"
import { isPlausibleKey, KEYS } from "./registry"

afterEach(() => {
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
})

describe("keys per provider", () => {
  it("shares the Gateway key with the AI Plan Score", () => {
    KEYS.gateway.set("vck_shared_key_abcdefghijklmnop1234")
    expect(readGatewayKey()).toBe("vck_shared_key_abcdefghijklmnop1234")
    expect(KEYS.gateway.masked()).toBe("…1234")
    expect(KEYS.openrouter.read()).toBeNull()
  })

  it("checks the key format of each provider", () => {
    expect(isPlausibleKey.gateway("vck_abcdefghijklmnopqrstuvwxyz")).toBe(true)
    expect(isPlausibleKey.openrouter("vck_abcdefghijklmnopqrstuvwxyz")).toBe(false)
    expect(isPlausibleKey.openrouter(`sk-or-v1-${"0f".repeat(32)}`)).toBe(true)
  })
})
