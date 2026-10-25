import { describe, expect, it } from "vitest"

import { formatUsd } from "./usd"

describe("formatUsd", () => {
  it("formats dollars in the page language", () => {
    expect(formatUsd(0.042, "en")).toBe("$0.042")
    expect(formatUsd(0.042, "de")).toBe("0,042 $")
    expect(formatUsd(4.2, "en", { min: 2, max: 2 })).toBe("$4.20")
    expect(formatUsd(2, "en")).toBe("$2")
  })
})
