// @vitest-environment node
import { describe, expect, it } from "vitest"
import { SIDEBAR_STORAGE_KEY } from "@/lib/dashboard/sidebar-state"
import { THEME_STORAGE_KEY } from "@/lib/theme/theme"
import { ACTIVE_PROJECT_KEY, DB_NAME, DB_VERSION, LAST_PROJECT_KEY, MIRROR_PREFIX, STORE, TAB_CHANNEL } from "./keys"

describe("storage keys", () => {
  it("are namespaced and distinct", () => {
    const keys = [ACTIVE_PROJECT_KEY, LAST_PROJECT_KEY, MIRROR_PREFIX, TAB_CHANNEL, THEME_STORAGE_KEY, SIDEBAR_STORAGE_KEY]
    expect(new Set(keys).size).toBe(keys.length)
    for (const key of keys) expect(key.startsWith("first-move:")).toBe(true)
    expect(DB_NAME).toBe("first-move")
    expect(DB_VERSION).toBeGreaterThanOrEqual(1)
  })

  it("lists the projects and snapshots stores (PLAN-DASH-04)", () => {
    expect(Object.values(STORE)).toEqual(["projects", "snapshots", "backups", "file-links"])
  })
})
