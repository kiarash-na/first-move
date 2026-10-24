// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { updateBackup } from "@/lib/storage/backups"
import { openStorageDb } from "@/lib/storage/idb"
import { REMINDER_RULES } from "@/lib/storage/limits"
import { recordEdit } from "@/lib/storage/reminder"
import { testBrowser, testTab, until, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const DAY = 24 * 3_600_000

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

/** Lets the background reminder check finish before asserting that nothing was shown. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 50))

const reminders = (tab: TestTab) => tab.store.getState().notices.filter((notice) => notice.kind === "export-reminder")

describe("export reminder on open (N days, D-11)", () => {
  it("reminds when a project with old unexported edits is opened, then pauses", async () => {
    const browser = testBrowser()
    const first = testTab(browser)
    tabs.push(first)
    const project = await first.store.create({ modules: { quickCheck: true }, open: false })
    const db = (await openStorageDb({ name: browser.dbName }))!
    await updateBackup(db, project.meta.id, (state) => recordEdit(state, new Date(browser.clock.now)))
    db.close()

    first.tick(REMINDER_RULES.days * DAY)
    await first.store.open(project.meta.id)
    await until(first, (state) => state.notices.some((notice) => notice.kind === "export-reminder"))
    expect(reminders(first)[0].projectId).toBe(project.meta.id)

    first.store.dismissNotice(reminders(first)[0].id)
    await first.store.close()
    await first.store.open(project.meta.id)
    await settle()
    expect(reminders(first)).toEqual([])
  })

  it("does not remind for a project without edits", async () => {
    const tab = testTab(testBrowser())
    tabs.push(tab)
    const project = await tab.store.create({ modules: { quickCheck: true }, open: false })
    tab.tick(30 * DAY)
    await tab.store.open(project.meta.id)
    await settle()
    expect(reminders(tab)).toEqual([])
  })
})
