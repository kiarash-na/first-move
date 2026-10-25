/**
 * Gateway and network errors as copy codes (`ai-score.json` → `errors.<code>`). Errors are never
 * shown raw: they may echo request details.
 */
export const GATEWAY_ERROR_CODES = ["key", "credits", "forbidden", "model", "rate", "provider", "network", "aborted", "unknown"] as const
export type GatewayErrorCode = (typeof GATEWAY_ERROR_CODES)[number]

interface ErrorLike {
  name?: string
  statusCode?: number
  lastError?: unknown
  cause?: unknown
}

function inner(error: unknown): ErrorLike | null {
  if (!error || typeof error !== "object") return null
  const value = error as ErrorLike
  // RetryError carries the last attempt's error.
  return value.name === "AI_RetryError" && value.lastError ? (inner(value.lastError) ?? value) : value
}

export function gatewayErrorCode(error: unknown): GatewayErrorCode {
  if (error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError")) return error.name === "AbortError" ? "aborted" : "network"
  const value = inner(error)
  if (!value) return "unknown"
  if (value.name === "AbortError") return "aborted"
  switch (value.name) {
    case "GatewayAuthenticationError":
      return "key"
    case "GatewayForbiddenError":
      return "forbidden"
    case "GatewayModelNotFoundError":
      return "model"
    case "GatewayRateLimitError":
      return "rate"
  }
  const status = value.statusCode
  if (status === 401) return "key"
  if (status === 402) return "credits"
  if (status === 403) return "forbidden"
  if (status === 404) return "model"
  if (status === 429) return "rate"
  if (status !== undefined && status >= 500) return status === 500 && /quota/i.test(String((value as { message?: string }).message)) ? "credits" : "provider"
  if (value.name === "TypeError" || /fetch|network/i.test(String((value as { message?: string }).message))) return "network"
  return "unknown"
}
