import { LOW_SPACE } from "./limits"

/**
 * What the storage banner warns about (`shell.storage.warning.<code>`), most serious first:
 * no IndexedDB (data may not survive), little space left, the browser may clear the data.
 */
export const STORAGE_WARNINGS = ["unavailable", "low-space", "not-persisted"] as const

export type StorageWarning = (typeof STORAGE_WARNINGS)[number]

export interface StorageHealth {
  /** The browser promised not to clear the data on its own; null when unknown. */
  persisted: boolean | null
  /** Bytes used and available to this site; null when unknown. */
  usage: number | null
  quota: number | null
  warning: StorageWarning | null
}

export const UNKNOWN_HEALTH: StorageHealth = { persisted: null, usage: null, quota: null, warning: null }

export interface HealthOptions {
  /** Ask for persistent storage (`navigator.storage.persist()`) if it is not granted yet. */
  request?: boolean
  /** An earlier request in this session was denied: keep warning while it is not granted. */
  deniedBefore?: boolean
}

/** Less than `freeBytes` left, or more than `usedRatio` of the quota used. */
export function isLowOnSpace(usage: number | null, quota: number | null): boolean {
  if (usage === null || quota === null || quota <= 0) return false
  return quota - usage < LOW_SPACE.freeBytes || usage / quota > LOW_SPACE.usedRatio
}

async function persisted(manager: StorageManager, request: boolean): Promise<{ value: boolean | null; asked: boolean }> {
  try {
    if (await manager.persisted?.()) return { value: true, asked: false }
    if (!request || typeof manager.persist !== "function") return { value: false, asked: false }
    return { value: await manager.persist(), asked: true }
  } catch {
    return { value: null, asked: false }
  }
}

async function estimate(manager: StorageManager): Promise<{ usage: number | null; quota: number | null }> {
  try {
    const { usage, quota } = (await manager.estimate?.()) ?? {}
    return { usage: usage ?? null, quota: quota ?? null }
  } catch {
    return { usage: null, quota: null }
  }
}

/**
 * Persistence and space (D-11). Warns about persistence only after asking was denied, so a
 * browser that has not been asked yet shows no banner. Client only, outside render.
 */
export async function checkStorageHealth(
  manager: StorageManager | undefined,
  { request = false, deniedBefore = false }: HealthOptions = {},
): Promise<StorageHealth> {
  if (!manager) return UNKNOWN_HEALTH
  const [persistence, space] = await Promise.all([persisted(manager, request), estimate(manager)])
  const denied = persistence.value === false && (persistence.asked || deniedBefore)
  const warning: StorageWarning | null = isLowOnSpace(space.usage, space.quota) ? "low-space" : denied ? "not-persisted" : null
  return { persisted: persistence.value, ...space, warning }
}
