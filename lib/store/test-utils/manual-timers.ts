import type { Timers } from "@/lib/store/debounce"

/** Test helper: timers that run only when the test advances time. Not used by the app. */
export interface ManualTimers extends Timers {
  advance(ms: number): void
  readonly pending: number
}

export function manualTimers(): ManualTimers {
  let now = 0
  let nextId = 0
  const queue = new Map<number, { at: number; callback: () => void }>()
  return {
    setTimeout(callback, ms) {
      const id = ++nextId
      queue.set(id, { at: now + ms, callback })
      return id
    },
    clearTimeout(handle) {
      queue.delete(handle as number)
    },
    advance(ms) {
      const target = now + ms
      for (;;) {
        const due = [...queue.entries()].filter(([, entry]) => entry.at <= target).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0]
        if (!due) break
        queue.delete(due[0])
        now = due[1].at
        due[1].callback()
      }
      now = target
    },
    get pending() {
      return queue.size
    },
  }
}
