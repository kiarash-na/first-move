import { describe, expect, it } from "vitest"
import { isQuotaError } from "@/lib/storage/web-storage"
import { MemoryStorage } from "./memory-storage"

describe("MemoryStorage (test helper)", () => {
  it("behaves like Web Storage", () => {
    const storage = new MemoryStorage()
    storage.setItem("a", "1")
    storage.setItem("b", "2")
    expect(storage.length).toBe(2)
    expect(storage.key(0)).toBe("a")
    expect(storage.getItem("b")).toBe("2")
    storage.removeItem("a")
    expect(storage.getItem("a")).toBeNull()
    storage.clear()
    expect(storage.length).toBe(0)
  })

  it("throws a quota error past its quota, counting replaced values once", () => {
    const storage = new MemoryStorage({ quota: 10 })
    storage.setItem("k", "123456789")
    storage.setItem("k", "987654321")
    let error: unknown
    try {
      storage.setItem("x", "1")
    } catch (caught) {
      error = caught
    }
    expect(isQuotaError(error)).toBe(true)
  })

  it("throws on every call when blocked", () => {
    const storage = new MemoryStorage({ blocked: true })
    expect(() => storage.getItem("a")).toThrow()
    expect(() => storage.length).toThrow()
  })
})
