import { afterEach, describe, expect, it, vi } from "vitest"
import { MemoryStorage } from "./test-utils/memory-storage"
import { errorName, getWebStorage, isQuotaError, readKey, removeKey, usableWebStorage, writeKey } from "./web-storage"

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe("web storage helpers", () => {
  it("return the browser storages", () => {
    expect(getWebStorage("local")).toBe(window.localStorage)
    expect(getWebStorage("session")).toBe(window.sessionStorage)
    expect(usableWebStorage("local")).toBe(window.localStorage)
    expect(window.localStorage.getItem("first-move:probe")).toBeNull()
  })

  it("return null when access throws", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError")
    })
    expect(getWebStorage("local")).toBeNull()
    expect(usableWebStorage("local")).toBeNull()
  })

  it("read, write and remove without throwing", () => {
    const storage = new MemoryStorage()
    expect(writeKey(storage, "k", "v")).toBe(true)
    expect(readKey(storage, "k")).toBe("v")
    removeKey(storage, "k")
    expect(readKey(storage, "k")).toBeNull()
    expect(writeKey(null, "k", "v")).toBe(false)
    expect(readKey(null, "k")).toBeNull()

    const blocked = new MemoryStorage({ blocked: true })
    expect(writeKey(blocked, "k", "v")).toBe(false)
    expect(readKey(blocked, "k")).toBeNull()
    expect(() => removeKey(blocked, "k")).not.toThrow()
  })

  it("recognise quota errors of all engines", () => {
    expect(isQuotaError(new DOMException("full", "QuotaExceededError"))).toBe(true)
    expect(isQuotaError({ name: "NS_ERROR_DOM_QUOTA_REACHED" })).toBe(true)
    expect(isQuotaError(new Error("other"))).toBe(false)
    expect(isQuotaError("QuotaExceededError")).toBe(false)
    expect(errorName(null)).toBeNull()
    expect(errorName({ name: 3 })).toBeNull()
  })
})
