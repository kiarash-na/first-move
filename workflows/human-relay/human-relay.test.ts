// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FatalError } from "workflow"
import type { AlertDeps } from "@/lib/mail-agent/admin/alert"
import { testConfig, testEmail } from "@/lib/mail-agent/gates/test-utils/context"
import { fakeTransport } from "@/lib/mail-agent/inbound/test-utils/fake-transport"
import { createMemoryStore } from "@/lib/mail-agent/store/memory-store"
import { humanRelay } from "./index"
import { relayStep } from "./steps"

const live = vi.hoisted(() => ({ deps: null as AlertDeps | null }))
vi.mock("@/lib/mail-agent/relay/deps", () => ({ relayDeps: () => live.deps }))

const ref = { emailId: "h1", threadId: "t1", inboxId: "inbox-human" }

// Without the Workflow compiler the directives do nothing, so the workflow runs its step in place.
describe("human@ relay workflow", () => {
  let fake: ReturnType<typeof fakeTransport>

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {})
    fake = fakeTransport({ h1: testEmail({ id: "h1", to: ["human@mail.firstmove.energy"] }) })
    live.deps = { config: testConfig(), store: createMemoryStore(), transport: fake.transport }
  })

  it("relays on the live clients", async () => {
    expect(await humanRelay(ref)).toBe("relayed")
    expect(fake.forwarded.map((email) => email.idempotencyKey)).toEqual(["relay/h1"])
  })

  it("ends the run when the configuration is incomplete or Resend refuses for good", async () => {
    live.deps = null
    await expect(relayStep(ref, 0)).rejects.toBeInstanceOf(FatalError)
    live.deps = { config: testConfig(), store: createMemoryStore(), transport: fake.transport }
    fake.failNext("inboxAddress", "validation_error")
    await expect(relayStep(ref, 0)).rejects.toBeInstanceOf(FatalError)
    fake.failNext("inboxAddress", "rate_limit_exceeded")
    await expect(relayStep(ref, 0)).rejects.toMatchObject({ name: "TransportError", retryable: true })
  })
})
