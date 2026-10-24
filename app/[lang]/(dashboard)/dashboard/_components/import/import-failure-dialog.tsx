"use client"

import { FileWarningIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { importFailureText } from "@/lib/dashboard/import-messages"
import type { ImportFailure } from "@/lib/storage"
import { useDictionary, useLocale, useTextRef } from "../i18n-provider"

/** Why a file was rejected (D-14), with the first bad fields by their labels. Text only, never HTML. */
export function ImportFailureDialog({ failure, onClose }: { failure: ImportFailure | null; onClose: () => void }) {
  const shell = useDictionary("shell")
  const lang = useLocale()
  const label = useTextRef()
  const text = failure ? importFailureText(failure, shell, lang, (ref) => label(ref)) : null

  return (
    <AlertDialog open={failure !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <FileWarningIcon strokeWidth={1.5} aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{shell.importFlow.failedTitle}</AlertDialogTitle>
          <AlertDialogDescription>{text?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        {text && text.fields.length > 0 && (
          <ul className="max-h-60 overflow-y-auto border-y py-2 text-sm leading-relaxed text-text-secondary">
            {text.fields.map((line, index) => (
              <li key={index} className="py-1">
                {line}
              </li>
            ))}
          </ul>
        )}
        <AlertDialogFooter>
          <AlertDialogAction variant="secondary">{shell.importFlow.close}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
