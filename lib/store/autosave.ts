import { createDebouncer, type Timers } from "./debounce"

/** idle: everything saved · pending: waiting for the debounce · saving: writing · error: will retry. */
export type AutosaveState = "idle" | "pending" | "saving" | "error"

export interface AutosaveOptions<T> {
  /** Wait after the last change (PLAN-DASH-04: 400 ms). */
  delayMs: number
  /** Wait before retrying a failed save. */
  retryMs: number
  timers?: Timers
  /** Writes the full value; resolves true when it is stored. */
  save(value: T): Promise<boolean>
  /** Synchronous best-effort copy for page unload (the localStorage mirror); true when written. */
  saveSync(value: T): boolean
  onChange?(state: AutosaveState): void
}

export interface Autosave<T> {
  /** A new full value; saved after `delayMs` without further changes. */
  schedule(value: T): void
  /** Saves now and waits; true when everything is stored. */
  flush(): Promise<boolean>
  /** For page unload: copies synchronously and starts the write. True when the latest value is kept. */
  flushSync(): boolean
  /** A change is not stored yet (waiting, writing or failed). */
  pending(): boolean
  /** The newest value handed to `schedule` that may not be stored yet. */
  latest(): T | undefined
  readonly state: AutosaveState
  /** Drops waiting changes (the project was deleted elsewhere). A running write still finishes. */
  cancel(): void
}

/** Rounds `flush` follows changes that arrive while it writes. */
const MAX_FLUSH_ROUNDS = 10

/**
 * Debounced autosave of one value with one write at a time (PLAN-DASH-04 step 3). Values are full
 * states, so the newest one supersedes any waiting one, and a failed write is simply retried.
 */
export function createAutosave<T>({ delayMs, retryMs, timers, save, saveSync, onChange }: AutosaveOptions<T>): Autosave<T> {
  const timer = createDebouncer(timers)
  let latest: T | undefined
  /** `latest` has not been handed to `save` yet. */
  let dirty = false
  let inFlight: Promise<boolean> | null = null
  /** `latest` was copied by `saveSync`. */
  let synced = false
  let lastOk = true
  let generation = 0
  let state: AutosaveState = "idle"

  const emit = (next: AutosaveState) => {
    if (state === next) return
    state = next
    onChange?.(next)
  }

  function drain(): Promise<boolean> {
    if (inFlight) return inFlight
    if (!dirty) return Promise.resolve(lastOk)
    timer.cancel()
    const value = latest as T
    const current = generation
    dirty = false
    emit("saving")
    inFlight = (async () => {
      let ok: boolean
      try {
        ok = await save(value)
      } catch {
        ok = false
      }
      inFlight = null
      if (current !== generation) {
        emit("idle")
        return ok
      }
      lastOk = ok
      if (!ok) {
        dirty = true
        emit("error")
        timer.run(() => void drain(), retryMs)
        return false
      }
      if (dirty) {
        emit("pending")
        if (!timer.waiting) timer.run(() => void drain(), delayMs)
      } else {
        emit("idle")
      }
      return true
    })()
    return inFlight
  }

  return {
    schedule(value) {
      latest = value
      dirty = true
      synced = false
      if (!inFlight) emit("pending")
      timer.run(() => void drain(), delayMs)
    },

    async flush() {
      for (let round = 0; round < MAX_FLUSH_ROUNDS; round++) {
        if (!dirty && !inFlight) return lastOk
        if (!(await drain())) return false
      }
      return !dirty && !inFlight
    },

    flushSync() {
      if (!dirty && !inFlight) return true
      if (!synced && latest !== undefined) synced = saveSync(latest)
      if (dirty && !inFlight) void drain()
      return synced
    },

    pending: () => dirty || inFlight !== null,

    latest: () => latest,

    get state() {
      return state
    },

    cancel() {
      generation++
      timer.cancel()
      dirty = false
      latest = undefined
      lastOk = true
      if (!inFlight) emit("idle")
    },
  }
}
