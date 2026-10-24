// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { HEALTH_CHECK_EVERY_SAVES } from "@/lib/storage/limits"
import { testProject } from "@/lib/storage/test-utils/projects"
import { testBrowser, testTab, type TestTab } from "../test-utils/harness"
import { restingSave } from "./saving"

const tabs: TestTab[] = []

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("restingSave", () => {
  it("shows a just-opened project as saved at its last change", () => {
    const project = testProject(1)
    expect(restingSave("indexeddb", project)).toEqual({ state: "saved", savedAt: project.meta.updatedAt, error: null, mirrored: false })
    expect(restingSave("mirror-only", null)).toEqual({ state: "idle", savedAt: null, error: null, mirrored: false })
    expect(restingSave("memory", project)).toMatchObject({ state: "error", error: "unavailable" })
  })
})

describe("after a save", () => {
  it("re-checks storage space every few saves", async () => {
    const tab = testTab(testBrowser())
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true } })
    await vi.waitFor(() => expect(tab.storageManager.estimate).toHaveBeenCalled())
    const before = tab.storageManager.estimate.mock.calls.length
    for (let edit = 1; edit <= HEALTH_CHECK_EVERY_SAVES; edit++) {
      tab.store.patch({ "buildings.total": edit })
      tab.tick(400)
      expect(await tab.store.flush()).toBe(true)
    }
    await vi.waitFor(() => expect(tab.storageManager.estimate.mock.calls.length).toBeGreaterThan(before))
  })
})
