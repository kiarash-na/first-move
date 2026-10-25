"use client"

import { Trash2Icon } from "lucide-react"

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDictionary } from "../../../_components/i18n-provider"

/** Deletes the saved score after a confirmation (D-02: warn before any action that can lose data). */
export function DeleteScore({ onDelete, disabled = false }: { onDelete: () => void; disabled?: boolean }) {
  const copy = useDictionary("ai-score").results.remove

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
          {copy.action}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon strokeWidth={1.5} aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete}>
            {copy.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
