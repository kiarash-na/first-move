"use client"

import { useRef, useState } from "react"
import { formatInputNumber, inputPatchValue, showsValue } from "@/lib/dashboard/number-input"
import type { Locale } from "@/lib/i18n/locales"
import type { PatchError } from "@/lib/project"

export interface NumberDraft {
  text: string
  error: PatchError | null
  change: (text: string) => void
  blur: () => void
}

/** No edit in progress: the next keystroke starts one. */
const IDLE = Symbol("idle")

/**
 * The text of a number input. Every keystroke is patched at once (live results). A rejected
 * value keeps the typed text and its error, and the project goes back to the value it held when
 * the edit started, so the keystrokes that led to the bad text (typing `100001` passes through
 * `10000`) never stand. The edit ends on blur. A change from elsewhere (reset, other tab, undo)
 * replaces the text unless it already shows it.
 */
export function useNumberDraft(
  value: number | null,
  lang: Locale,
  commit: (value: number | string | null) => PatchError[],
): NumberDraft {
  const [text, setText] = useState(() => formatInputNumber(value, lang))
  const [error, setError] = useState<PatchError | null>(null)
  const [seen, setSeen] = useState({ value, lang })
  // The stored value when the current edit started; read and written in event handlers only.
  const origin = useRef<number | null | typeof IDLE>(IDLE)

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
      if (origin.current === IDLE) origin.current = value
      setText(next)
      const rejected = commit(inputPatchValue(next, lang))[0] ?? null
      setError(rejected)
      if (rejected && value !== origin.current) {
        // Back to the pre-edit value; marked as seen so the typed text and its error stay.
        commit(origin.current)
        setSeen({ value: origin.current, lang })
      }
    },
    blur() {
      origin.current = IDLE
      if (!error) setText(formatInputNumber(value, lang))
    },
  }
}
