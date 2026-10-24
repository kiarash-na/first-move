// @vitest-environment node
import { describe, expect, it } from "vitest"
import { sizeGate } from "./size"
import { testContext, testEmail } from "./test-utils/context"

describe("sizeGate", () => {
  it("drop oversized bodies and attachments, but not empty or unsupported files", () => {
    expect(sizeGate(testContext({ email: testEmail({ text: "x".repeat(50_001) }) }))).toEqual({ ok: false, reason: "too-large" })
    expect(sizeGate(testContext({ email: testEmail({ text: "y ".repeat(10_001) }) }))).toEqual({ ok: false, reason: "too-large" })
    const quoted = `New text\n\nOn Mon, 3 Nov 2026, Bot <a@b.c> wrote:\n${"> old\n".repeat(5_000)}`
    expect(sizeGate(testContext({ email: testEmail({ text: quoted }) }))).toEqual({ ok: true })
    const file = (size: number, name = "a.pdf") => ({ id: name, name, size, contentType: "application/pdf" })
    expect(sizeGate(testContext({ email: testEmail({ attachments: [file(11 * 1024 * 1024)] }) }))).toEqual({ ok: false, reason: "too-large" })
    expect(sizeGate(testContext({ email: testEmail({ attachments: Array.from({ length: 6 }, (_, index) => file(10, `${index}.pdf`)) }) }))).toEqual({ ok: false, reason: "too-large" })
    expect(sizeGate(testContext({ email: testEmail({ attachments: [file(0, "empty.txt"), file(10, "photo.png")] }) }))).toEqual({ ok: true })
  })
})
