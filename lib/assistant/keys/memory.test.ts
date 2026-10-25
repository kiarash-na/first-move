import { describe, expect, it, vi } from "vitest"
import { createKeyMemory } from "./memory"

describe("key memory", () => {
  it("holds a trimmed key, masks it, notifies and forgets it", () => {
    const memory = createKeyMemory()
    const listener = vi.fn()
    const stop = memory.subscribe(listener)
    expect(memory.read()).toBeNull()
    expect(memory.masked()).toBeNull()
    memory.set("  sk-or-v1-abcdefabcdef9f2c ")
    expect(memory.read()).toBe("sk-or-v1-abcdefabcdef9f2c")
    expect(memory.masked()).toBe("…9f2c")
    memory.clear()
    expect(memory.read()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)
    stop()
    memory.set("x-key-after-stop")
    expect(listener).toHaveBeenCalledTimes(2)
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
})
