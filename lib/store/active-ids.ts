import { ACTIVE_PROJECT_KEY, LAST_PROJECT_KEY } from "@/lib/storage/keys"
import { readKey, removeKey, writeKey } from "@/lib/storage/web-storage"

/**
 * Which project is open (PLAN-DASH-00): per tab in sessionStorage, so two tabs can show two
 * projects; the last used one in localStorage for "Continue where you left off" and new tabs.
 */
export interface ActiveIds {
  activeId: string | null
  lastUsedId: string | null
}

export function readActiveIds(session: Storage | null, local: Storage | null): ActiveIds {
  return { activeId: readKey(session, ACTIVE_PROJECT_KEY), lastUsedId: readKey(local, LAST_PROJECT_KEY) }
}

/** Opening a project: this tab's choice and the last used one. */
export function rememberActive(session: Storage | null, local: Storage | null, id: string): void {
  writeKey(session, ACTIVE_PROJECT_KEY, id)
  writeKey(local, LAST_PROJECT_KEY, id)
}

/** Closing: this tab has no project open; "last used" stays. */
export function forgetActive(session: Storage | null): void {
  removeKey(session, ACTIVE_PROJECT_KEY)
}

/** A deleted project is no longer "last used". */
export function forgetLastUsed(local: Storage | null, id: string): void {
  if (readKey(local, LAST_PROJECT_KEY) === id) removeKey(local, LAST_PROJECT_KEY)
}
