"use client"

import { useSyncExternalStore } from "react"

/**
 * Whether the user confirmed what is sent and to whom (D-71, D-72), held in this module's memory
 * for the open tab only, like the key: never stored, so a reload asks again. Module memory keeps
 * it across pages of the dashboard while the key is kept too.
 */
let acknowledged = false
const listeners = new Set<() => void>()

export function setAcknowledged(value: boolean): void {
  acknowledged = value
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The confirmation; false on the server and during hydration. */
export function useAcknowledged(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => acknowledged,
    () => false,
  )
}
