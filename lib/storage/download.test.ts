import { afterEach, describe, expect, it, vi } from "vitest"
import { downloadFile } from "./download"

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("downloadFile", () => {
  it("clicks a temporary link to a local object URL and revokes it later", () => {
    vi.useFakeTimers()
    const create = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:local/1")
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined)
    const clicked: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this)
    })

    downloadFile({ fileName: "valley.firstmove.json", mimeType: "application/json", text: "{}" })

    expect(create).toHaveBeenCalledWith(expect.any(Blob))
    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe("valley.firstmove.json")
    expect(clicked[0].href).toBe("blob:local/1")
    expect(document.querySelector("a[download]")).toBeNull()
    expect(revoke).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(revoke).toHaveBeenCalledWith("blob:local/1")
  })
})
