/** Timer functions, injectable so tests control time. */
export interface Timers {
  setTimeout(callback: () => void, ms: number): unknown
  clearTimeout(handle: unknown): void
}

export const browserTimers: Timers = {
  setTimeout: (callback, ms) => globalThis.setTimeout(callback, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
}

export interface Debouncer {
  /** Runs `callback` after `ms`, replacing any call still waiting. */
  run(callback: () => void, ms: number): void
  cancel(): void
  /** A call is waiting. */
  readonly waiting: boolean
}

/** A single-slot debouncer (autosave waits 400 ms after the last edit, PLAN-DASH-04). */
export function createDebouncer(timers: Timers = browserTimers): Debouncer {
  let handle: unknown
  let waiting = false
  const cancel = () => {
    if (!waiting) return
    timers.clearTimeout(handle)
    waiting = false
  }
  return {
    run(callback, ms) {
      cancel()
      waiting = true
      handle = timers.setTimeout(() => {
        waiting = false
        callback()
      }, ms)
    },
    cancel,
    get waiting() {
      return waiting
    },
  }
}
