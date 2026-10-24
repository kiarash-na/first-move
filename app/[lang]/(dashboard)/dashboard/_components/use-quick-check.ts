"use client"

import type { Project } from "@/lib/project"
import { run, type QuickCheckRun } from "@/lib/quick-check"
import { useStoreState } from "./store-provider"

const RUNS = new WeakMap<Project, QuickCheckRun>()

/** `run(project)` once per project state: every component of a page shares the same result. */
export function quickCheckOf(project: Project): QuickCheckRun {
  let result = RUNS.get(project)
  if (!result) {
    result = run(project)
    RUNS.set(project, result)
  }
  return result
}

/**
 * The open project and its live Quick Check (D-05: results are derived on the client, never
 * stored). Both are null on the server, during hydration and while no project is open.
 */
export function useQuickCheck(): { project: Project | null; result: QuickCheckRun | null } {
  const project = useStoreState((state) => state.active)
  return { project, result: project ? quickCheckOf(project) : null }
}
