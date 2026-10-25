import { gatewayClient } from "../gateway/client"
import { openRouterClient, type OpenRouterKeyInfo } from "../openrouter/client"
import type { Provider } from "./types"

/** What a key check found: the Gateway's balance, or the OpenRouter key's limit and expiry. */
export type KeyCheck = { provider: "gateway"; balance: number | null } | { provider: "openrouter"; info: OpenRouterKeyInfo }

/** Checks a key with the provider before the assistant uses it. Throws what the error mapping reads. */
export async function checkKey(provider: Provider, key: string, fetch?: typeof globalThis.fetch): Promise<KeyCheck> {
  if (provider === "gateway") {
    const balance = Number((await gatewayClient(key, fetch).credits()).balance)
    return { provider, balance: Number.isFinite(balance) ? balance : null }
  }
  return { provider, info: await openRouterClient(key, fetch).keyInfo() }
}
