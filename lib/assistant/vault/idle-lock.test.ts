import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { IDLE_LOCK_MS, startIdleLock } from "./idle-lock"

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("idle lock (D-50)", () => {
  it("locks after 30 minutes without use", () => {
    expect(IDLE_LOCK_MS).toBe(30 * 60 * 1000)
    const onLock = vi.fn()
    startIdleLock(onLock, IDLE_LOCK_MS, window)
    vi.advanceTimersByTime(IDLE_LOCK_MS - 1)
    expect(onLock).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onLock).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(IDLE_LOCK_MS * 2)
    expect(onLock).toHaveBeenCalledTimes(1)
  })

  it("starts again with every key or pointer press and with touch()", () => {
    const onLock = vi.fn()
    const lock = startIdleLock(onLock, IDLE_LOCK_MS, window)
    vi.advanceTimersByTime(IDLE_LOCK_MS - 1000)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }))
    vi.advanceTimersByTime(IDLE_LOCK_MS - 1000)
    window.dispatchEvent(new Event("pointerdown"))
    vi.advanceTimersByTime(IDLE_LOCK_MS - 1000)
    lock.touch()
    vi.advanceTimersByTime(IDLE_LOCK_MS - 1000)
    expect(onLock).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(onLock).toHaveBeenCalledTimes(1)
  })

  it("does nothing once stopped", () => {
    const onLock = vi.fn()
    startIdleLock(onLock, IDLE_LOCK_MS, window).stop()
    vi.advanceTimersByTime(IDLE_LOCK_MS * 2)
    expect(onLock).not.toHaveBeenCalled()
  })
})
