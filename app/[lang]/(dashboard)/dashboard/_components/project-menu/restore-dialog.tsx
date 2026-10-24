"use client"

import { HistoryIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { formatChangeTime } from "@/lib/dashboard/change-time"
import { interpolate } from "@/lib/i18n/interpolate"
import type { SnapshotInfo } from "@/lib/storage"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStore } from "../store-provider"

/** Lists the kept versions of a project and restores one (D-11); the current state is kept as a version first. */
export function RestoreDialog({
  projectId,
  onOpenChange,
  onCloseAutoFocus,
}: {
  projectId: string | null
  onOpenChange: (open: boolean) => void
  /** Where focus goes when the dialog closes (the menu item that opened it is gone). */
  onCloseAutoFocus?: (event: Event) => void
}) {
  const shell = useDictionary("shell")
  const lang = useLocale()
  const store = useStore()
  const [snapshots, setSnapshots] = useState<SnapshotInfo[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  useEffect(() => {
    if (!projectId) return
    let current = true
    void store.listSnapshots(projectId).then((list) => {
      if (current) setSnapshots(list)
    })
    return () => {
      current = false
      setSnapshots(null)
    }
  }, [projectId, store])

  async function restore(snapshot: SnapshotInfo) {
    setBusy(snapshot.id)
    const result = await store.restoreSnapshot(snapshot.id)
    setBusy(null)
    if (!result.ok) {
      toast.error(shell.restore.failed)
      return
    }
    toast.success(interpolate(shell.restore.done, { time: formatChangeTime(snapshot.takenAt, lang) }))
    onOpenChange(false)
  }

  return (
    <Dialog open={projectId !== null} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={shell.close} className="sm:max-w-xl" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>{shell.restore.title}</DialogTitle>
          <DialogDescription>{shell.restore.body}</DialogDescription>
        </DialogHeader>
        {snapshots === null ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label={shell.restore.loading}>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : snapshots.length === 0 ? (
          <p className="border-y py-6 text-sm text-muted-foreground">{shell.restore.empty}</p>
        ) : (
          <ul className="max-h-[50vh] divide-y overflow-y-auto border-y">
            {snapshots.map((snapshot) => (
              <li key={snapshot.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-start gap-3">
                  <HistoryIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-[520]">{formatChangeTime(snapshot.takenAt, lang)}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {shell.storage.snapshotReason[snapshot.reason]}
                      {snapshot.name ? ` · ${snapshot.name}` : ""}
                    </span>
                  </div>
                </div>
                <Button variant="secondary" disabled={busy !== null} onClick={() => void restore(snapshot)}>
                  {shell.restore.action}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter closeLabel={shell.restore.close} />
      </DialogContent>
    </Dialog>
  )
}
