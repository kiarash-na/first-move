// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { browserTimers, createDebouncer } from "./debounce"

afterEach(() => vi.useRealTimers())

describe("debouncer", () => {
  it("runs once, after the last call has waited long enough", () => {
    vi.useFakeTimers()
    const debouncer = createDebouncer()
    const callback = vi.fn()
    debouncer.run(callback, 400)
    vi.advanceTimersByTime(300)
    debouncer.run(callback, 400)
    vi.advanceTimersByTime(399)
    expect(callback).not.toHaveBeenCalled()
    expect(debouncer.waiting).toBe(true)
    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(debouncer.waiting).toBe(false)
  })

  it("can be cancelled", () => {
    vi.useFakeTimers()
    const debouncer = createDebouncer(browserTimers)
    const callback = vi.fn()
    debouncer.run(callback, 400)
    debouncer.cancel()
    debouncer.cancel()
    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
  })
})
