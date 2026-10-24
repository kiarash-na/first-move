import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { validationMessage } from "./validation-message"

describe("validationMessage", () => {
  it("fills the limits formatted in the UI language", () => {
    expect(validationMessage({ code: "max", params: { max: 1000000 } }, shell, "en")).toBe("Enter 1,000,000 or less.")
    expect(validationMessage({ code: "max", params: { max: 1000000 } }, shell, "de")).toBe("Enter 1.000.000 or less.")
  })

  it("joins list params and keeps strings", () => {
    expect(validationMessage({ code: "too-long", params: { max: "120" } }, shell, "en")).toBe("Use at most 120 characters.")
    expect(validationMessage({ code: "min", params: { min: [1, 2] } }, shell, "en")).toBe("Enter 1, 2 or more.")
  })

  it("has a text for codes without params", () => {
    expect(validationMessage({ code: "at-least-one-module" }, shell, "en")).toBe(shell.validation["at-least-one-module"])
  })
})
