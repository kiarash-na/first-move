/**
 * Data-safety limits and timings (PLAN-DASH-04, D-11..D-14). Team-set defaults; see the phase 04
 * note for why each value was chosen.
 */

/** Older states kept per project (D-11: 20 rolling snapshots). */
export const MAX_SNAPSHOTS = 20

/** An autosave keeps the previous state as a snapshot at most this often. */
export const SNAPSHOT_INTERVAL_MS = 5 * 60_000

/** Autosave waits this long after the last edit (PLAN-DASH-04 step 3). */
export const AUTOSAVE_DELAY_MS = 400

/** A failed save is retried after this delay (and on the next edit). */
export const SAVE_RETRY_MS = 5_000

/** Opening IndexedDB can hang in a few browsers; after this the app falls back to the mirror. */
export const DB_OPEN_TIMEOUT_MS = 5_000

/** Largest import file (PLAN-DASH-04 step 2), in bytes and as shown to the user. */
export const IMPORT_MAX_MEGABYTES = 5
export const IMPORT_MAX_BYTES = IMPORT_MAX_MEGABYTES * 1024 * 1024

/** At most this many bad fields are listed for a rejected import; the rest are counted. */
export const IMPORT_MAX_LISTED_ERRORS = 20

/** Export reminder: after this many saved edits, or days with unexported edits; then a pause. */
export const REMINDER_RULES = { edits: 30, days: 7, snoozeHours: 24 } as const

export type ReminderRules = { readonly edits: number; readonly days: number; readonly snoozeHours: number }

/** Storage counts as low when less than this is free, or more than this share is used. */
export const LOW_SPACE = { freeBytes: 10 * 1024 * 1024, usedRatio: 0.9 } as const

/** Storage use is re-estimated after this many saves. */
export const HEALTH_CHECK_EVERY_SAVES = 25
