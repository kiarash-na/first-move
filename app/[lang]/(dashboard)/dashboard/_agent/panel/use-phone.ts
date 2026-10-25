"use client"

import { useSyncExternalStore } from "react"

/** Below `md` the panel fills the screen, so it is modal there. */
export const PHONE_QUERY = "(max-width: 767px)"

const query = () => (typeof window.matchMedia === "function" ? window.matchMedia(PHONE_QUERY) : null)

function subscribe(onChange: () => void) {
  const list = query()
  list?.addEventListener("change", onChange)
  return () => list?.removeEventListener("change", onChange)
}

/** Whether the viewport is below `md`; false on the server and where `matchMedia` is missing. */
export function usePhone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => query()?.matches ?? false,
    () => false,
  )
}
