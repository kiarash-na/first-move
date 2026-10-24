import { afterEach, describe, expect, it, vi } from "vitest"
import { installUnloadGuard, type UnloadGuard } from "./unload-guard"

let guard: UnloadGuard | null = null

afterEach(() => {
  guard?.dispose()
  guard = null
})

const beforeUnload = () => {
  const event = new Event("beforeunload", { cancelable: true }) as BeforeUnloadEvent
  window.dispatchEvent(event)
  return event
}

describe("unload guard", () => {
  it("does nothing while no write is pending", () => {
    const flush = vi.fn(() => false)
    guard = installUnloadGuard({ target: window, flush })
    expect(beforeUnload().defaultPrevented).toBe(false)
    window.dispatchEvent(new Event("pagehide"))
    expect(flush).not.toHaveBeenCalled()
  })

  it("flushes on leave and lets the page go when the changes are kept", () => {
    const flush = vi.fn(() => true)
    guard = installUnloadGuard({ target: window, flush })
    guard.setArmed(true)
    expect(beforeUnload().defaultPrevented).toBe(false)
    expect(flush).toHaveBeenCalledTimes(1)
  })

  it("asks the user to stay when pending changes could not be kept anywhere", () => {
    guard = installUnloadGuard({ target: window, flush: () => false })
    guard.setArmed(true)
    expect(beforeUnload().defaultPrevented).toBe(true)
    guard.setArmed(false)
    expect(beforeUnload().defaultPrevented).toBe(false)
  })

  it("flushes when the page is hidden", () => {
    const flush = vi.fn(() => true)
    guard = installUnloadGuard({ target: window, flush })
    guard.setArmed(true)
    window.dispatchEvent(new Event("pagehide"))
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
    document.dispatchEvent(new Event("visibilitychange"))
    visibility.mockRestore()
    expect(flush).toHaveBeenCalledTimes(2)
  })

  it("removes every listener on dispose", () => {
    const flush = vi.fn(() => false)
    guard = installUnloadGuard({ target: window, flush })
    guard.setArmed(true)
    guard.dispose()
    expect(beforeUnload().defaultPrevented).toBe(false)
    window.dispatchEvent(new Event("pagehide"))
    expect(flush).not.toHaveBeenCalled()
  })
})
