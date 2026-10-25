import { createKeyMemory } from "../keys/memory"

/** The user's OpenRouter key for the assistant, in this tab's memory only (D-50). */
export const openRouterKey = createKeyMemory()

/** OpenRouter keys start with `sk-or-`; this only rejects what cannot be one. */
export function isPlausibleOpenRouterKey(value: string): boolean {
  return /^sk-or-[A-Za-z0-9_-]{20,200}$/.test(value.trim())
}
