"use client"

import { createContext, useContext, type ReactNode } from "react"

import { getProjectStore, useProjectStore, type ProjectStore, type ProjectStoreState } from "@/lib/store"

const StoreContext = createContext<ProjectStore | null>(null)

/** Lets tests hand the dashboard a store of their own; the app uses the page-wide singleton. */
export function ProjectStoreProvider({ store, children }: { store: ProjectStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

/** The project store: the provided one, else `getProjectStore()`. Call actions from events only. */
export function useStore(): ProjectStore {
  return useContext(StoreContext) ?? getProjectStore()
}

/** Reads the store (empty `INITIAL_STATE` on the server and during hydration). The selector must be stable. */
export function useStoreState<T>(selector: (state: ProjectStoreState) => T): T {
  return useProjectStore(selector, useStore())
}
