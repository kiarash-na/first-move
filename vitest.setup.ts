import "@testing-library/jest-dom/vitest"
import "fake-indexeddb/auto"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

// jsdom gaps that Radix UI and Recharts rely on (skipped in `@vitest-environment node` files).
if (typeof Element !== "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
}

afterEach(() => {
  cleanup()
})
