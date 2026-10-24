"use client"

import { useEffect, useSyncExternalStore } from "react"
import type { ProjectStore } from "./create-project-store"
import { getProjectStore } from "./project-store"
import { INITIAL_STATE, type ProjectStoreState } from "./state"

/**
 * Reads the project store on the client (PLAN-DASH-04 step 4). The server snapshot is the empty
 * `INITIAL_STATE` (`phase: "idle"`), so the static shell and hydration never depend on browser
 * storage; show skeletons until `phase === "ready"`. The selector must return a value that is
 * stable for the same state (a slice, a primitive, or a memoized selector like `selectSaveStatus`).
 */
export function useProjectStore<T>(selector: (state: ProjectStoreState) => T, store: ProjectStore = getProjectStore()): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(INITIAL_STATE),
  )
}

/**
 * Starts the store once (idempotent, no cleanup), e.g. in the dashboard layout's client provider.
 * Routes kept alive by Activity and Strict Mode may run this effect again; it does nothing then.
 */
export function useStartProjectStore(store: ProjectStore = getProjectStore()): void {
  useEffect(() => {
    void store.start()
  }, [store])
}
