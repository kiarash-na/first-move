// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { createFileLinkApi, fileLinkErrorCode, isFileLinkSupported } from "./file-link"

function chromium(picker = vi.fn()) {
  const win = { showSaveFilePicker: picker, isSecureContext: true } as Record<string, unknown>
  win.self = win
  win.top = win
  return win
}

function handle({ query = "granted", request = "granted" }: { query?: PermissionState; request?: PermissionState } = {}) {
  const writable = { write: vi.fn(async () => undefined), close: vi.fn(async () => undefined) }
  return {
    name: "valley.firstmove.json",
    writable,
    queryPermission: vi.fn(async () => query),
    requestPermission: vi.fn(async () => request),
    createWritable: vi.fn(async () => writable),
  } as unknown as FileSystemFileHandle & { writable: typeof writable; requestPermission: ReturnType<typeof vi.fn> }
}

describe("isFileLinkSupported (D-12: Chromium only, hidden elsewhere)", () => {
  it("needs showSaveFilePicker in a secure top-level page", () => {
    expect(isFileLinkSupported(chromium())).toBe(true)
    expect(isFileLinkSupported({})).toBe(false)
    expect(isFileLinkSupported(undefined)).toBe(false)
    expect(isFileLinkSupported({ ...chromium(), isSecureContext: false })).toBe(false)
    const framed = chromium()
    framed.top = {}
    expect(isFileLinkSupported(framed)).toBe(false)
    expect(createFileLinkApi({})).toBeNull()
  })

  it("is false on the server (no window)", () => {
    expect(isFileLinkSupported()).toBe(false)
    expect(createFileLinkApi()).toBeNull()
  })
})

describe("createFileLinkApi", () => {
  it("asks for a .json file with the suggested name and returns null on cancel", async () => {
    const file = handle()
    const picker = vi.fn(async () => file)
    const api = createFileLinkApi(chromium(picker))!
    expect(await api.pick("valley.firstmove.json")).toBe(file)
    expect(picker).toHaveBeenCalledWith(expect.objectContaining({ suggestedName: "valley.firstmove.json" }))

    picker.mockRejectedValueOnce(new DOMException("cancelled", "AbortError"))
    expect(await api.pick("x")).toBeNull()
    picker.mockRejectedValueOnce(new DOMException("blocked", "SecurityError"))
    await expect(api.pick("x")).rejects.toThrow()
  })

  it("checks permission and asks only when requested", async () => {
    const api = createFileLinkApi(chromium())!
    expect(await api.permission(handle(), false)).toBe("granted")
    const prompting = handle({ query: "prompt", request: "granted" })
    expect(await api.permission(prompting, false)).toBe("prompt")
    expect(prompting.requestPermission).not.toHaveBeenCalled()
    expect(await api.permission(prompting, true)).toBe("granted")
  })

  it("writes the whole text and always closes the file", async () => {
    const api = createFileLinkApi(chromium())!
    const file = handle()
    await api.write(file, "{}")
    expect(file.writable.write).toHaveBeenCalledWith("{}")
    expect(file.writable.close).toHaveBeenCalled()

    file.writable.write.mockRejectedValueOnce(new DOMException("gone", "NotFoundError"))
    await expect(api.write(file, "{}")).rejects.toThrow()
    expect(file.writable.close).toHaveBeenCalledTimes(2)
  })
})

describe("fileLinkErrorCode", () => {
  it("maps browser errors to what the UI explains", () => {
    expect(fileLinkErrorCode(new DOMException("x", "NotAllowedError"))).toBe("permission")
    expect(fileLinkErrorCode(new DOMException("x", "SecurityError"))).toBe("permission")
    expect(fileLinkErrorCode(new DOMException("x", "NotFoundError"))).toBe("not-found")
    expect(fileLinkErrorCode(new Error("disk full"))).toBe("write-failed")
  })
})
