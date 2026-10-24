import { describe, expect, it } from "vitest"
import { fakeFileLink } from "./fake-file-link"

describe("fakeFileLink (test helper)", () => {
  it("picks, checks permission and records writes", async () => {
    const fake = fakeFileLink()
    const handle = await fake.api.pick("x.json")
    expect(handle?.name).toBe("project.firstmove.json")
    await fake.api.write(handle!, "text")
    expect(fake.files.get("project.firstmove.json")).toBe("text")

    fake.permission = { query: "prompt", request: "denied" }
    expect(await fake.api.permission(handle!, false)).toBe("prompt")
    expect(await fake.api.permission(handle!, true)).toBe("denied")

    fake.nextPick = null
    expect(await fake.api.pick("x.json")).toBeNull()
    fake.writeError = new Error("disk")
    await expect(fake.api.write(handle!, "text")).rejects.toThrow("disk")
  })
})
