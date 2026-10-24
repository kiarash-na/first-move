// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { testBrowser, testTab, until, type TabOptions, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const open = async (browser = testBrowser(), options: TabOptions = { fileLink: true }) => {
  const tab = testTab(browser, options)
  tabs.push(tab)
  await tab.store.start()
  return tab
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("link to a file (D-12)", () => {
  it("is hidden where the browser has no File System Access", async () => {
    const tab = await open(testBrowser(), {})
    await tab.store.create({ modules: { quickCheck: true } })
    expect(tab.store.getState().fileLink).toEqual({ supported: false, status: "off", fileName: null, error: null })
    expect(await tab.store.linkFile()).toBe(false)
  })

  it("links a file, writes the project and keeps writing on every save", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true }, name: "Valley" })
    expect(tab.store.getState().fileLink).toMatchObject({ supported: true, status: "off" })

    expect(await tab.store.linkFile()).toBe(true)
    expect(tab.store.getState().fileLink).toMatchObject({ status: "on", fileName: "project.firstmove.json" })
    expect(JSON.parse(tab.files.files.get("project.firstmove.json")!).project.meta.name).toBe("Valley")

    tab.store.patch({ "buildings.total": 11 })
    tab.tick(400)
    await tab.store.flush()
    await until(tab, () => JSON.parse(tab.files.files.get("project.firstmove.json")!).project.buildings.total === 11)
  })

  it("does nothing when the picker is cancelled, and reports a failing picker", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true } })
    tab.files.nextPick = null
    expect(await tab.store.linkFile()).toBe(false)
    expect(tab.store.getState().fileLink.status).toBe("off")
    tab.files.nextPick = new DOMException("no", "SecurityError")
    expect(await tab.store.linkFile()).toBe(false)
    expect(tab.store.getState().fileLink).toMatchObject({ status: "error", error: "permission" })
  })

  it("asks again after a reload, and resumes on a click", async () => {
    const browser = testBrowser()
    const first = await open(browser)
    await first.store.create({ modules: { quickCheck: true } })
    await first.store.linkFile()
    first.store.stop()

    const reloaded = testTab(browser, { fileLink: true, session: first.session })
    tabs.push(reloaded)
    reloaded.files.permission = { query: "prompt", request: "denied" }
    await reloaded.store.start()
    expect(reloaded.store.getState().fileLink).toMatchObject({ status: "needs-permission", fileName: "project.firstmove.json" })

    expect(await reloaded.store.resumeFileLink()).toBe(false)
    expect(reloaded.store.getState().fileLink).toMatchObject({ status: "needs-permission", error: "permission" })
    reloaded.files.permission = { query: "prompt", request: "granted" }
    expect(await reloaded.store.resumeFileLink()).toBe(true)
    expect(reloaded.store.getState().fileLink.status).toBe("on")
  })

  it("shows write errors and can be unlinked", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true } })
    await tab.store.linkFile()
    tab.files.writeError = new DOMException("gone", "NotFoundError")
    tab.store.patch({ "buildings.total": 2 })
    tab.tick(400)
    await tab.store.flush()
    await until(tab, (state) => state.fileLink.status === "error")
    expect(tab.store.getState().fileLink.error).toBe("not-found")

    await tab.store.unlinkFile()
    expect(tab.store.getState().fileLink).toMatchObject({ status: "off", fileName: null })
    expect(await tab.store.resumeFileLink()).toBe(false)
  })

  it("follows the open project", async () => {
    const tab = await open()
    const linked = await tab.store.create({ modules: { quickCheck: true } })
    await tab.store.linkFile()
    await tab.store.create({ modules: { quickCheck: true } })
    expect(tab.store.getState().fileLink.status).toBe("off")
    await tab.store.open(linked.meta.id)
    expect(tab.store.getState().fileLink.status).toBe("on")
    await tab.store.close()
    expect(tab.store.getState().fileLink.status).toBe("off")
  })
})
