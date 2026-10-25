import { recordConsent } from "../../consent/consent"
import { testConfig, testEmail } from "../../gates/test-utils/context"
import type { GuardDecision } from "../../guard/decide"
import { mockJev } from "../../guard/test-utils/jev"
import { fakeTransport } from "../../inbound/test-utils/fake-transport"
import type { InboundEmail } from "../../inbound/transport"
import { createMemoryStore } from "../../store/memory-store"
import { senderId } from "../../store/sender-id"
import type { StructuredRequest } from "../../text/model"
import { fakeTextModel, type FakeAnswer } from "../../text/test-utils/fake-model"
import { act } from "../act"
import { askConsent } from "../ask-consent"
import { inboundFlow, type InboundSteps } from "../flow"
import { judgeEmail } from "../judge"
import { respond } from "../respond"
import { triage } from "../triage"
import type { InboundInput, MailDeps } from "../types"

/** Whether a text-model request is the value extraction (else it is a docs answer). */
export const isExtraction = (request: StructuredRequest<unknown>) => request.system.includes("Email rules:")

/** The text model's default: finds no values and has no answer from the docs. */
export const SILENT_TEXT = (request: StructuredRequest<unknown>): FakeAnswer => (isExtraction(request) ? { values: [], unclear: [] } : { covered: false, answer: "", page: null })

export interface HarnessOptions {
  jev?: Partial<GuardDecision> | "refuse" | "fail"
  config?: Record<string, string>
  /** The text model's answer per request; finds nothing by default. */
  text?: (request: StructuredRequest<unknown>) => FakeAnswer
}

/**
 * The pipeline with fakes, run the way the workflow runs it: the memory store, a fake Resend, a
 * mock Jev, a fake text model, and a record of every step's input and output (to prove they carry
 * no content). `decide` changes what Jev answers for the next emails.
 */
export function pipelineHarness({ jev = {}, config = {}, text = SILENT_TEXT }: HarnessOptions = {}) {
  const clock = { now: Date.UTC(2026, 9, 24, 12) }
  const store = createMemoryStore({ now: () => clock.now })
  const fake = fakeTransport()
  const judgment = typeof jev === "string" ? jev : { ...jev }
  const decision = mockJev(judgment)
  const answer = { current: text }
  const textModel = fakeTextModel((request) => answer.current(request))
  const deps: MailDeps = { config: testConfig(config), store, transport: fake.transport, decisionModel: decision.model, textModel: textModel.model }
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
    respond: record((input: InboundInput, action, intent, now: number) => respond(deps, input, action, intent, now)),
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

  /** What Jev answers from now on (on top of the safe defaults). */
  function decide(next: Partial<GuardDecision>) {
    if (typeof judgment === "string") throw new Error("The harness was set up with a failing Jev")
    Object.assign(judgment, next)
  }

  /** What the text model answers from now on. */
  function respondWith(next: (request: StructuredRequest<unknown>) => FakeAnswer) {
    answer.current = next
  }

  return { clock, store, fake, jev: decision, text: textModel, deps, steps, payloads, receive, consent, decide, respondWith }
}
