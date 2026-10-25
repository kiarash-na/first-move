import { KEYS } from "../keys/registry"
import type { Provider } from "./types"

/**
 * The provider a key view starts on (owner, 2026-10-25): a key already in memory decides (the
 * Gateway key may come from the AI Plan Score, and the other way around); with none — or both —
 * OpenRouter is the default and the Gateway the second option.
 */
export function firstProvider(): Provider {
  return KEYS.openrouter.read() || !KEYS.gateway.read() ? "openrouter" : "gateway"
}
