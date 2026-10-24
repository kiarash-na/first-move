// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { checkStorageHealth, isLowOnSpace, STORAGE_WARNINGS, UNKNOWN_HEALTH } from "./persist"

const MB = 1024 * 1024

function manager({ persisted = false, grant = false, usage = 1 * MB, quota = 1000 * MB } = {}) {
  return {
    persisted: vi.fn(async () => persisted),
    persist: vi.fn(async () => grant),
    estimate: vi.fn(async () => ({ usage, quota })),
    getDirectory: vi.fn(),
  } as unknown as StorageManager & { persist: ReturnType<typeof vi.fn> }
}

describe("checkStorageHealth", () => {
  it("is unknown without a StorageManager (old browser, insecure context)", async () => {
    expect(await checkStorageHealth(undefined)).toEqual(UNKNOWN_HEALTH)
  })

  it("does not ask or warn unless asked to request persistence", async () => {
    const storage = manager()
    expect(await checkStorageHealth(storage)).toEqual({ persisted: false, usage: MB, quota: 1000 * MB, warning: null })
    expect(storage.persist).not.toHaveBeenCalled()
  })

  it("asks for persistence and warns when it is denied", async () => {
    const denied = manager()
    expect((await checkStorageHealth(denied, { request: true })).warning).toBe("not-persisted")
    expect(denied.persist).toHaveBeenCalledTimes(1)
    expect((await checkStorageHealth(manager(), { deniedBefore: true })).warning).toBe("not-persisted")
    expect(await checkStorageHealth(manager({ grant: true }), { request: true })).toMatchObject({ persisted: true, warning: null })
  })

  it("does not ask again once persisted", async () => {
    const storage = manager({ persisted: true })
    expect((await checkStorageHealth(storage, { request: true })).persisted).toBe(true)
    expect(storage.persist).not.toHaveBeenCalled()
  })

  it("warns about low space first", async () => {
    expect((await checkStorageHealth(manager({ usage: 995 * MB }), { request: true })).warning).toBe("low-space")
  })

  it("survives a throwing StorageManager", async () => {
    const broken = {
      persisted: async () => {
        throw new Error("x")
      },
      estimate: async () => {
        throw new Error("x")
      },
    } as unknown as StorageManager
    expect(await checkStorageHealth(broken, { request: true })).toEqual(UNKNOWN_HEALTH)
  })
})

describe("isLowOnSpace", () => {
  it("is low below 10 MB free or above 90 % used", () => {
    expect(isLowOnSpace(5 * MB, 14 * MB)).toBe(true)
    expect(isLowOnSpace(91 * MB, 100 * MB)).toBe(true)
    expect(isLowOnSpace(50 * MB, 100 * MB)).toBe(false)
    expect(isLowOnSpace(null, 100 * MB)).toBe(false)
    expect(isLowOnSpace(1, 0)).toBe(false)
  })

  it("orders warnings by severity", () => {
    expect(STORAGE_WARNINGS).toEqual(["unavailable", "low-space", "not-persisted"])
  })
})
