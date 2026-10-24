// @vitest-environment node
import { describe, expect, it } from "vitest"
import { readBody } from "./read-body"

function streamed(parts: string[], headers: Record<string, string> = {}) {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part))
      controller.close()
    },
  })
  return new Request("https://firstmove.energy/api/mail/inbound", { method: "POST", body, headers, duplex: "half" } as RequestInit)
}

describe("readBody", () => {
  it("returns the body as text", async () => {
    expect(await readBody(new Request("https://x.test", { method: "POST", body: "héllo" }), 100)).toBe("héllo")
  })

  it("returns an empty string for a request without a body", async () => {
    expect(await readBody(new Request("https://x.test", { method: "POST" }), 100)).toBe("")
  })

  it("refuses a declared length above the cap without reading", async () => {
    expect(await readBody(streamed(["small"], { "content-length": "101" }), 100)).toBeNull()
    expect(await readBody(streamed(["small"], { "content-length": "lots" }), 100)).toBeNull()
  })

  it("cuts off a stream that passes the cap, whatever it declared", async () => {
    expect(await readBody(streamed(["a".repeat(60), "b".repeat(60)]), 100)).toBeNull()
    expect(await readBody(streamed(["a".repeat(60), "b".repeat(60)], { "content-length": "10" }), 100)).toBeNull()
    expect(await readBody(streamed(["a".repeat(50), "b".repeat(50)]), 100)).toBe("a".repeat(50) + "b".repeat(50))
  })

  it("keeps a character split across chunks", async () => {
    const bytes = new TextEncoder().encode("ä")
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, 1))
        controller.enqueue(bytes.slice(1))
        controller.close()
      },
    })
    const request = new Request("https://x.test", { method: "POST", body, duplex: "half" } as RequestInit)
    expect(await readBody(request, 100)).toBe("ä")
  })
})
