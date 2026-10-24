import type { StorageWarning } from "@/lib/storage/persist"
import type { SaveErrorCode } from "@/lib/storage/save-error"
import type { ProjectStoreState } from "./state"

/**
 * The always-visible save status (D-08, PLAN-DASH-04 step 3), most important first:
 * error, saving, storage warning (saved, but storage is at risk), saved at, idle.
 * Copy: `shell.storage.saveStatus.<kind>`.
 */
export type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; code: SaveErrorCode; mirrored: boolean }
  | { kind: "storage-warning"; warning: StorageWarning; at: string | null }

export const SAVE_STATUS_KINDS = ["idle", "saving", "saved", "error", "storage-warning"] as const satisfies readonly SaveStatus["kind"][]

function compute({ save, health }: Pick<ProjectStoreState, "save" | "health">, hasActive: boolean): SaveStatus {
  if (!hasActive) return { kind: "idle" }
  if (save.state === "error") return { kind: "error", code: save.error ?? "write-failed", mirrored: save.mirrored }
  if (save.state === "saving") return { kind: "saving" }
  if (health.warning) return { kind: "storage-warning", warning: health.warning, at: save.savedAt }
  if (save.savedAt) return { kind: "saved", at: save.savedAt }
  return { kind: "idle" }
}

let cache: { save: unknown; health: unknown; hasActive: boolean; result: SaveStatus } | null = null

/** Memoized on its inputs, so it is a stable `useProjectStore` selector. */
export function selectSaveStatus(state: ProjectStoreState): SaveStatus {
  const hasActive = state.active !== null
  if (cache && cache.save === state.save && cache.health === state.health && cache.hasActive === hasActive) return cache.result
  const result = compute(state, hasActive)
  cache = { save: state.save, health: state.health, hasActive, result }
  return result
}
