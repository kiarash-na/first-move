// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { testBrowser, testTab, until, type TabOptions, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const open = (options: TabOptions = {}) => {
  const tab = testTab(testBrowser(), options)
  tabs.push(tab)
  return tab
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("storage health (persist + estimate)", () => {
  it("asks for persistent storage once, on the first project", async () => {
    const tab = open()
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true } })
    await tab.store.create({ modules: { quickCheck: true } })
    await vi.waitFor(() => expect(tab.storageManager.persist).toHaveBeenCalledTimes(1))
    await until(tab, (state) => state.health.persisted === true)
    expect(tab.store.getState().health.warning).toBeNull()
  })

  it("warns when persistence is denied, and keeps warning on later checks", async () => {
    const tab = open()
    tab.storageManager.persist.mockResolvedValue(false)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true } })
    await until(tab, (state) => state.health.warning === "not-persisted")
    await tab.store.refreshHealth()
    expect(tab.store.getState().health.warning).toBe("not-persisted")
  })

  it("warns about low space", async () => {
    const tab = open()
    tab.storageManager.estimate.mockResolvedValue({ usage: 99, quota: 100 })
    await tab.store.start()
    await tab.store.refreshHealth()
    expect(tab.store.getState().health.warning).toBe("low-space")
  })

  it("always warns when IndexedDB is not in use", async () => {
    const tab = open({ db: null })
    await tab.store.start()
    await tab.store.refreshHealth()
    expect(tab.store.getState().health.warning).toBe("unavailable")
  })
})
