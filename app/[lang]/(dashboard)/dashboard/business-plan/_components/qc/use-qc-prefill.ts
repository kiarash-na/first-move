"use client"

import { useMemo } from "react"

import { qcPrefill, type QcPrefill } from "@/lib/business-plan"
import { useStoreState } from "../../../_components/store-provider"

/**
 * The Quick Check prefill of the open project (ALG-09). `run()` is recomputed only when a
 * Quick Check input or the module switch changes, not on every keystroke in a Business Plan text.
 */
export function useQcPrefill(): QcPrefill | null {
  const project = useStoreState((state) => state.active)
  const enabled = project?.meta.modules.quickCheck
  const buildings = project?.buildings
  const sources = project?.sources
  const quickCheck = project?.quickCheck

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `project` only matters through the four inputs above
  return useMemo(() => (project ? qcPrefill(project) : null), [enabled, buildings, sources, quickCheck])
}
