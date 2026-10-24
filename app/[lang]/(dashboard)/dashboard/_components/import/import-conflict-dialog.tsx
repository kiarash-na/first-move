"use client"

import { CopyIcon } from "lucide-react"

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
import type { ImportConflict } from "@/lib/store"
import { useDictionary } from "../i18n-provider"

/** The file's project is already stored: keep both (default) or replace it (PLAN-DASH-04). */
export function ImportConflictDialog({
  name,
  onChoose,
}: {
  /** The project name in the file; null keeps the dialog closed. */
  name: string | null
  onChoose: (choice: ImportConflict | null) => void
}) {
  const shell = useDictionary("shell")
  const copy = shell.importFlow

  return (
    <AlertDialog open={name !== null} onOpenChange={(open) => !open && onChoose(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="text-primary">
            <CopyIcon strokeWidth={1.5} aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{copy.conflictTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {interpolate(copy.conflictBody, { name: name || shell.fields.meta.name.placeholder })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
          <AlertDialogAction variant="secondary" onClick={() => onChoose("replace")}>
            {copy.replace}
          </AlertDialogAction>
          <AlertDialogAction onClick={() => onChoose("copy")}>{copy.copy}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
