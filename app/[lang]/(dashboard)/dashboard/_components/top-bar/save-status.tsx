"use client"

import { CircleCheckIcon, CircleDashedIcon, CircleIcon, LoaderCircleIcon, TriangleAlertIcon, type LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatChangeTime } from "@/lib/dashboard/change-time"
import { interpolate } from "@/lib/i18n/interpolate"
import { selectSaveStatus, type SaveStatus as Status } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStoreState } from "../store-provider"

const ICON: Record<Status["kind"], LucideIcon> = {
  idle: CircleDashedIcon,
  saving: LoaderCircleIcon,
  saved: CircleCheckIcon,
  error: TriangleAlertIcon,
  "storage-warning": TriangleAlertIcon,
}

/**
 * The always-visible autosave status (D-08): saving, saved at, not saved, storage at risk.
 * Status is Paper + icon + text; problems are orange + icon (D-17). Details in a tooltip.
 */
export function SaveStatus({ className }: { className?: string }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const phase = useStoreState((state) => state.phase)
  const hasActive = useStoreState((state) => state.active !== null)
  const status = useStoreState(selectSaveStatus)

  if (phase !== "ready") {
    // Same height as the loaded status (min-h-11), so the bar does not move when the store is ready.
    return (
      <span className={cn("inline-flex min-h-11 items-center", className)}>
        <Skeleton className="h-4 w-28" aria-label={shell.loading} />
      </span>
    )
  }

  const copy = shell.storage
  const time = "at" in status ? formatChangeTime(status.at, lang) : ""
  const text = hasActive ? interpolate(copy.saveStatus[status.kind], { time }) : shell.saveStatus.noProject
  const detail =
    status.kind === "error"
      ? [copy.saveError[status.code], status.mirrored ? copy.saveError.mirrored : null].filter(Boolean).join(" ")
      : status.kind === "storage-warning"
        ? copy.warning[status.warning]
        : null
  const Icon = hasActive ? ICON[status.kind] : CircleIcon
  const problem = status.kind === "error" || status.kind === "storage-warning"

  const label = (
    <span
      role="status"
      aria-live="polite"
      aria-label={detail ? `${shell.saveStatus.label}: ${text}. ${detail}` : `${shell.saveStatus.label}: ${text}`}
      data-status={hasActive ? status.kind : "none"}
      tabIndex={detail ? 0 : undefined}
      className={cn(
        "inline-flex min-h-11 min-w-0 items-center gap-2 font-mono text-xs tracking-[0.04em] uppercase",
        problem ? "text-hot" : "text-muted-foreground",
        className,
      )}
    >
      <Icon className={cn("size-4 shrink-0", status.kind === "saving" && "animate-spin")} strokeWidth={1.6} aria-hidden="true" />
      <span className="truncate">{text}</span>
    </span>
  )

  if (!detail) return label
  return (
    <Tooltip>
      <TooltipTrigger asChild>{label}</TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  )
}
