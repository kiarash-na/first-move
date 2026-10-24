import { afterEach, describe, expect, it, vi } from "vitest"
import { AUTOSAVE_DELAY_MS } from "@/lib/storage/limits"
import { browserDeps } from "./deps"

afterEach(() => vi.restoreAllMocks())

describe("browserDeps", () => {
  it("touches no storage when created", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem")
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    const deps = browserDeps()
    expect(getItem).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
    expect(deps.autosaveDelayMs).toBe(AUTOSAVE_DELAY_MS)
    expect(deps.tabId).not.toBe(browserDeps().tabId)
  })

  it("resolves the browser APIs lazily", () => {
    const deps = browserDeps()
    expect(deps.localStorage()).toBe(window.localStorage)
    expect(deps.sessionStorage()).toBe(window.sessionStorage)
    expect(deps.window()).toBe(window)
    expect(deps.fileLinkApi()).toBeNull()
    expect(deps.now()).toBeInstanceOf(Date)
    expect(deps.newId()).toMatch(/^[0-9a-f-]{36}$/)
    const channel = deps.createChannel("x")
    expect(channel).not.toBeNull()
    channel?.close()
  })
})
