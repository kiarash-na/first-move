// @vitest-environment node
import { Resend } from "resend"
import { describe, expect, it } from "vitest"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { OPERATOR } from "@/lib/legal/operator"
import { handleConfirm } from "../consent/confirm"
import { hasConsent, touchConsent } from "../consent/consent"
import { readMailAgentEnv } from "../env"
import { loopGate } from "../gates/loops"
import { GATES, RESUMED_GATES, runGates } from "../gates/run-gates"
import { decisionModel } from "../guard/model"
import { resendTransport, type MailTransport } from "../inbound/transport"
import { relayToPerson } from "../relay/relay"
import { createRedisStore } from "../store/redis"
import type { MailStore } from "../store/store"
import { anthropicTextModel } from "../text/anthropic"
import { act } from "./act"
import { askConsent } from "./ask-consent"
import { inboundFlow, type InboundSteps } from "./flow"
import { judgeEmail } from "./judge"
import { respond } from "./respond"
import { domainIds, loadSender, markDone } from "./sender"
import type { TriageResult } from "./triage"
import type { InboundInput, MailDeps } from "./types"

/**
 * The whole pipeline against the real services (O8), only when switched on:
 * `MAIL_AGENT_LIVE_PIPELINE=1 pnpm vitest run --silent=false lib/mail-agent/pipeline/pipeline.live.test.ts`
 * with the agent's variables set. It sends a handful of test emails between the project's own
 * addresses only (human@ → agent@, the agent's replies to human@, one hand-off to the admin
 * address), keeps every store key under a test prefix and deletes them at the end, and prints
 * codes only. The sender is our own human@, which the loop gate drops in production; this run
 * checks that, then runs every other gate.
 */
const env = readMailAgentEnv(process.env)
const live = process.env.MAIL_AGENT_LIVE_PIPELINE === "1" && env.status !== "incomplete"

/** Every key under a test prefix, remembered for the cleanup. */
function prefixed(store: MailStore, prefix: string) {
  const touched = new Set<string>()
  const key = (name: string) => {
    touched.add(`${prefix}${name}`)
    return `${prefix}${name}`
  }
  const wrapped: MailStore = {
    get: (name) => store.get(key(name)),
    set: (name, value, options) => store.set(key(name), value, options),
    getdel: (name) => store.getdel(key(name)),
    compareAndDelete: (name, expected) => store.compareAndDelete(key(name), expected),
    del: (name) => store.del(key(name)),
    incr: (name, ttlMs, by) => store.incr(key(name), ttlMs, by),
    expire: (name, ttlMs) => store.expire(key(name), ttlMs),
  }
  const cleanup = async () => {
    for (const name of touched) await store.del(name)
    return touched.size
  }
  return { store: wrapped, cleanup }
}

/** The transport, recording what the agent sends, so the run can read its own confirm link. */
function recording(transport: MailTransport) {
  const texts: string[] = []
  const files: number[] = []
  let forwarded = 0
  const wrapped: MailTransport = {
    ...transport,
    replyInThread: (reply) => (texts.push(reply.text), files.push(reply.attachments?.length ?? 0), transport.replyInThread(reply)),
    send: (email) => (texts.push(email.text), files.push(email.attachments?.length ?? 0), transport.send(email)),
    forward: (email) => ((forwarded += 1), transport.forward(email)),
  }
  return { transport: wrapped, texts, files, forwarded: () => forwarded }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe.skipIf(!live)("email agent end to end (live)", () => {
  it("consent, guard, extraction, the engine's result, hand-off and stop, on Resend, Upstash and the AI Gateway", async () => {
    if (env.status === "incomplete") return
    const config = env.config
    const run = `a07-${Date.now()}`
    const resend = new Resend(config.resend.apiKey)
    const kv = createRedisStore(config.store)
    const { store, cleanup } = prefixed(kv, `fm:test:${run}:`)
    const { transport, texts, files, forwarded } = recording(resendTransport(config.resend.apiKey))
    const deps: MailDeps = {
      config,
      store,
      transport,
      decisionModel: decisionModel(config),
      textModel: anthropicTextModel({ apiKey: config.gateway.apiKey, model: config.gateway.textModel }),
    }
    const report: Record<string, unknown> = { run }
    const humanInbox = (await resend.inboxes.get(OPERATOR.emailHuman)).data?.id ?? null

    async function triage(input: InboundInput, now: number): Promise<TriageResult> {
      const sender = await loadSender(deps, input)
      if (!sender) return { next: "stop", code: "no-address" }
      const context = { email: sender.email, sid: sender.sid, ...(await domainIds(deps, sender.email.from)), config, store, now }
      report.loopGateInProduction = (await loopGate(context)).ok ? "pass" : "drop"
      const gates = await runGates(context, (input.origin === "consent" ? RESUMED_GATES : GATES).filter((gate) => gate !== loopGate))
      if (!gates.ok) {
        await markDone(store, sender.email.id, gates.reason)
        return { next: "stop", code: gates.reason }
      }
      if (!(await hasConsent(store, sender.sid))) return { next: "consent" }
      await touchConsent(store, sender.sid)
      return { next: "guard" }
    }

    const steps: InboundSteps = {
      triage,
      askConsent: (input, now) => askConsent(deps, input, now),
      judge: (input, now) => judgeEmail(deps, input, now),
      act: (input, result, now) => act(deps, input, result, now),
      respond: (input, action, intent, now) => respond(deps, input, action, intent, now),
    }

    /** Sends one email from human@ to agent@ and waits until the agent's inbox has it. */
    async function send(subject: string, text: string): Promise<InboundInput> {
      const sent = await resend.emails.send({ from: `"First Move test" <${OPERATOR.emailHuman}>`, to: [config.addresses.agent], subject, text })
      if (sent.error) throw new Error(`send failed: ${sent.error.name}`)
      for (let attempt = 0; attempt < 45; attempt++) {
        await sleep(4_000)
        const threads = await resend.inboxes.threads.list({ inboxId: config.resend.agentInboxId, folders: ["inbox", "spam"] })
        const thread = threads.data?.data.find((entry) => entry.subject === subject)
        if (!thread) continue
        const emails = await resend.inboxes.threads.emails.list({ inboxId: config.resend.agentInboxId, threadId: thread.id })
        const inbound = emails.data?.data.filter((email) => email.direction === "inbound").at(-1)
        if (inbound) return { emailId: inbound.id, threadId: thread.id, inboxId: config.resend.agentInboxId, origin: "webhook" }
      }
      throw new Error("the test email did not arrive")
    }

    try {
      const subject = `First Move live test ${run}`
      const first = await send(
        subject,
        [
          "Hello,",
          "please run a Quick Check for our project and send me the project file.",
          "Project: Sonnenhof estate",
          "Buildings: 42",
          "Area: 3.5 ha",
          "Building mix: residential buildings 1961-1990: 60 %, residential buildings 2011-today: 30 %, category A 1991-2010: 10 %",
          "Energy sources: ground water high, ambient air medium",
          "Thank you",
        ].join("\n"),
      )
      const sender = await loadSender(deps, first)
      report.dmarc = sender?.email.authentication.dmarc
      report.first = await inboundFlow(steps, first, Date.now())

      const link = texts.join("\n").match(/#t=([^\s)]+)/)?.[1]
      const [terms, privacy] = await Promise.all([getDictionary("en", "terms"), getDictionary("en", "privacy")])
      const started: InboundInput[] = []
      const confirm = await handleConfirm(
        new Request(`${config.siteUrl}/api/mail/confirm`, { method: "POST", headers: { origin: new URL(config.siteUrl).origin }, body: JSON.stringify({ token: link }) }),
        { env, store: () => store, start: async (input) => void started.push(input), versions: { terms: terms.version, privacy: privacy.version }, now: Date.now() },
      )
      report.confirm = confirm.status
      report.resumed = await Promise.all(started.map((input) => inboundFlow(steps, input, Date.now())))
      const results = texts.at(-1) ?? ""
      report.resultHasLevel = /Overall result|Further analysis required|Promising|Not promising/.test(results)
      report.resultHasEquations = /EQ-\d/.test(results)
      report.resultHasFile = files.at(-1) === 1

      report.handoff = await inboundFlow(steps, await send(`${subject} (person)`, "Can I talk to a person, please?"), Date.now())
      report.forwarded = forwarded()
      report.stop = await inboundFlow(steps, await send(`${subject} (stop)`, "stop"), Date.now())
      report.replies = texts.length

      // human@ got the agent's replies; the relay leaves them there (they come from agent@).
      await sleep(10_000)
      const humanThreads = humanInbox ? await resend.inboxes.threads.list({ inboxId: humanInbox, folders: ["inbox", "spam"] }) : null
      const arrived = humanThreads?.data?.data.filter((thread) => thread.subject?.includes(run)) ?? []
      report.arrivedAtHuman = arrived.length
      if (humanInbox && arrived[0]) {
        const emails = await resend.inboxes.threads.emails.list({ inboxId: humanInbox, threadId: arrived[0].id })
        const fromAgent = emails.data?.data.find((email) => email.direction === "inbound" && email.from.includes(config.addresses.agent))
        if (fromAgent) report.relayOfAgentReply = await relayToPerson({ config, store, transport }, { emailId: fromAgent.id, threadId: arrived[0].id, inboxId: humanInbox }, Date.now())
      }
      report.relayOtherInbox = await relayToPerson({ config, store, transport }, { emailId: `${run}-other`, threadId: first.threadId, inboxId: config.resend.agentInboxId }, Date.now())
    } finally {
      report.keysDeleted = await cleanup()
      console.log(JSON.stringify(report))
    }
    expect(report).toMatchObject({ dmarc: "pass", loopGateInProduction: "drop", first: "consent-asked", confirm: 200, resumed: ["results"], resultHasFile: true, handoff: "handoff", forwarded: 1, stop: "stopped", relayOfAgentReply: "loop", relayOtherInbox: "other-inbox" })
  }, 600_000)
})
