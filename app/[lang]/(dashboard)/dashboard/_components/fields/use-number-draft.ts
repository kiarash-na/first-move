"use client"

import { useState } from "react"
import { formatInputNumber, inputPatchValue, showsValue } from "@/lib/dashboard/number-input"
import type { Locale } from "@/lib/i18n/locales"
import type { PatchError } from "@/lib/project"

export interface NumberDraft {
  text: string
  error: PatchError | null
  change: (text: string) => void
  blur: () => void
}

/**
 * The text of a number input. Every keystroke is patched at once (live results); a rejected
 * value keeps the typed text and its error while the project keeps its last valid value. A
 * change from elsewhere (reset, other tab, undo) replaces the text unless it already shows it.
 */
export function useNumberDraft(
  value: number | null,
  lang: Locale,
  commit: (value: number | string | null) => PatchError[],
): NumberDraft {
  const [text, setText] = useState(() => formatInputNumber(value, lang))
  const [error, setError] = useState<PatchError | null>(null)
  const [seen, setSeen] = useState({ value, lang })

  // Adjusting state to new props during render (React: "storing information from previous renders").
  if (seen.value !== value || seen.lang !== lang) {
    setSeen({ value, lang })
    if (seen.lang !== lang || !showsValue(text, value, lang)) {
      setText(formatInputNumber(value, lang))
      setError(null)
    }
  }

  return {
    text,
    error,
    change(next) {
      setText(next)
      setError(commit(inputPatchValue(next, lang))[0] ?? null)
    },
    blur() {
      if (!error) setText(formatInputNumber(value, lang))
    },
  }
}
