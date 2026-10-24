// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { testBrowser, testTab, type TestTab } from "./test-utils/harness"

const tabs: TestTab[] = []

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("createProjectStore", () => {
  it("starts empty (the server snapshot) and notifies subscribers", async () => {
    const tab = testTab(testBrowser())
    tabs.push(tab)
    expect(tab.store.getState()).toBe(tab.store.getInitialState())
    let calls = 0
    const unsubscribe = tab.store.subscribe(() => calls++)
    await tab.store.start()
    expect(calls).toBeGreaterThan(0)
    unsubscribe()
  })

  it("starts storage on the first action that needs it", async () => {
    const tab = testTab(testBrowser())
    tabs.push(tab)
    expect(tab.store.patch({ "buildings.total": 1 })).toBeNull()
    expect(await tab.store.flush()).toBe(true)
    await tab.store.create({ modules: { quickCheck: true } })
    expect(tab.store.getState().phase).toBe("ready")
  })

  it("dismisses notices", async () => {
    const browser = testBrowser()
    browser.local.setItem("first-move:mirror:x", JSON.stringify({ savedAt: "2026-10-24T08:00:00.000Z", project: { meta: {} } }))
    const tab = testTab(browser)
    tabs.push(tab)
    await tab.store.start()
    const [notice] = tab.store.getState().notices
    expect(notice.kind).toBe("unreadable")
    tab.store.dismissNotice(notice.id)
    expect(tab.store.getState().notices).toEqual([])
  })
})
