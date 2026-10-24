// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { manualTimers } from "./manual-timers"

describe("manualTimers (test helper)", () => {
  it("runs callbacks in time order only when advanced", () => {
    const timers = manualTimers()
    const calls: string[] = []
    timers.setTimeout(() => calls.push("b"), 20)
    timers.setTimeout(() => calls.push("a"), 10)
    const cancelled = timers.setTimeout(() => calls.push("x"), 5)
    timers.clearTimeout(cancelled)
    timers.advance(9)
    expect(calls).toEqual([])
    timers.advance(11)
    expect(calls).toEqual(["a", "b"])
    expect(timers.pending).toBe(0)
  })

  it("runs timers scheduled by callbacks when they fall due", () => {
    const timers = manualTimers()
    const later = vi.fn()
    timers.setTimeout(() => timers.setTimeout(later, 5), 5)
    timers.advance(9)
    expect(later).not.toHaveBeenCalled()
    timers.advance(1)
    expect(later).toHaveBeenCalledTimes(1)
  })
})
