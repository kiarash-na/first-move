// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FatalError, RetryableError } from "workflow"
import { testEmail } from "@/lib/mail-agent/gates/test-utils/context"
import { pipelineHarness } from "@/lib/mail-agent/pipeline/test-utils/harness"
import type { MailDeps } from "@/lib/mail-agent/pipeline/types"
import { keys } from "@/lib/mail-agent/store/keys"
import { senderId } from "@/lib/mail-agent/store/sender-id"
import { inboundEmail } from "./index"
import { askConsentStep, triageStep } from "./steps"

const live = vi.hoisted(() => ({ deps: null as MailDeps | null }))
vi.mock("@/lib/mail-agent/pipeline/deps", () => ({ liveDeps: () => live.deps }))

const input = { emailId: "email-1", threadId: "thread-email-1", inboxId: "inbox-agent", origin: "webhook" as const }

// Without the Workflow compiler the directives do nothing, so the workflow runs its steps in place.
describe("inbound email workflow", () => {
  let h: ReturnType<typeof pipelineHarness>

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {})
    h = pipelineHarness()
    live.deps = h.deps
  })

  it("runs the steps on the live clients", async () => {
    h.fake.emails["email-1"] = testEmail({ id: "email-1" })
    expect(await inboundEmail(input)).toBe("consent-asked")
    expect(h.fake.replies.map((reply) => reply.idempotencyKey)).toEqual(["reply/email-1/confirm"])
  })

  it("ends the run when the agent is not configured", async () => {
    live.deps = null
    await expect(triageStep(input, 0)).rejects.toBeInstanceOf(FatalError)
  })

  it("retries a busy sender later", async () => {
    h.fake.emails["email-1"] = testEmail({ id: "email-1" })
    await h.store.set(keys.lock(await senderId(h.deps.config.secrets.hash, "jane@example.org")), "other-run", { ttlMs: 60_000 })
    await expect(askConsentStep(input, 0)).rejects.toBeInstanceOf(RetryableError)
  })

  it("gives up on a Resend error that cannot pass later, and retries the others", async () => {
    h.fake.failNext("getEmail", "validation_error")
    await expect(triageStep(input, 0)).rejects.toBeInstanceOf(FatalError)
    h.fake.failNext("getEmail", "rate_limit_exceeded")
    await expect(triageStep(input, 0)).rejects.toMatchObject({ name: "TransportError", retryable: true })
  })
})
