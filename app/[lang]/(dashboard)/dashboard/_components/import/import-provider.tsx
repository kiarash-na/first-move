"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { importSuccessNotes } from "@/lib/dashboard/import-messages"
import { interpolate } from "@/lib/i18n/interpolate"
import { readImportFile, type ImportFailure, type ImportSuccess } from "@/lib/storage"
import type { ImportConflict } from "@/lib/store"
import { useDictionary } from "../i18n-provider"
import { useProjectActions } from "../project-actions/use-project-actions"
import { useStore } from "../store-provider"
import { ImportConflictDialog } from "./import-conflict-dialog"
import { ImportFailureDialog } from "./import-failure-dialog"

interface ImportValue {
  /** Validates and adds a picked or dropped file, asks on an id clash, then opens it. True when imported. */
  importFile(file: Blob): Promise<boolean>
}

const ImportContext = createContext<ImportValue | null>(null)

/**
 * One import flow for the top bar and the start screen's drop zone (D-13, D-14): read and
 * validate, show errors, ask "keep both or replace" on an id clash, open the project.
 */
export function ImportProvider({ children }: { children: ReactNode }) {
  const shell = useDictionary("shell")
  const store = useStore()
  const { go } = useProjectActions()
  const [failure, setFailure] = useState<ImportFailure | null>(null)
  const [pending, setPending] = useState<ImportSuccess | null>(null)
  const answer = useRef<((choice: ImportConflict | null) => void) | null>(null)

  const adopt = useCallback(
    async (result: ImportSuccess, onConflict: ImportConflict) => {
      const outcome = await store.adoptImport(result, { onConflict })
      if (!outcome.ok) return false
      toast.success(interpolate(shell.importFlow.done, { name: outcome.project.meta.name || shell.fields.meta.name.placeholder }), {
        description: importSuccessNotes(result, shell).join(" ") || undefined,
      })
      go({ page: "overview" })
      return true
    },
    [store, shell, go],
  )

  const importFile = useCallback(
    async (file: Blob) => {
      const result = await readImportFile(file)
      if (!result.ok) {
        setFailure(result)
        return false
      }
      const clash = store.getState().projects.some((entry) => entry.id === result.project.meta.id)
      if (!clash) return adopt(result, "copy")
      setPending(result)
      const choice = await new Promise<ImportConflict | null>((resolve) => {
        answer.current = resolve
      })
      setPending(null)
      return choice ? adopt(result, choice) : false
    },
    [store, adopt],
  )

  const value = useMemo(() => ({ importFile }), [importFile])

  return (
    <ImportContext.Provider value={value}>
      {children}
      <ImportFailureDialog failure={failure} onClose={() => setFailure(null)} />
      <ImportConflictDialog
        name={pending ? pending.project.meta.name : null}
        onChoose={(choice) => {
          answer.current?.(choice)
          answer.current = null
        }}
      />
    </ImportContext.Provider>
  )
}

export function useImport(): ImportValue {
  const value = useContext(ImportContext)
  if (!value) throw new Error("ImportProvider is missing")
  return value
}
