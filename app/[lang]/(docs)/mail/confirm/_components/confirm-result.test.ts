// @vitest-environment node
import { describe, expect, it } from "vitest"
import { CONFIRM_STATUS } from "@/lib/mail-agent/consent/confirm"
import { resultForStatus, tokenFromHash } from "./confirm-result"

describe("resultForStatus", () => {
  it("has copy for every status the confirm route answers with", () => {
    expect(resultForStatus(CONFIRM_STATUS.confirmed)).toBe("confirmed")
    expect(resultForStatus(CONFIRM_STATUS.expired)).toBe("expired")
    expect(resultForStatus(CONFIRM_STATUS.used)).toBe("used")
    expect(resultForStatus(CONFIRM_STATUS.invalid)).toBe("invalid")
    expect(resultForStatus(CONFIRM_STATUS.forbidden)).toBe("invalid")
    expect(resultForStatus(CONFIRM_STATUS.error)).toBe("error")
    expect(resultForStatus(CONFIRM_STATUS.unavailable)).toBe("error")
  })

  it("treats anything else as an error to try again later", () => {
    expect(resultForStatus(404)).toBe("error")
    expect(resultForStatus(502)).toBe("error")
  })
})

describe("tokenFromHash", () => {
  it("reads the token from the fragment", () => {
    expect(tokenFromHash("#t=v1.abc.123.def")).toBe("v1.abc.123.def")
    expect(tokenFromHash("t=v1.abc")).toBe("v1.abc")
  })

  it("is null without a token", () => {
    expect(tokenFromHash("")).toBeNull()
    expect(tokenFromHash("#")).toBeNull()
    expect(tokenFromHash("#t=")).toBeNull()
    expect(tokenFromHash("#x=1")).toBeNull()
  })
})
