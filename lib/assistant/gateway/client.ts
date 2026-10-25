import { createGateway } from "ai"
import { DECISION_MODEL_ID } from "@/lib/ai/plan-score/run"

/**
 * The Gateway client for the AI Plan Score: the browser calls `ai-gateway.vercel.sh` directly with
 * the user's key (CORS checked on 2026-10-24 for `/v4/ai/*` and `/v1/credits`; D-71, D-72). No
 * request passes through our servers.
 */

/**
 * The SDK adds a `user-agent` header, which the Gateway's CORS rules do not list; browsers that
 * let scripts set it would then fail the preflight. In a browser the header says nothing anyway.
 */
export function withoutUserAgent(base: typeof globalThis.fetch): typeof globalThis.fetch {
  return (input, init) => {
    if (!init?.headers) return base(input, init)
    const headers = new Headers(init.headers)
    headers.delete("user-agent")
    return base(input, { ...init, headers })
  }
}

export function gatewayClient(apiKey: string, fetch: typeof globalThis.fetch = (input, init) => globalThis.fetch(input, init)) {
  const gateway = createGateway({ apiKey, fetch: withoutUserAgent(fetch) })
  return {
    /** Jev, pinned (D-71). */
    decisionModel: () => gateway.decisionModel(DECISION_MODEL_ID),
    textModel: (id: string) => gateway.languageModel(id),
    /** Checks the key and reads the balance: `GET /v1/credits`. */
    credits: () => gateway.getCredits(),
  }
}

export type GatewayClient = ReturnType<typeof gatewayClient>
