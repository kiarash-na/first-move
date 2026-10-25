import { APICallError } from "ai"
import { describe, expect, it } from "vitest"
import { assistantErrorCode } from "./errors"

const apiError = (statusCode: number) =>
  new APICallError({ message: "x", url: "https://openrouter.ai/api/v1/chat/completions", requestBodyValues: {}, statusCode, isRetryable: statusCode >= 500 })

describe("assistantErrorCode", () => {
  it("maps provider statuses to copy codes", () => {
    expect(assistantErrorCode(apiError(401))).toBe("key")
    expect(assistantErrorCode(apiError(402))).toBe("credits")
    expect(assistantErrorCode(apiError(403))).toBe("forbidden")
    expect(assistantErrorCode(apiError(404))).toBe("model")
    expect(assistantErrorCode(apiError(429))).toBe("rate")
    expect(assistantErrorCode(apiError(502))).toBe("provider")
  })

  it("reads OpenRouter's in-stream error objects", () => {
    expect(assistantErrorCode({ code: 402, message: "Insufficient credits" })).toBe("credits")
    expect(assistantErrorCode({ code: 429, message: "Rate limited" })).toBe("rate")
    expect(assistantErrorCode({ message: "no code" })).toBe("unknown")
  })

  it("recognises aborts and network failures", () => {
    expect(assistantErrorCode(new DOMException("stop", "AbortError"))).toBe("aborted")
    expect(assistantErrorCode(new TypeError("Failed to fetch"))).toBe("network")
  })
})
