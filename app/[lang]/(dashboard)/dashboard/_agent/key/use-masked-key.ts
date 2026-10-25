"use client"

import { useSyncExternalStore } from "react"

import { KEYS } from "@/lib/assistant/keys/registry"
import type { Provider } from "@/lib/assistant/providers/types"

/** The masked key of a provider (`…a1b2`), or null; the key itself never reaches a component. */
export function useMaskedKey(provider: Provider): string | null {
  const memory = KEYS[provider]
  return useSyncExternalStore(memory.subscribe, memory.masked, () => null)
}
