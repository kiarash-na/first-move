import { afterEach, describe, expect, it } from "vitest"
import { KEYS } from "../keys/registry"
import { firstProvider } from "./first-provider"

const GATEWAY_KEY = "vck_test_00001234"
const OPENROUTER_KEY = `sk-or-v1-${"ab".repeat(32)}`

afterEach(() => {
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
})

describe("firstProvider", () => {
  it("defaults to OpenRouter when no key is in memory", () => {
    expect(firstProvider()).toBe("openrouter")
  })

  it("follows a key in memory, and prefers OpenRouter when both are set", () => {
    KEYS.gateway.set(GATEWAY_KEY)
    expect(firstProvider()).toBe("gateway")
    KEYS.openrouter.set(OPENROUTER_KEY)
    expect(firstProvider()).toBe("openrouter")
    KEYS.gateway.clear()
    expect(firstProvider()).toBe("openrouter")
  })
})
