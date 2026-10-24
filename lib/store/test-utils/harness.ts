import { vi } from "vitest"
import { openStorageDb } from "@/lib/storage/idb"
import { uniqueDbName } from "@/lib/storage/test-utils/db-name"
import { fakeFileLink, type FakeFileLink } from "@/lib/storage/test-utils/fake-file-link"
import { MemoryStorage } from "@/lib/storage/test-utils/memory-storage"
import { createProjectStore, type ProjectStore } from "@/lib/store/create-project-store"
import type { StoreDeps } from "@/lib/store/deps"
import { manualTimers, type ManualTimers } from "./manual-timers"

/** Test helper: one "tab" with its own store over shared fake browser storage. Not used by the app. */
export interface TestTab {
  store: ProjectStore
  deps: StoreDeps
  timers: ManualTimers
  local: MemoryStorage
  session: MemoryStorage
  files: FakeFileLink
  storageManager: { persisted: ReturnType<typeof vi.fn>; persist: ReturnType<typeof vi.fn>; estimate: ReturnType<typeof vi.fn> }
  /** Moves the shared clock. */
  tick(ms: number): void
}

export interface TabOptions {
  dbName?: string
  /** Shared between tabs of one "browser" (localStorage is per origin). */
  local?: MemoryStorage
  /** Pass the previous tab's session to simulate a reload of the same tab. */
  session?: MemoryStorage
  /** Isolates the BroadcastChannel of one test. */
  channel?: string
  tabId?: string
  /** null: IndexedDB unavailable. */
  db?: "fake" | null
  fileLink?: boolean
  window?: Window | null
  clock?: { now: number }
  overrides?: Partial<StoreDeps>
}

/** A browser for one test: a database name, a localStorage, a channel and a clock. */
export function testBrowser() {
  return { dbName: uniqueDbName("store"), local: new MemoryStorage(), channel: `test-${Math.random()}`, clock: { now: Date.parse("2026-10-24T08:00:00.000Z") } }
}

let ids = 0

export function testTab(browser = testBrowser(), options: TabOptions = {}): TestTab {
  const { dbName, local, channel, clock } = { ...browser, ...options }
  const timers = manualTimers()
  const session = options.session ?? new MemoryStorage()
  const files = fakeFileLink()
  const storageManager = {
    persisted: vi.fn(async () => false),
    persist: vi.fn(async () => true),
    estimate: vi.fn(async () => ({ usage: 1024, quota: 1024 * 1024 * 1024 })),
  }
  const deps: StoreDeps = {
    openDb: (onClosed) => (options.db === null ? Promise.resolve(null) : openStorageDb({ name: dbName!, onClosed })),
    localStorage: () => local!,
    sessionStorage: () => session,
    storageManager: () => storageManager as unknown as StorageManager,
    fileLinkApi: () => (options.fileLink ? files.api : null),
    createChannel: (name) => new BroadcastChannel(`${channel}:${name}`),
    window: () => options.window ?? null,
    now: () => new Date(clock!.now),
    newId: () => `00000000-0000-4000-9000-${String(++ids).padStart(12, "0")}`,
    timers,
    tabId: options.tabId ?? `tab-${++ids}`,
    autosaveDelayMs: 400,
    retryMs: 5000,
    ...options.overrides,
  }
  return {
    store: createProjectStore(deps),
    deps,
    timers,
    local: local!,
    session,
    files,
    storageManager,
    tick(ms) {
      clock!.now += ms
      timers.advance(ms)
    },
  }
}

/** Waits until a store's state matches. */
export function until(tab: TestTab, check: (state: ReturnType<ProjectStore["getState"]>) => boolean): Promise<void> {
  return vi.waitFor(() => {
    if (!check(tab.store.getState())) throw new Error("not yet")
  })
}
