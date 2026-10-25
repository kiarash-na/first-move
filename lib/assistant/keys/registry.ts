import { clearGatewayKey, isPlausibleGatewayKey, maskedGatewayKey, readGatewayKey, setGatewayKey, subscribeGatewayKey } from "../gateway/key"
import { isPlausibleOpenRouterKey, openRouterKey } from "../openrouter/key"
import type { Provider } from "../providers/types"
import type { KeyMemory } from "./memory"

/**
 * The key in memory per provider. The Gateway key is the AI Plan Score's (`gateway/key.ts`), so
 * one key serves both (O7).
 */
export const KEYS: Record<Provider, KeyMemory> = {
  gateway: {
    set: setGatewayKey,
    clear: clearGatewayKey,
    read: readGatewayKey,
    masked: maskedGatewayKey,
    subscribe: subscribeGatewayKey,
  },
  openrouter: openRouterKey,
}

export const isPlausibleKey: Record<Provider, (value: string) => boolean> = {
  gateway: isPlausibleGatewayKey,
  openrouter: isPlausibleOpenRouterKey,
}
