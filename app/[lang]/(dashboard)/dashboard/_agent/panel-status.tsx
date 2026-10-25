"use client"

import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import { useDictionary } from "../_components/i18n-provider"

/**
 * A small note above the launcher while the panel's chunk loads on the first click, or after it
 * failed to load (offline). It never covers the launcher, which tries again on the next click.
 */
export function PanelStatus({ failed, bottom }: { failed: boolean; bottom: string }) {
  const copy = useDictionary("assistant").panel
  const Icon = failed ? TriangleAlertIcon : LoaderCircleIcon

  return (
    <p
      role={failed ? "alert" : "status"}
      data-slot="assistant-panel-status"
      style={{ bottom }}
      className="fixed right-[max(1rem,env(safe-area-inset-right))] z-40 flex w-[min(20rem,calc(100vw-2rem))] items-start gap-2 border border-control-border bg-card px-3 py-2 text-sm leading-relaxed text-text-secondary shadow-panel print:hidden"
    >
      <Icon className={failed ? "mt-1 size-4 shrink-0 text-hot" : "mt-1 size-4 shrink-0 motion-safe:animate-spin"} strokeWidth={1.6} aria-hidden="true" />
      {failed ? copy.loadFailed : copy.loading}
    </p>
  )
}
