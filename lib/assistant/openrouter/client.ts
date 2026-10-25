import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { z } from "zod"

/**
 * OpenRouter for the assistant (O7): the browser calls `openrouter.ai` directly with the user's
 * key, through its OpenAI-compatible API (CORS allows any origin with these headers, checked on
 * 2026-10-25). No request passes through our servers.
 */
export const OPENROUTER_API = "https://openrouter.ai/api/v1"

/** App attribution OpenRouter asks for (both optional); no user or project data. */
export const OPENROUTER_HEADERS = { "HTTP-Referer": "https://firstmove.energy", "X-OpenRouter-Title": "First Move" } as const

/** The privacy switch of every OpenRouter call: only providers that do not collect the data. */
export const OPENROUTER_PROVIDER_OPTIONS = { openrouter: { provider: { data_collection: "deny" } } } as const

/** What `GET /api/v1/key` says about the key: its credit limit and, where given, its expiry. */
export interface OpenRouterKeyInfo {
  /** USD, or null without a limit. */
  limit: number | null
  limitRemaining: number | null
  /** "daily", "weekly", "monthly", or null when it never resets. */
  limitReset: string | null
  usage: number
  /** ISO time, or null when the key never expires or the response does not say. */
  expiresAt: string | null
}

const keyResponse = z.object({
  data: z.object({
    limit: z.number().nullable().optional(),
    limit_remaining: z.number().nullable().optional(),
    limit_reset: z.string().nullable().optional(),
    usage: z.number().optional(),
    expires_at: z.string().nullable().optional(),
  }),
})

/** An HTTP failure the error mapping understands (`statusCode`), without the response body. */
function httpError(status: number): Error {
  return Object.assign(new Error(`OpenRouter answered ${status}`), { statusCode: status })
}

export function openRouterClient(apiKey: string, fetch: typeof globalThis.fetch = (input, init) => globalThis.fetch(input, init)) {
  const provider = createOpenAICompatible({ name: "openrouter", baseURL: OPENROUTER_API, apiKey, headers: { ...OPENROUTER_HEADERS }, fetch, includeUsage: true })
  return {
    chatModel: (id: string) => provider.chatModel(id),
    /** Checks the key and reads its limit: `GET /api/v1/key`. */
    async keyInfo(signal?: AbortSignal): Promise<OpenRouterKeyInfo> {
      const response = await fetch(`${OPENROUTER_API}/key`, { headers: { Authorization: `Bearer ${apiKey}`, ...OPENROUTER_HEADERS }, signal })
      if (!response.ok) throw httpError(response.status)
      const parsed = keyResponse.safeParse(await response.json())
      if (!parsed.success) throw httpError(502)
      const data = parsed.data.data
      return {
        limit: data.limit ?? null,
        limitRemaining: data.limit_remaining ?? null,
        limitReset: data.limit_reset ?? null,
        usage: data.usage ?? 0,
        expiresAt: data.expires_at ?? null,
      }
    },
  }
}

export type OpenRouterClient = ReturnType<typeof openRouterClient>
