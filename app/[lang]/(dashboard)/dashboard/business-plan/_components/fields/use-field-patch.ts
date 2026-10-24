"use client"

import { useCallback, useState } from "react"

import { validationMessage } from "@/lib/dashboard/validation-message"
import type { PatchResult, ProjectPatch } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { useStore } from "../../../_components/store-provider"

/**
 * The one way a Business Plan input changes: `store.patch` (D-05). Returns the patch function
 * and the UI message of the last failed patch (cleared by the next successful one).
 */
export function useFieldPatch() {
  const store = useStore()
  const shell = useDictionary("shell")
  const bp = useDictionary("business-plan")
  const lang = useLocale()
  const [error, setError] = useState<string | null>(null)

  const patch = useCallback(
    (values: ProjectPatch): PatchResult | null => {
      const result = store.patch(values)
      if (!result) {
        setError(bp.ui.saveFailed)
      } else {
        setError(result.ok ? null : validationMessage(result.errors[0], shell, lang))
      }
      return result
    },
    [store, shell, bp, lang],
  )

  return { patch, error }
}
