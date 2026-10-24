import { recordReminder, shouldRemind } from "@/lib/storage/reminder"
import type { BackupState } from "@/lib/storage/types"
import type { Runtime, StoreContext } from "../context"

/**
 * Shows the export reminder (D-11) when a project is due: after a save, and when it is opened
 * (so "N days without export" also shows up without a new edit). Not while a linked file is
 * written on every save. The reminder then pauses (`recordReminder`).
 */
export async function maybeRemind(ctx: StoreContext, rt: Runtime, projectId: string, known?: BackupState | null): Promise<void> {
  if (rt.fileHandle && ctx.get().activeId === projectId) return
  const now = ctx.deps.now()
  let backup = known ?? null
  if (!backup) {
    try {
      backup = await rt.repo.readBackup(projectId)
    } catch {
      return
    }
  }
  if (!shouldRemind(backup, now)) return
  ctx.notify({ kind: "export-reminder", projectId })
  await rt.repo.updateBackup(projectId, (state) => recordReminder(state, now)).catch(() => undefined)
}
