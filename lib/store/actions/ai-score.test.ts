// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { aiScoreSchema, type AiScore } from "@/lib/project"
import { openStorageDb, readProjectRecord, type StorageDb } from "@/lib/storage/idb"
import type { testProject } from "@/lib/storage/test-utils/projects"
import { testBrowser, testTab, until, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const dbs: StorageDb[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  while (dbs.length) dbs.pop()!.close()
})

const SCORE: AiScore = aiScoreSchema.parse({
  method: "1.0.0",
  at: "2026-10-24T10:00:00.000Z",
  decisionModel: "typesafe-ai/jev-1.14.0",
  score: 61.5,
  sd: 4.2,
  level: "promising",
  capped: false,
  dimensions: [{ id: "value", weight: 0.15, score: 0.6, raw: 0.6, sd: 0.05, cap: null }],
  judgements: [],
  gates: [{ id: "anchor", source: "model", probability: 0.9, outcome: "pass", cap: null }],
  branches: [{ id: "ownership", choice: "utility", probabilities: { utility: 0.7, unclear: 0.3 } }],
  quickCheck: { level: "promising", heatDensityMwhPerM: 1.8, economicRatio: 1.2 },
  usage: { decisionTokens: 1200, textTokens: 0 },
  report: null,
  suggestions: null,
})

describe("setAiScore (D-73)", () => {
  it("saves the score into the open project and keeps it after a reload", async () => {
    const browser = testBrowser()
    const tab = testTab(browser)
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { businessPlan: true } })
    expect(tab.store.setAiScore(project.meta.id, SCORE)).toBe(true)
    expect(tab.store.getState().active?.aiScore).toEqual(SCORE)
    tab.tick(400)
    await until(tab, (state) => state.save.state === "saved")
    const db = (await openStorageDb({ name: browser.dbName }))!
    dbs.push(db)
    const stored = (await readProjectRecord(db, project.meta.id)) as ReturnType<typeof testProject> | undefined
    expect(stored?.aiScore).toEqual(SCORE)
  })

  it("writes nothing for a project that is not open, or an invalid result", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    expect(tab.store.setAiScore("00000000-0000-4000-8000-000000000001", SCORE)).toBe(false)
    const project = await tab.store.create({ modules: { businessPlan: true } })
    expect(tab.store.setAiScore(project.meta.id, { ...SCORE, score: 140 })).toBe(false)
    expect(tab.store.getState().active?.aiScore).toBeNull()
    expect(tab.store.setAiScore(project.meta.id, null)).toBe(true)
  })
})
