import { getWebStorage, readKey, writeKey } from "@/lib/storage/web-storage"

/**
 * The cookie notice remembers that it was dismissed in one localStorage key. It is listed in the
 * Cookie Policy, and `cookies.test.ts` fails if the two drift apart.
 */
export const NOTICE_ACK_KEY = "first-move:notice-ack"

type Listener = () => void

const listeners = new Set<Listener>()
/** null until `loadNotice` has read storage on the client. */
let acknowledged: boolean | null = null

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeNotice(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True when the notice must stay hidden: dismissed, or storage not read yet. */
export function noticeHidden(): boolean {
  return acknowledged ?? true
}

/** Reads the stored choice. Client only, from an effect: storage is never read while rendering. */
export function loadNotice(): void {
  acknowledged = readKey(getWebStorage("local"), NOTICE_ACK_KEY) === "1"
  emit()
}

/** Hides the notice and remembers it. If storage is blocked it stays hidden for this page view. */
export function acknowledgeNotice(): void {
  acknowledged = true
  writeKey(getWebStorage("local"), NOTICE_ACK_KEY, "1")
  emit()
}

/** Another tab dismissed the notice. */
export function watchNoticeInOtherTabs(): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === NOTICE_ACK_KEY || event.key === null) loadNotice()
  }
  window.addEventListener("storage", onStorage)
  return () => window.removeEventListener("storage", onStorage)
}

/** Test helper: forget what was read. */
export function resetNoticeForTests(): void {
  acknowledged = null
  listeners.clear()
}
