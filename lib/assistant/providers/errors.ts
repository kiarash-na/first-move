import { gatewayErrorCode, type GatewayErrorCode } from "../gateway/errors"

/**
 * Provider and network errors as copy codes (`assistant.json` → `errors.<code>`), for both
 * providers. Errors are never shown raw: they may echo request details. OpenRouter reports some
 * failures inside the stream as `{ code, message }`, so a numeric `code` counts as the status.
 */
export type AssistantErrorCode = GatewayErrorCode

export function assistantErrorCode(error: unknown): AssistantErrorCode {
  if (error && typeof error === "object" && !(error instanceof Error) && !(error instanceof DOMException)) {
    const { code, statusCode } = error as { code?: unknown; statusCode?: unknown }
    if (typeof code === "number" && code >= 400 && statusCode === undefined) return gatewayErrorCode({ ...(error as object), statusCode: code })
  }
  return gatewayErrorCode(error)
}
