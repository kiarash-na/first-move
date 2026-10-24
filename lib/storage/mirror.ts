import type { Project } from "@/lib/project"
import { MIRROR_PREFIX } from "./keys"
import { isQuotaError } from "./web-storage"

/**
 * localStorage copy of each project's latest state (D-11). Written synchronously, so it also
 * survives a tab that closes before IndexedDB finished; recovery takes whichever copy is newer.
 */
export interface MirrorEntry {
  /** When the copy was written (eviction order). */
  savedAt: string
  /** Raw project JSON, validated on load. */
  project: unknown
}

export type MirrorWrite = "ok" | "quota-exceeded" | "unavailable"

const keyOf = (projectId: string) => `${MIRROR_PREFIX}${projectId}`

function parse(value: string | null): MirrorEntry | null {
  if (value === null) return null
  try {
    const entry: unknown = JSON.parse(value)
    if (typeof entry !== "object" || entry === null) return null
    const { savedAt, project } = entry as Partial<MirrorEntry>
    return typeof savedAt === "string" && project !== undefined ? { savedAt, project } : null
  } catch {
    return null
  }
}

function mirrorKeys(storage: Storage): string[] {
  const keys: string[] = []
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (key?.startsWith(MIRROR_PREFIX)) keys.push(key)
  }
  return keys
}

/** Removes the oldest other mirror that may go; false when there is none left. */
function evictOldest(storage: Storage, keep: string, canEvict: (projectId: string) => boolean): boolean {
  const candidates = mirrorKeys(storage)
    .filter((key) => key !== keep && canEvict(key.slice(MIRROR_PREFIX.length)))
    .map((key) => ({ key, savedAt: parse(storage.getItem(key))?.savedAt ?? "" }))
    .sort((a, b) => a.savedAt.localeCompare(b.savedAt))
  if (candidates.length === 0) return false
  storage.removeItem(candidates[0].key)
  return true
}

export interface MirrorWriteOptions {
  /**
   * Whether another project's copy may be dropped to make room. Only a copy that is a backup of a
   * project safely stored elsewhere (IndexedDB) may go; the default drops nothing, because in
   * mirror-only mode, or after a failed IndexedDB save, the copy is the only one (D-11).
   */
  canEvict?: (projectId: string) => boolean
}

const NEVER = () => false

/**
 * Writes the copy. When storage is full, the copies of other projects that `canEvict` allows
 * (oldest first) make room; when none may go, the result is "quota-exceeded" and nothing is lost.
 */
export function writeMirror(
  storage: Storage | null,
  project: Project,
  now: Date,
  { canEvict = NEVER }: MirrorWriteOptions = {},
): MirrorWrite {
  if (!storage) return "unavailable"
  const key = keyOf(project.meta.id)
  let value: string
  try {
    value = JSON.stringify({ savedAt: now.toISOString(), project } satisfies MirrorEntry)
  } catch {
    return "unavailable"
  }
  for (;;) {
    try {
      storage.setItem(key, value)
      return "ok"
    } catch (error) {
      if (!isQuotaError(error)) return "unavailable"
      try {
        if (!evictOldest(storage, key, canEvict)) return "quota-exceeded"
      } catch {
        return "quota-exceeded"
      }
    }
  }
}

/** One copy, or null when missing or unreadable. */
export function readMirror(storage: Storage | null, projectId: string): MirrorEntry | null {
  try {
    return storage ? parse(storage.getItem(keyOf(projectId))) : null
  } catch {
    return null
  }
}

/** Every readable copy, keyed by project id. */
export function readAllMirrors(storage: Storage | null): Map<string, MirrorEntry> {
  const entries = new Map<string, MirrorEntry>()
  if (!storage) return entries
  try {
    for (const key of mirrorKeys(storage)) {
      const entry = parse(storage.getItem(key))
      if (entry) entries.set(key.slice(MIRROR_PREFIX.length), entry)
    }
  } catch {
    // Blocked storage: no copies.
  }
  return entries
}

export function removeMirror(storage: Storage | null, projectId: string): void {
  try {
    storage?.removeItem(keyOf(projectId))
  } catch {
    // Nothing to remove when storage is blocked.
  }
}
