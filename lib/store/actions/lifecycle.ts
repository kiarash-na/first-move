import type { Project } from "@/lib/project"
import { LAST_PROJECT_KEY } from "@/lib/storage/keys"
import type { RecoveryReport } from "@/lib/storage/recovery"
import { createRepository, type Repository } from "@/lib/storage/repository"
import { createTabSync } from "@/lib/storage/tab-sync"
import { installUnloadGuard } from "@/lib/storage/unload-guard"
import { readActiveIds, rememberActive } from "../active-ids"
import type { Runtime, StoreContext } from "../context"
import { INITIAL_STATE, type ProjectStoreState } from "../state"
import { sortSummaries, toSummary } from "../summary"
import { flushAllSync } from "./editing"
import { loadFileLink } from "./file-link"
import { refreshHealth, requestPersistenceOnce } from "./health"
import { maybeRemind } from "./reminder"
import { restingSave } from "./saving"
import { handleTabMessage } from "./tab-messages"

const EMPTY_REPORT: RecoveryReport = { projects: [], unreadable: [] }

/** Opens IndexedDB and loads everything; falls back to the mirror, then to memory (never throws). */
async function load(ctx: StoreContext, local: Storage | null): Promise<{ repo: Repository; report: RecoveryReport }> {
  const now = ctx.deps.now
  const db = await ctx.deps.openDb(() => ctx.notify({ kind: "reload-required" })).catch(() => null)
  const repo = createRepository({ db, local, now })
  try {
    return { repo, report: await repo.loadAll() }
  } catch {
    repo.close()
  }
  const fallback = createRepository({ db: null, local, now })
  try {
    return { repo: fallback, report: await fallback.loadAll() }
  } catch {
    return { repo: createRepository({ db: null, local: null, now }), report: EMPTY_REPORT }
  }
}

function createRuntime(ctx: StoreContext, repo: Repository, local: Storage | null, session: Storage | null): Runtime {
  const rt: Runtime = {
    repo,
    local,
    session,
    sync: { post: () => undefined, close: () => undefined },
    guard: null,
    savers: new Map(),
    bases: new Map(),
    fileApi: ctx.deps.fileLinkApi(),
    fileRecord: null,
    fileHandle: null,
    fileWrites: Promise.resolve(),
    persistRequested: false,
    persistDenied: false,
    savesSinceHealthCheck: 0,
    dispose: [],
  }
  rt.sync = createTabSync({
    tabId: ctx.deps.tabId,
    createChannel: ctx.deps.createChannel,
    onMessage: (message) => void handleTabMessage(ctx, rt, message),
  })
  rt.dispose.push(() => rt.sync.close())

  const win = ctx.deps.window()
  if (win) {
    rt.guard = installUnloadGuard({ target: win, flush: () => flushAllSync(rt) })
    rt.dispose.push(() => rt.guard?.dispose())
    // "Last used" follows other tabs, so Continue offers what was opened last anywhere.
    const onStorage = (event: StorageEvent) => {
      if (event.key === LAST_PROJECT_KEY) ctx.set({ lastUsedId: event.newValue })
    }
    win.addEventListener("storage", onStorage)
    rt.dispose.push(() => win.removeEventListener("storage", onStorage))
  }
  return rt
}

function initialState(rt: Runtime, projects: Project[]): Partial<ProjectStoreState> {
  const ids = readActiveIds(rt.session, rt.local)
  const known = (id: string | null) => (id !== null && projects.some((project) => project.meta.id === id) ? id : null)
  const lastUsedId = known(ids.lastUsedId)
  const activeId = known(ids.activeId) ?? lastUsedId
  const active = projects.find((project) => project.meta.id === activeId) ?? null
  if (activeId) rememberActive(rt.session, null, activeId)
  return {
    phase: "ready",
    mode: rt.repo.mode,
    projects: sortSummaries(projects.map(toSummary)),
    activeId,
    active,
    lastUsedId,
    save: restingSave(rt.repo.mode, active),
    health: { ...INITIAL_STATE.health, warning: rt.repo.mode === "indexeddb" ? null : "unavailable" },
    fileLink: { ...INITIAL_STATE.fileLink, supported: Boolean(rt.fileApi) },
  }
}

/**
 * Loads storage once (PLAN-DASH-04): IndexedDB → mirror → latest snapshot, restores this tab's
 * project (sessionStorage, else last used), joins the tab channel and arms the unload guard.
 * Runs in an effect only. The store calls it once and hands every later caller the same promise,
 * so effects that start it are idempotent (Activity and Strict Mode re-run effects).
 */
export async function runStart(ctx: StoreContext): Promise<Runtime> {
  ctx.set({ phase: "loading" })
  const local = ctx.deps.localStorage()
  const session = ctx.deps.sessionStorage()
  const { repo, report } = await load(ctx, local)
  const rt = createRuntime(ctx, repo, local, session)
  ctx.rt = rt

  const projects = report.projects.map((entry) => entry.project)
  for (const project of projects) rt.bases.set(project.meta.id, project.meta.updatedAt)
  ctx.set(initialState(rt, projects))

  const recovered = report.projects.filter((entry) => entry.from !== "indexeddb").length
  if (recovered > 0 && repo.mode === "indexeddb") ctx.notify({ kind: "recovered", count: recovered })
  if (report.unreadable.length > 0) ctx.notify({ kind: "unreadable", count: report.unreadable.length })

  await loadFileLink(ctx)
  const { activeId } = ctx.get()
  if (activeId) void maybeRemind(ctx, rt, activeId)
  void (projects.length > 0 ? requestPersistenceOnce(ctx) : refreshHealth(ctx))
  return rt
}

/** Tests: stops timers, listeners and the database connection, and resets the state. */
export function runStop(ctx: StoreContext): void {
  const rt = ctx.rt
  if (!rt) return
  for (const saver of rt.savers.values()) saver.cancel()
  for (const dispose of rt.dispose) dispose()
  rt.repo.close()
  ctx.rt = null
  ctx.api.setState(INITIAL_STATE, true)
}
