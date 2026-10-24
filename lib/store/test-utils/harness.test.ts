// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { testBrowser, testTab, until, type TestTab } from "./harness"

const tabs: TestTab[] = []

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("test tabs (test helper)", () => {
  it("share storage and the clock within one browser, not the session", async () => {
    const browser = testBrowser()
    const a = testTab(browser)
    const b = testTab(browser)
    tabs.push(a, b)
    expect(a.local).toBe(b.local)
    expect(a.session).not.toBe(b.session)
    a.tick(1000)
    expect(b.deps.now().getTime()).toBe(browser.clock.now)
    await a.store.start()
    await until(a, (state) => state.phase === "ready")
    expect(a.store.getState().mode).toBe("indexeddb")
  })
})
