import { afterEach, describe, expect, it, vi } from "vitest"
import {
  SIDEBAR_ATTRIBUTE,
  SIDEBAR_COLLAPSED,
  SIDEBAR_INIT_SCRIPT,
  SIDEBAR_STORAGE_KEY,
  applySidebar,
  isSidebarCollapsed,
  readStoredSidebar,
  storeSidebar,
} from "./sidebar-state"

const root = document.documentElement

function blockStorage() {
  for (const method of ["getItem", "setItem", "removeItem"] as const) {
    vi.spyOn(Storage.prototype, method).mockImplementation(() => {
      throw new Error("blocked")
    })
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
  root.removeAttribute(SIDEBAR_ATTRIBUTE)
})

describe("sidebar state (D-59)", () => {
  it("uses the key the Cookie Policy lists, namespaced like every other key", () => {
    expect(SIDEBAR_STORAGE_KEY).toBe("first-move:sidebar")
    expect(SIDEBAR_COLLAPSED).toBe("collapsed")
  })

  it("reads and applies the html attribute; expanded is its absence", () => {
    expect(isSidebarCollapsed()).toBe(false)
    applySidebar(true)
    expect(root.getAttribute(SIDEBAR_ATTRIBUTE)).toBe("collapsed")
    expect(isSidebarCollapsed()).toBe(true)
    applySidebar(false)
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
    expect(isSidebarCollapsed()).toBe(false)
  })

  it("treats any other attribute value as expanded", () => {
    root.setAttribute(SIDEBAR_ATTRIBUTE, "wide")
    expect(isSidebarCollapsed()).toBe(false)
  })

  it("stores 'collapsed' and removes the key when expanded, so it means exactly that", () => {
    expect(readStoredSidebar()).toBe(false)
    storeSidebar(true)
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("collapsed")
    expect(readStoredSidebar()).toBe(true)
    storeSidebar(false)
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBeNull()
    expect(readStoredSidebar()).toBe(false)
  })

  it("ignores stored values it does not know", () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "true")
    expect(readStoredSidebar()).toBe(false)
  })

  it("survives blocked storage", () => {
    blockStorage()
    expect(readStoredSidebar()).toBe(false)
    expect(() => storeSidebar(true)).not.toThrow()
    expect(() => storeSidebar(false)).not.toThrow()
  })
})

describe("SIDEBAR_INIT_SCRIPT", () => {
  const run = () => new Function(SIDEBAR_INIT_SCRIPT)()

  it("collapses the rail before paint when it was stored collapsed", () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "collapsed")
    run()
    expect(root.getAttribute(SIDEBAR_ATTRIBUTE)).toBe("collapsed")
  })

  it("keeps the expanded default for a missing or unknown value", () => {
    run()
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "<script>")
    run()
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
  })

  it("does not throw and stays expanded when storage is blocked", () => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "collapsed")
    blockStorage()
    expect(run).not.toThrow()
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
  })

  it("does not throw when the storage object itself is unavailable", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError")
    })
    expect(run).not.toThrow()
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
  })
})
