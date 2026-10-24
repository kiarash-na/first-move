import { checkStorageHealth } from "@/lib/storage/persist"
import type { StoreContext } from "../context"

/**
 * Re-checks persistence and space (D-11). The "unavailable" warning wins whenever IndexedDB is
 * not in use. `request` asks the browser for persistent storage.
 */
export async function refreshHealth(ctx: StoreContext, { request = false } = {}): Promise<void> {
  const rt = ctx.rt
  if (!rt) return
  const health = await checkStorageHealth(ctx.deps.storageManager(), { request, deniedBefore: rt.persistDenied })
  if (request && health.persisted === false) rt.persistDenied = true
  const warning = rt.repo.mode === "indexeddb" ? health.warning : "unavailable"
  ctx.set({ health: { ...health, warning } })
}

/**
 * Asks for persistent storage once per session, when the user has data worth keeping (on start
 * with projects, or on the first create, import or save). Firefox shows a prompt for it.
 */
export async function requestPersistenceOnce(ctx: StoreContext): Promise<void> {
  const rt = ctx.rt
  if (!rt || rt.persistRequested) return
  rt.persistRequested = true
  await refreshHealth(ctx, { request: true })
}
