"use client"

import { useCallback } from "react"
import { validationMessage } from "@/lib/dashboard/validation-message"
import type { PatchError, ProjectPatch } from "@/lib/project"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStore } from "../store-provider"

/**
 * Changes inputs the only allowed way, `store.patch` (D-05), and returns the errors of the
 * patch for the UI. Call it from event handlers only.
 */
export function useFieldPatch(): (patch: ProjectPatch) => PatchError[] {
  const store = useStore()
  return useCallback((patch: ProjectPatch) => store.patch(patch)?.errors ?? [], [store])
}

/** `shell.validation.<code>` with its limits formatted in the UI language. */
export function useValidationMessage(): (error: Pick<PatchError, "code" | "params">) => string {
  const shell = useDictionary("shell")
  const lang = useLocale()
  return useCallback((error: Pick<PatchError, "code" | "params">) => validationMessage(error, shell, lang), [shell, lang])
}
