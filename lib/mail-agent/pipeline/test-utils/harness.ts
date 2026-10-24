import { recordConsent } from "../../consent/consent"
import { testConfig, testEmail } from "../../gates/test-utils/context"
import type { GuardDecision } from "../../guard/decide"
import { mockJev } from "../../guard/test-utils/jev"
import { fakeTransport } from "../../inbound/test-utils/fake-transport"
import type { InboundEmail } from "../../inbound/transport"
import { createMemoryStore } from "../../store/memory-store"
import { senderId } from "../../store/sender-id"
import { act } from "../act"
import { askConsent } from "../ask-consent"
import { inboundFlow, type InboundSteps } from "../flow"
import { judgeEmail } from "../judge"
import { respond } from "../respond"
import { triage } from "../triage"
import type { InboundInput, MailDeps } from "../types"

/**
 * The pipeline with fakes, run the way the workflow runs it: the memory store, a fake Resend, a
 * mock Jev, and a record of every step's input and output (to prove they carry no content).
 */
export function pipelineHarness({ jev = {}, config = {} }: { jev?: Partial<GuardDecision> | "refuse" | "fail"; config?: Record<string, string> } = {}) {
  const clock = { now: Date.UTC(2026, 9, 24, 12) }
  const store = createMemoryStore({ now: () => clock.now })
  const fake = fakeTransport()
  const decision = mockJev(jev)
  const deps: MailDeps = { config: testConfig(config), store, transport: fake.transport, decisionModel: decision.model }
  const payloads: unknown[] = []

  const record =
    <A extends unknown[], R>(step: (...args: A) => Promise<R>) =>
    async (...args: A): Promise<R> => {
      payloads.push(args)
      const result = await step(...args)
      payloads.push(result)
      return result
    }

  const steps: InboundSteps = {
    triage: record((input: InboundInput, now: number) => triage(deps, input, now)),
    askConsent: record((input: InboundInput, now: number) => askConsent(deps, input, now)),
    judge: record((input: InboundInput, now: number) => judgeEmail(deps, input, now)),
    act: record((input: InboundInput, result, now: number) => act(deps, input, result, now)),
    respond: record((input: InboundInput, action) => respond(deps, input, action)),
  }

  /** Receives an email (the defaults pass every gate) and runs it; returns the final code. */
  function receive(overrides: Partial<InboundEmail> = {}, origin: InboundInput["origin"] = "webhook") {
    const email = testEmail({ id: `email-${Object.keys(fake.emails).length + 1}`, ...overrides })
    fake.emails[email.id] = email
    return inboundFlow(steps, { emailId: email.id, threadId: `thread-${email.id}`, inboxId: "inbox-agent", origin }, clock.now)
  }

  /** Records consent for an address, as the confirm link does. */
  async function consent(address = "jane@example.org") {
    await recordConsent(store, await senderId(deps.config.secrets.hash, address), { at: new Date(clock.now).toISOString(), terms: "1.1", privacy: "1.1" })
  }

  return { clock, store, fake, jev: decision, deps, steps, payloads, receive, consent }
}
