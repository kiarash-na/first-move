"use client"

import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { interpolate } from "@/lib/i18n/interpolate"
import type { DeleteReceipt } from "@/lib/store"
import { useDictionary } from "../i18n-provider"
import { useStore } from "../store-provider"

/**
 * Confirms a delete (D-02: warn before data loss), then offers Undo in a toast. The deleted
 * state is also kept as a "before-delete" snapshot (PLAN-DASH-04).
 */
export function DeleteProjectDialog({
  project,
  onOpenChange,
  onDeleted,
}: {
  /** The project to delete; null keeps the dialog closed. */
  project: { id: string; name: string } | null
  onOpenChange: (open: boolean) => void
  onDeleted?: (receipt: DeleteReceipt) => void
}) {
  const shell = useDictionary("shell")
  const store = useStore()
  const name = project?.name || shell.fields.meta.name.placeholder

  async function confirm() {
    if (!project) return
    const receipt = await store.remove(project.id)
    if (!receipt) return
    onDeleted?.(receipt)
    toast(interpolate(shell.delete.done, { name }), {
      action: {
        label: shell.delete.undo,
        onClick: () => {
          void store.undoRemove(receipt).then(() => toast.success(interpolate(shell.delete.undone, { name })))
        },
      },
    })
  }

  return (
    <AlertDialog open={project !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon strokeWidth={1.5} aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{interpolate(shell.delete.title, { name })}</AlertDialogTitle>
          <AlertDialogDescription>{shell.delete.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{shell.delete.cancel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => void confirm()}>
            {shell.delete.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
