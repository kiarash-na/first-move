// @vitest-environment node
import { describe, expect, it } from "vitest"
import { saveErrorCode } from "./save-error"

describe("saveErrorCode", () => {
  it("maps storage errors", () => {
    expect(saveErrorCode(new DOMException("full", "QuotaExceededError"))).toBe("quota-exceeded")
    expect(saveErrorCode(new DOMException("closed", "InvalidStateError"))).toBe("unavailable")
    expect(saveErrorCode(new DOMException("late", "TransactionInactiveError"))).toBe("unavailable")
    expect(saveErrorCode(new DOMException("disk", "UnknownError"))).toBe("write-failed")
    expect(saveErrorCode("weird")).toBe("write-failed")
  })
})
