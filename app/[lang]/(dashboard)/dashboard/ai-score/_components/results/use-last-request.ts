"use client"

import { useState } from "react"

import type { ResultActions } from "../types"

export type TextRequest = NonNullable<ResultActions["busy"]>

/**
 * The text request that ran last (report or suggestions), so its error shows next to it.
 * `actions.error` does not say which request failed; the last non-null `busy` does. Updated while
 * rendering (React's "adjust state when a prop changes"), so the error never shows in the wrong
 * place for a frame. Before any request this page saw, it is `fallback`.
 */
export function useLastRequest(busy: ResultActions["busy"], fallback: TextRequest = "report"): TextRequest {
  const [last, setLast] = useState<TextRequest>(busy ?? fallback)
  if (busy !== null && busy !== last) {
    setLast(busy)
    return busy
  }
  return last
}
