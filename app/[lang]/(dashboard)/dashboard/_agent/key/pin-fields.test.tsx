import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import type { PinProblem } from "@/lib/assistant/vault/pin"
import { assistantCopy } from "../test-utils/render"
import { PinFields, pinDigits } from "./pin-fields"

const copy = assistantCopy().setup.pin

function Harness({ problem = null }: { problem?: PinProblem | null }) {
  const [pin, setPin] = useState("")
  const [repeat, setRepeat] = useState("")
  return <PinFields copy={copy} pin={pin} repeat={repeat} onPin={setPin} onRepeat={setRepeat} problem={problem} />
}

describe("pinDigits", () => {
  it("keeps at most six digits", () => {
    expect(pinDigits("12a3 4-5678")).toBe("123456")
    expect(pinDigits("")).toBe("")
  })
})

describe("PinFields", () => {
  it("takes digits only, six at most, in two masked numeric fields", async () => {
    render(<Harness />)
    const pin = screen.getByLabelText(copy.label)
    const repeat = screen.getByLabelText(copy.repeat)
    for (const field of [pin, repeat]) {
      expect(field).toHaveAttribute("type", "password")
      expect(field).toHaveAttribute("inputmode", "numeric")
      expect(field).toHaveAttribute("autocomplete", "off")
    }
    await userEvent.type(pin, "4a8b2-9150")
    expect(pin).toHaveValue("482915")
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it.each(["format", "common", "mismatch"] as const)("explains the %s problem", (problem) => {
    render(<Harness problem={problem} />)
    expect(screen.getByRole("alert")).toHaveTextContent(copy[problem])
    const invalid = problem === "mismatch" ? copy.repeat : copy.label
    expect(screen.getByLabelText(invalid)).toHaveAttribute("aria-invalid", "true")
  })
})
