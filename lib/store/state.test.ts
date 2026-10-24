// @vitest-environment node
import { describe, expect, it } from "vitest"
import { INITIAL_STATE, NOTICE_KINDS } from "./state"

describe("initial state (server snapshot)", () => {
  it("holds no data and is frozen", () => {
    expect(INITIAL_STATE).toMatchObject({ phase: "idle", mode: null, projects: [], activeId: null, active: null, lastUsedId: null, notices: [] })
    expect(INITIAL_STATE.fileLink.supported).toBe(false)
    expect(Object.isFrozen(INITIAL_STATE)).toBe(true)
    expect(Object.isFrozen(INITIAL_STATE.projects)).toBe(true)
  })

  it("lists unique notice kinds", () => {
    expect(new Set(NOTICE_KINDS).size).toBe(NOTICE_KINDS.length)
  })
})
