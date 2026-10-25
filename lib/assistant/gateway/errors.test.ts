import { describe, expect, it } from "vitest"
import { gatewayErrorCode } from "./errors"

const err = (props: Record<string, unknown>) => Object.assign(new Error("x"), props)

describe("gatewayErrorCode", () => {
  it("maps Gateway errors and statuses to copy codes", () => {
    expect(gatewayErrorCode(err({ name: "GatewayAuthenticationError", statusCode: 401 }))).toBe("key")
    expect(gatewayErrorCode(err({ statusCode: 402 }))).toBe("credits")
    expect(gatewayErrorCode(err({ name: "GatewayForbiddenError" }))).toBe("forbidden")
    expect(gatewayErrorCode(err({ name: "GatewayModelNotFoundError" }))).toBe("model")
    expect(gatewayErrorCode(err({ statusCode: 429 }))).toBe("rate")
    expect(gatewayErrorCode(err({ statusCode: 503 }))).toBe("provider")
    expect(gatewayErrorCode(err({ name: "GatewayInternalServerError", statusCode: 500, message: "quota_for_entity_exceeded" }))).toBe("credits")
  })

  it("looks through retries and recognises aborts and network failures", () => {
    expect(gatewayErrorCode(err({ name: "AI_RetryError", lastError: err({ statusCode: 429 }) }))).toBe("rate")
    expect(gatewayErrorCode(new DOMException("stop", "AbortError"))).toBe("aborted")
    expect(gatewayErrorCode(new TypeError("Failed to fetch"))).toBe("network")
    expect(gatewayErrorCode("weird")).toBe("unknown")
  })
})
