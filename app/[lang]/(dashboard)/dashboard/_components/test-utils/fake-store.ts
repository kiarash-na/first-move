import { vi } from "vitest"
import { INITIAL_STATE, type ProjectStore, type ProjectStoreState } from "@/lib/store"

/** Tests only: a store with a given state and spied actions, for states that are slow to reach for real. */
export function fakeStore(state: Partial<ProjectStoreState> = {}) {
  let current: ProjectStoreState = { ...INITIAL_STATE, phase: "ready", ...state }
  const listeners = new Set<() => void>()
  const set = (patch: Partial<ProjectStoreState>) => {
    current = { ...current, ...patch }
    for (const listener of listeners) listener()
  }
  const store = {
    getState: () => current,
    getInitialState: () => INITIAL_STATE,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    start: vi.fn(async () => {}),
    dismissNotice: vi.fn((id: number) => set({ notices: current.notices.filter((notice) => notice.id !== id) })),
    exportProject: vi.fn(async () => null),
  }
  return { store: store as unknown as ProjectStore, spies: store, set }
}
