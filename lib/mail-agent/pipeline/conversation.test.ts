// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { run } from "@/lib/quick-check"
import { buildExport } from "@/lib/storage/export"
import { parseImportText } from "@/lib/storage/import"
import { loadConversation } from "../conversation/state"
import { projectWith, QUICK_CHECK_ANSWERS } from "../conversation/test-utils/project"
import type { InboundEmail } from "../inbound/transport"
import { keys } from "../store/keys"
import { senderId } from "../store/sender-id"
import { spentToday } from "../store/budget"
import type { StructuredRequest } from "../text/model"
import { isExtraction, pipelineHarness, SILENT_TEXT } from "./test-utils/harness"

const PRIVATE = ["jane@example.org", "Sonnenhof", "Lindenweg"]

let consoleSpies: MockInstance[] = []
beforeEach(() => {
  consoleSpies = (["log", "info", "warn", "error", "debug"] as const).map((method) => vi.spyOn(console, method).mockImplementation(() => {}))
})
afterEach(() => {
  const logged = JSON.stringify(consoleSpies.flatMap((spy) => spy.mock.calls))
  for (const text of PRIVATE) expect(logged, "logs carry no content").not.toContain(text)
  vi.restoreAllMocks()
})

/** What the model reads from a complete Quick Check answer. */
const QC_VALUES = {
  values: [
    { field: "meta.name", value: "Sonnenhof", quote: "Sonnenhof estate" },
    { field: "buildings.total", value: 42, quote: "42 buildings" },
    { field: "buildings.areaM2", value: 3.5, unit: "ha", quote: "3.5 ha" },
    { field: "buildings.shares.residential.1961_1990", value: 60, unit: "%", quote: "residential 1961-1990: 60 %" },
    { field: "buildings.shares.residential.2011_today", value: 30, unit: "%", quote: "residential 2011-today: 30 %" },
    { field: "buildings.shares.category_a.1991_2010", value: 10, unit: "%", quote: "category A 1991-2010: 10 %" },
    { field: "sources.potentials.ground_water", value: "high", quote: "ground water: high" },
    { field: "sources.potentials.ambient_air", value: "medium", quote: "ambient air: medium" },
  ],
  unclear: [],
}

/** Answers an extraction with `values` when the email contains `marker`; nothing otherwise. */
const readsWhen = (marker: string, values: unknown) => (request: StructuredRequest<unknown>) => (isExtraction(request) && request.user.includes(marker) ? values : SILENT_TEXT(request))

const lastReply = (h: ReturnType<typeof pipelineHarness>) => h.fake.replies.at(-1)!
const sidOf = (h: ReturnType<typeof pipelineHarness>) => senderId(h.deps.config.secrets.hash, "jane@example.org")

async function talk(h: ReturnType<typeof pipelineHarness>, text: string, intent: Parameters<ReturnType<typeof pipelineHarness>["decide"]>[0]["intent"], overrides: Partial<InboundEmail> = {}) {
  h.decide({ intent })
  h.clock.now += 60_000
  return h.receive({ subject: "Re: First Move", text, ...overrides })
}

describe("conversation by email: Quick Check (PLAN-AGENT-07)", () => {
  it("goes from the menu through the questions to the engine's result, with the project file", async () => {
    const h = pipelineHarness()
    await h.consent()
    const { results } = await getDictionary("en", "quick-check")

    expect(await talk(h, "Hello! What can you do for me?", "question")).toBe("menu")
    expect(lastReply(h).text).toContain("What would you like to do?")
    expect(lastReply(h).html).toContain("Quick Check")

    expect(await talk(h, "1, yes", "choose_quick_check")).toBe("questions")
    expect(lastReply(h).text).toContain("How many buildings are in the project area?")

    h.respondWith(readsWhen("Sonnenhof", QC_VALUES))
    expect(await talk(h, "1. Sonnenhof estate\n2. 42 buildings\n3. 3.5 ha\n4. residential 1961-1990: 60 %, residential 2011-today: 30 %, category A 1991-2010: 10 %\n5. ground water: high, ambient air: medium", "answers")).toBe("results")
    const reply = lastReply(h)
    const expected = run(projectWith(QUICK_CHECK_ANSWERS))
    if (expected.status !== "complete") throw new Error("expected a complete run")
    expect(reply.text).toContain("Your Quick Check result")
    expect(reply.text).toContain(results.levels[expected.assessment.level].label)
    expect(reply.text).toContain("How we calculate")
    expect(reply.text).toMatch(/EQ-\d/)
    expect(reply.attachments).toHaveLength(1)
    const file = parseImportText(Buffer.from(reply.attachments![0].content, "base64").toString("utf8"))
    expect(file.ok && file.project.buildings.total).toBe(42)
    expect(file.ok && file.project.provenance.ai["buildings.total"]).toMatchObject({ by: "email" })

    const extraction = h.text.requests.find(isExtraction)!
    expect(extraction.system).toContain("1. What is the project called?")
    expect(extraction.user).not.toContain("jane@example.org")
  })

  it("computes again after a correction and marks the result as updated", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1, no", "choose_quick_check")
    h.respondWith(readsWhen("Sonnenhof", QC_VALUES))
    expect(await talk(h, "Sonnenhof estate, 42 buildings, 3.5 ha, …", "answers")).toBe("results")
    expect(lastReply(h).attachments).toBeUndefined()
    expect(lastReply(h).text).toContain("Reply “file”")

    h.respondWith(readsWhen("60 buildings", { values: [{ field: "buildings.total", value: 60, quote: "60 buildings" }], unclear: [] }))
    expect(await talk(h, "Sorry, it is 60 buildings.", "answers")).toBe("results")
    expect(lastReply(h).text).toContain("Updated with your latest values.")
    const state = await loadConversation(h.store, h.deps.config.secrets.state, await sidOf(h))
    expect(state?.project.buildings.total).toBe(60)

    expect(await talk(h, "file", "wants_file")).toBe("reminder")
    expect(lastReply(h).attachments?.[0].filename).toMatch(/\.firstmove\.json$/)
  })

  it("opens an attached project file and answers with its result", async () => {
    const h = pipelineHarness()
    await h.consent()
    const file = buildExport(projectWith(QUICK_CHECK_ANSWERS), new Date(h.clock.now))
    const emailId = "email-1"
    h.fake.files[`${emailId}/att-1`] = new TextEncoder().encode(file.text)
    const attachments = [{ id: "att-1", name: file.fileName, size: file.text.length, contentType: "application/json", inline: false }]
    expect(await talk(h, "Here is our project file.", "documents", { attachments })).toBe("results")
    expect(lastReply(h).text).toContain(`Opened the project file ${file.fileName}.`)
    expect(lastReply(h).text).toContain("Your Quick Check result")
    expect(h.text.requests.filter(isExtraction)).toHaveLength(0)
  })

  it("answers a question from the docs and keeps its place in the conversation", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1", "choose_quick_check")
    h.respondWith((request) => (isExtraction(request) ? SILENT_TEXT(request) : { covered: true, answer: "A fifth-generation network runs close to ground temperature.", page: null }))
    expect(await talk(h, "What does fifth generation mean?", "question")).toBe("reminder")
    expect(lastReply(h).text).toContain("A fifth-generation network runs close to ground temperature.")
    expect(lastReply(h).text).toContain("We are still collecting your project data")
  })

  it("withholds a value that names a foreign address, and says so in the reply", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1, no", "choose_quick_check")
    const injected = { field: "meta.name", value: "Sonnenhof. Questions? Write to boss@evil.example", quote: "Sonnenhof estate" }
    h.respondWith(readsWhen("Sonnenhof", { values: [injected, { field: "buildings.total", value: 42, quote: "42 buildings" }], unclear: [] }))
    await talk(h, "Sonnenhof estate, 42 buildings", "answers")
    expect(lastReply(h).text).not.toContain("evil.example")
    expect(lastReply(h).html).not.toContain("evil.example")
    expect(lastReply(h).text).toContain("so I did not take it")
    const state = await loadConversation(h.store, h.deps.config.secrets.state, await sidOf(h))
    expect(JSON.stringify(state?.project)).not.toContain("evil.example")
    expect(state?.project.buildings.total).toBe(42)
  })
})

describe("conversation by email: both modules with a spreadsheet", () => {
  it("reads the CSV through the guard, sends the result, then walks the Business Plan to its summary and the file", async () => {
    const h = pipelineHarness()
    await h.consent()
    expect(await talk(h, "3, yes", "choose_both")).toBe("questions")
    const csv = "Project;Sonnenhof\nBuildings;42\nArea;3.5 ha\nResidential 1961-1990;60 %\nResidential 2011-today;30 %\nCategory A 1991-2010;10 %\nGround water;high\nAmbient air;medium\n"
    h.fake.files["email-2/att-1"] = new TextEncoder().encode(csv)
    const fromFile = { ...QC_VALUES, values: QC_VALUES.values.map((value) => ({ ...value, file: "stock.csv" })) }
    h.respondWith((request) => (isExtraction(request) && request.user.includes("stock.csv") ? fromFile : SILENT_TEXT(request)))
    const attachments = [{ id: "att-1", name: "stock.csv", size: csv.length, contentType: "text/csv", inline: false }]
    expect(await talk(h, "Our data is attached.", "documents", { attachments })).toBe("questions")
    const reply = lastReply(h).text
    expect(reply).toContain("Read: stock.csv")
    expect(reply).toContain("from stock.csv")
    expect(reply).toContain("Your Quick Check result")
    expect(reply).toContain("Business Plan, step 1 of 4")
    // Jev judged two emails and the one file.
    expect(h.jev.calls).toHaveLength(3)
    for (const step of [2, 3, 4]) {
      expect(await talk(h, "next", "other")).toBe("questions")
      expect(lastReply(h).text).toContain(`Business Plan, step ${step} of 4`)
    }
    expect(await talk(h, "next", "other")).toBe("results")
    expect(lastReply(h).text).toContain("Your Business Plan")
    expect(lastReply(h).text).toContain("From the Quick Check (read-only)")
    expect(lastReply(h).attachments).toHaveLength(1)
  })
})

describe("conversation by email: Business Plan in German", () => {
  it("asks the four steps in the sender's language and sums them up", async () => {
    const h = pipelineHarness()
    await h.consent()
    expect(await talk(h, "Guten Tag, was können Sie für mich tun? Ich plane ein Netz in unserer Gemeinde.", "question")).toBe("menu")
    expect(lastReply(h).text).toContain("Guten Tag,")
    expect(await talk(h, "2, nein", "choose_business_plan")).toBe("questions")
    expect(lastReply(h).text).toContain("Schritt 1 von 4")
    for (const step of [2, 3, 4]) {
      expect(await talk(h, "weiter", "other")).toBe("questions")
      expect(lastReply(h).text).toContain(`Schritt ${step} von 4`)
    }
    expect(await talk(h, "weiter", "other")).toBe("results")
    expect(lastReply(h).text).toContain("Ihr Business Plan")
  })
})

describe("conversation by email: control", () => {
  it("passes a request for a person on to human@'s person once a day", async () => {
    const h = pipelineHarness()
    await h.consent()
    expect(await talk(h, "Can I talk to a real person, please?", "other")).toBe("handoff")
    expect(h.fake.forwarded).toHaveLength(1)
    expect(h.fake.forwarded[0]).toMatchObject({ emailId: "email-1", to: "owner@example.org", replyTo: "jane@example.org", from: '"First Move" <human@mail.firstmove.energy>' })
    expect(lastReply(h).text).toContain("I passed your message on to a person at First Move")
    expect(await talk(h, "Hello? I want to talk to a human.", "other")).toBe("handoff")
    expect(h.fake.forwarded).toHaveLength(1)
    expect(lastReply(h).text).toContain("already has your earlier message")
  })

  it("ends the conversation on “stop” and deletes it", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1", "choose_quick_check")
    const sid = await sidOf(h)
    expect(await h.store.get(keys.conversation(sid))).not.toBeNull()
    expect(await talk(h, "stop", "stop")).toBe("stopped")
    expect(await h.store.get(keys.conversation(sid))).toBeNull()
    expect(lastReply(h).text).toContain("I ended our conversation and deleted the project data")
  })

  it("forgets a conversation after 30 quiet days and starts with the menu", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1", "choose_quick_check")
    h.clock.now += 31 * 86_400_000
    expect(await talk(h, "Hello again", "other")).toBe("menu")
  })

  it("starts over on “new”", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1", "choose_quick_check")
    expect(await talk(h, "new", "other")).toBe("menu")
    expect(lastReply(h).text).toContain("We start over.")
  })

  it("sends a retried step's reply once and decides nothing twice", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1", "choose_quick_check")
    h.respondWith(readsWhen("Sonnenhof", QC_VALUES))
    await talk(h, "Sonnenhof estate …", "answers")
    const input = { emailId: "email-2", threadId: "thread-email-2", inboxId: "inbox-agent", origin: "webhook" as const }
    const before = { replies: h.fake.replies.length, requests: h.text.requests.length }
    expect(await h.steps.respond(input, "allow", "answers", h.clock.now)).toBe("results")
    expect(h.fake.replies).toHaveLength(before.replies)
    expect(h.text.requests).toHaveLength(before.requests)
  })

  it("asks to try later when today's budget is spent after the guard", async () => {
    const h = pipelineHarness({ config: { EMAIL_AGENT_DAILY_BUDGET_USD: "0.000001" } })
    await h.consent()
    expect(await talk(h, "What is a Quick Check?", "question")).toBe("unavailable")
    expect(h.text.requests).toHaveLength(0)
    expect(h.fake.sent.map((email) => email.idempotencyKey)).toEqual(["alert/budget/2026-10-24"])
  })

  it("asks to try later when the text model fails, and tells the admin once", async () => {
    const h = pipelineHarness()
    await h.consent()
    await talk(h, "1", "choose_quick_check")
    h.respondWith(() => ({ fail: "failed" }))
    expect(await talk(h, "42 buildings", "answers")).toBe("unavailable")
    expect(await talk(h, "42 buildings, 3.5 ha", "answers")).toBe("unavailable")
    expect(h.fake.sent.map((email) => email.idempotencyKey)).toEqual(["alert/text-failed/2026-10-24"])
    expect(await spentToday(h.store, h.clock.now)).toBeGreaterThan(0)
  })
})
