// @vitest-environment node
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project"
import { seal } from "../store/crypto"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { deleteConversation, guardPhase, loadConversation, newConversation, saveConversation, withHandled } from "./state"

const SECRET = new Uint8Array(32).fill(7)
const NOW = Date.UTC(2026, 9, 25, 9)
const DAY = 86_400_000

describe("conversation state (PLAN-AGENT-07 step 5)", () => {
  it("starts in the menu with an empty Quick Check draft", () => {
    const state = newConversation("de", "thread-1", NOW)
    expect(state).toMatchObject({ v: 1, locale: "de", phase: "menu", module: null, wantsFile: null, bpStep: null, rounds: 0, rev: 0, threadId: "thread-1" })
    expect(state.project.meta.modules).toEqual({ quickCheck: true, businessPlan: false })
    expect(state.project.buildings.total).toBeNull()
  })

  it("saves sealed, loads back, counts revisions and slides 30 days", async () => {
    const clock = { now: NOW }
    const store = createMemoryStore({ now: () => clock.now })
    const draft = applyPatch(newConversation("en", "t", NOW).project, { "buildings.total": 40 }).project
    const saved = await saveConversation(store, SECRET, "sid-1", { ...newConversation("en", "t", NOW), project: draft }, NOW)
    expect(saved.rev).toBe(1)
    const raw = await store.get(keys.conversation("sid-1"))
    expect(raw).toMatch(/^v1\./)
    expect(raw).not.toContain("buildings")
    const loaded = await loadConversation(store, SECRET, "sid-1")
    expect(loaded?.project.buildings.total).toBe(40)
    expect(loaded?.rev).toBe(1)
    clock.now += 29 * DAY
    await saveConversation(store, SECRET, "sid-1", loaded!, clock.now)
    clock.now += 29 * DAY
    expect(await loadConversation(store, SECRET, "sid-1")).not.toBeNull()
    clock.now += 2 * DAY
    expect(await loadConversation(store, SECRET, "sid-1")).toBeNull()
  })

  it("reads a record sealed for another key, tampered with or of another shape as no conversation", async () => {
    const store = createMemoryStore()
    await store.set(keys.conversation("sid-a"), await seal(SECRET, keys.conversation("sid-b"), "{}"))
    expect(await loadConversation(store, SECRET, "sid-a")).toBeNull()
    await store.set(keys.conversation("sid-c"), await seal(SECRET, keys.conversation("sid-c"), JSON.stringify({ v: 2 })))
    expect(await loadConversation(store, SECRET, "sid-c")).toBeNull()
    await store.set(keys.conversation("sid-d"), "v1.broken.value")
    expect(await loadConversation(store, SECRET, "sid-d")).toBeNull()
  })

  it("deletes the conversation", async () => {
    const store = createMemoryStore()
    await saveConversation(store, SECRET, "sid-1", newConversation("en", "t", NOW), NOW)
    await deleteConversation(store, "sid-1")
    expect(await loadConversation(store, SECRET, "sid-1")).toBeNull()
  })

  it("keeps the newest handled email ids", () => {
    let state = newConversation("en", "t", NOW)
    for (let index = 0; index < 25; index++) state = withHandled(state, `email-${index}`)
    state = withHandled(state, "email-10")
    expect(state.handled).toHaveLength(20)
    expect(state.handled.at(-1)).toBe("email-10")
    expect(state.handled).not.toContain("email-0")
  })

  it("tells the guard where the conversation stands", () => {
    const fresh = newConversation("en", "t1", 0)
    expect(guardPhase(null)).toBe("new")
    expect(guardPhase(fresh)).toBe("menu")
    expect(guardPhase({ ...fresh, phase: "collect", module: "both" })).toBe("collect:quick-check")
    expect(guardPhase({ ...fresh, phase: "collect", module: "both", bpStep: 2 })).toBe("collect:business-plan:reality-check")
    expect(guardPhase({ ...fresh, phase: "results", bpStep: 4 })).toBe("results")
  })
})
