// @vitest-environment node
import { describe, expect, it } from "vitest"
import { SNAPSHOT_REASONS } from "./types"

describe("snapshot reasons", () => {
  it("are unique and include the events of PLAN-DASH-04", () => {
    expect(new Set(SNAPSHOT_REASONS).size).toBe(SNAPSHOT_REASONS.length)
    expect(SNAPSHOT_REASONS).toEqual(expect.arrayContaining(["autosave", "before-delete", "before-restore", "conflict"]))
  })
})
