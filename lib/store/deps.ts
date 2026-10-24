import { createFileLinkApi, type FileLinkApi } from "@/lib/storage/file-link"
import { openStorageDb, type StorageDb } from "@/lib/storage/idb"
import { AUTOSAVE_DELAY_MS, SAVE_RETRY_MS } from "@/lib/storage/limits"
import { browserChannel, type ChannelLike } from "@/lib/storage/tab-sync"
import { usableWebStorage } from "@/lib/storage/web-storage"
import { browserTimers, type Timers } from "./debounce"

/**
 * Everything the store takes from the browser. Functions, so nothing is touched before
 * `start()` runs in an effect (never during render, never on the server). Tests inject fakes.
 */
export interface StoreDeps {
  openDb(onClosed: () => void): Promise<StorageDb | null>
  localStorage(): Storage | null
  sessionStorage(): Storage | null
  storageManager(): StorageManager | undefined
  /** null where "Link to a file" is unsupported (D-12). */
  fileLinkApi(): FileLinkApi | null
  createChannel(name: string): ChannelLike | null
  /** For the unload guard and cross-tab "last used" updates; null in tests that do not need it. */
  window(): Window | null
  now(): Date
  newId(): string
  timers: Timers
  /** Identifies this tab's messages on the channel. */
  tabId: string
  autosaveDelayMs: number
  retryMs: number
}

export function browserDeps(): StoreDeps {
  return {
    openDb: (onClosed) => openStorageDb({ onClosed }),
    localStorage: () => usableWebStorage("local"),
    sessionStorage: () => usableWebStorage("session"),
    storageManager: () => (typeof navigator === "undefined" ? undefined : navigator.storage),
    fileLinkApi: () => createFileLinkApi(),
    createChannel: browserChannel,
    window: () => (typeof window === "undefined" ? null : window),
    now: () => new Date(),
    newId: () => crypto.randomUUID(),
    timers: browserTimers,
    tabId: typeof crypto === "undefined" ? String(Math.random()) : crypto.randomUUID(),
    autosaveDelayMs: AUTOSAVE_DELAY_MS,
    retryMs: SAVE_RETRY_MS,
  }
}
