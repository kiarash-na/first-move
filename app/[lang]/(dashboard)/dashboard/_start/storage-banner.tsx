"use client"

import { TriangleAlertIcon } from "lucide-react"

import { useDictionary } from "../_components/i18n-provider"
import { useStoreState } from "../_components/store-provider"

/** Warns when the browser may lose the projects (D-11): no IndexedDB, little space, not persisted. */
export function StorageBanner() {
  const shell = useDictionary("shell")
  const phase = useStoreState((state) => state.phase)
  const warning = useStoreState((state) => state.health.warning)
  if (phase !== "ready" || !warning) return null

  return (
    <div role="status" data-warning={warning} className="flex items-start gap-3 border border-hot/60 bg-hot/5 px-5 py-4">
      <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
      <p className="max-w-[80ch] text-base leading-relaxed text-foreground">{shell.storage.warning[warning]}</p>
    </div>
  )
}
