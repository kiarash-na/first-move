// @vitest-environment node
import { describe, expect, it } from "vitest"
import { ACTIVE_PROJECT_KEY, LAST_PROJECT_KEY } from "@/lib/storage/keys"
import { MemoryStorage } from "@/lib/storage/test-utils/memory-storage"
import { forgetActive, forgetLastUsed, readActiveIds, rememberActive } from "./active-ids"

describe("active project ids", () => {
  it("keeps this tab's project in sessionStorage and the last used one in localStorage", () => {
    const session = new MemoryStorage()
    const local = new MemoryStorage()
    expect(readActiveIds(session, local)).toEqual({ activeId: null, lastUsedId: null })
    rememberActive(session, local, "p")
    expect(session.getItem(ACTIVE_PROJECT_KEY)).toBe("p")
    expect(local.getItem(LAST_PROJECT_KEY)).toBe("p")
    forgetActive(session)
    expect(readActiveIds(session, local)).toEqual({ activeId: null, lastUsedId: "p" })
  })

  it("forgets the last used project only when it is the deleted one", () => {
    const local = new MemoryStorage()
    rememberActive(null, local, "p")
    forgetLastUsed(local, "q")
    expect(local.getItem(LAST_PROJECT_KEY)).toBe("p")
    forgetLastUsed(local, "p")
    expect(local.getItem(LAST_PROJECT_KEY)).toBeNull()
  })

  it("works without storage", () => {
    expect(readActiveIds(null, new MemoryStorage({ blocked: true }))).toEqual({ activeId: null, lastUsedId: null })
    expect(() => rememberActive(null, null, "p")).not.toThrow()
  })
})
