// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  AUTOSAVE_DELAY_MS,
  IMPORT_MAX_BYTES,
  IMPORT_MAX_MEGABYTES,
  MAX_SNAPSHOTS,
  REMINDER_RULES,
  SAVE_RETRY_MS,
  SNAPSHOT_INTERVAL_MS,
} from "./limits"

describe("storage limits", () => {
  it("match the plan and decisions", () => {
    expect(MAX_SNAPSHOTS).toBe(20) // D-11
    expect(AUTOSAVE_DELAY_MS).toBe(400) // PLAN-DASH-04 step 3
    expect(IMPORT_MAX_MEGABYTES).toBe(5) // PLAN-DASH-04 step 2
    expect(IMPORT_MAX_BYTES).toBe(5 * 1024 * 1024)
  })

  it("keep retries slower than autosave and snapshots slower than both", () => {
    expect(SAVE_RETRY_MS).toBeGreaterThan(AUTOSAVE_DELAY_MS)
    expect(SNAPSHOT_INTERVAL_MS).toBeGreaterThan(SAVE_RETRY_MS)
    expect(REMINDER_RULES.edits).toBeGreaterThan(0)
    expect(REMINDER_RULES.days).toBeGreaterThan(0)
  })
})
