/** A key opened from the vault is dropped from memory after 30 minutes without use (D-50). */
export const IDLE_LOCK_MS = 30 * 60 * 1000

/** What counts as use: any key press or pointer press in this tab. */
const ACTIVITY = ["pointerdown", "keydown"] as const

export interface IdleLock {
  /** Restarts the countdown, e.g. when a request is sent. */
  touch(): void
  stop(): void
}

/**
 * Calls `onLock` once after `ms` without activity in `target`, then stops. Per tab: nothing is
 * shared with other tabs.
 */
export function startIdleLock(onLock: () => void, ms = IDLE_LOCK_MS, target: EventTarget = window): IdleLock {
  let timer: ReturnType<typeof setTimeout> | undefined
  const stop = () => {
    clearTimeout(timer)
    for (const type of ACTIVITY) target.removeEventListener(type, touch)
  }
  function touch() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      stop()
      onLock()
    }, ms)
  }
  for (const type of ACTIVITY) target.addEventListener(type, touch, { passive: true })
  touch()
  return { touch, stop }
}
