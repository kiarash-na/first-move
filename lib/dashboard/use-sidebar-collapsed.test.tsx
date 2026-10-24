import { act, renderHook, waitFor } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SIDEBAR_ATTRIBUTE, SIDEBAR_STORAGE_KEY } from "./sidebar-state"
import { useSidebarCollapsed } from "./use-sidebar-collapsed"

const root = document.documentElement

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
  root.removeAttribute(SIDEBAR_ATTRIBUTE)
})

function Probe() {
  const [collapsed] = useSidebarCollapsed()
  return <span>{collapsed ? "collapsed" : "expanded"}</span>
}

describe("useSidebarCollapsed (D-59)", () => {
  it("reports the html attribute", () => {
    root.setAttribute(SIDEBAR_ATTRIBUTE, "collapsed")
    const { result } = renderHook(() => useSidebarCollapsed())
    expect(result.current[0]).toBe(true)
  })

  it("renders expanded on the server, whatever the page says, so hydration matches the static shell", () => {
    root.setAttribute(SIDEBAR_ATTRIBUTE, "collapsed")
    expect(renderToString(<Probe />)).toContain("expanded")
  })

  it("collapses and expands: the attribute and the stored key follow", async () => {
    const { result } = renderHook(() => useSidebarCollapsed())
    act(() => result.current[1](true))
    await waitFor(() => expect(result.current[0]).toBe(true))
    expect(root.getAttribute(SIDEBAR_ATTRIBUTE)).toBe("collapsed")
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe("collapsed")

    act(() => result.current[1](false))
    await waitFor(() => expect(result.current[0]).toBe(false))
    expect(root.hasAttribute(SIDEBAR_ATTRIBUTE)).toBe(false)
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBeNull()
  })

  it("still collapses this page when storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    const { result } = renderHook(() => useSidebarCollapsed())
    act(() => result.current[1](true))
    await waitFor(() => expect(result.current[0]).toBe(true))
  })

  it("follows attribute changes made elsewhere, such as the pre-paint script", async () => {
    const { result } = renderHook(() => useSidebarCollapsed())
    act(() => root.setAttribute(SIDEBAR_ATTRIBUTE, "collapsed"))
    await waitFor(() => expect(result.current[0]).toBe(true))
  })
})
