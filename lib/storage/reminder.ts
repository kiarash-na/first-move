import { REMINDER_RULES, type ReminderRules } from "./limits"
import type { BackupState } from "./types"

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS

const elapsed = (since: string | null, now: Date) => (since ? now.getTime() - Date.parse(since) : 0)

/** Bookkeeping of a project that has never been exported or edited. */
export function emptyBackup(projectId: string): BackupState {
  return { projectId, exportedAt: null, editsSinceExport: 0, pendingSince: null, remindedAt: null }
}

/** One more saved edit. */
export function recordEdit(state: BackupState, now: Date): BackupState {
  return {
    ...state,
    editsSinceExport: state.editsSinceExport + 1,
    pendingSince: state.pendingSince ?? now.toISOString(),
  }
}

/** An export (download or linked-file write) resets the count. */
export function recordExport(state: BackupState, now: Date): BackupState {
  return { ...state, exportedAt: now.toISOString(), editsSinceExport: 0, pendingSince: null }
}

/** The reminder was shown; it pauses for `snoozeHours`. */
export function recordReminder(state: BackupState, now: Date): BackupState {
  return { ...state, remindedAt: now.toISOString() }
}

/**
 * Export reminder (D-11): after `edits` saved edits, or `days` since the first unexported edit,
 * and not again within `snoozeHours` of the last reminder.
 */
export function shouldRemind(state: BackupState, now: Date, rules: ReminderRules = REMINDER_RULES): boolean {
  if (state.editsSinceExport === 0) return false
  if (state.remindedAt && elapsed(state.remindedAt, now) < rules.snoozeHours * HOUR_MS) return false
  return state.editsSinceExport >= rules.edits || elapsed(state.pendingSince, now) >= rules.days * DAY_MS
}
