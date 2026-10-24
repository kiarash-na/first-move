import { describe, expect, it, vi } from "vitest"
import { getProjectStore } from "./project-store"

describe("getProjectStore", () => {
  it("is one store per page and reads no storage until started", () => {
    const getItem = vi.spyOn(Storage.prototype, "getItem")
    const store = getProjectStore()
    expect(getProjectStore()).toBe(store)
    expect(store.getState().phase).toBe("idle")
    expect(getItem).not.toHaveBeenCalled()
    getItem.mockRestore()
  })
})
