// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { collectPhase } from "./collect-phase"
import { QC_ASKED, type PhaseInput } from "./phase"
import { newConversation, type ConversationState } from "./state"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"
import { headings, planStep, questionTexts, texts, TURN_NOW } from "./test-utils/turn"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

const DOCS = "https://firstmove.energy/en/docs"
const input = (plan: PhaseInput["plan"], patch: Record<string, unknown> = {}, extra: Partial<PhaseInput> = {}): PhaseInput => ({
  plan,
  state: { ...plan.state, project: projectWith(patch, plan.state.project) },
  applied: Object.keys(patch),
  imported: false,
  docsUrl: DOCS,
  ...extra,
})
const menu = (): ConversationState => ({ ...newConversation("en", "t1", TURN_NOW), rounds: 1 })
const BOTH_DONE = { ...QUICK_CHECK_ANSWERS, "meta.modules.businessPlan": true }

describe("collectPhase: Quick Check", () => {
  it("asks the full list once, then only what the engine still misses", () => {
    const chose = planStep("1, yes", menu(), "choose_quick_check")
    const first = collectPhase(input(chose), t)
    expect(first).toMatchObject({ kind: "questions", results: false })
    expect(first.state.asked).toEqual([QC_ASKED, "qc:name", "qc:buildings", "qc:area", "qc:mix", "qc:sources", "qc:pv", "qc:demand", "qc:network"])
    expect(headings(first.sections)).toEqual(["Quick Check: your project data"])
    expect(questionTexts(first.sections)).toHaveLength(8)

    const answers = planStep("1. Sonnenhof\n2. 42\n3. 3.5 ha", first.state)
    const second = collectPhase(input(answers, { "meta.name": "Sonnenhof", "buildings.total": 42, "buildings.areaM2": 35_000 }), t)
    expect(headings(second.sections)).toEqual(["Quick Check: still needed"])
    expect(questionTexts(second.sections)).toEqual([t.mail.conversation.qc.mix.question, t.mail.conversation.qc.sources.question])
    expect(second.state.asked).toEqual([QC_ASKED, "qc:mix", "qc:sources"])
  })

  it("leaves out what a first email already answered", () => {
    const plan = planStep("We have 42 buildings.", null)
    const out = collectPhase(input(plan, { "buildings.total": 42 }), t)
    expect(questionTexts(out.sections)).toHaveLength(7)
    expect(questionTexts(out.sections)).not.toContain(t.mail.conversation.qc.buildings.question)
  })

  it("sends the result as soon as the engine runs and ends there for the Quick Check alone", () => {
    const plan = planStep("All values below", { ...menu(), phase: "collect", module: "quickCheck", asked: [QC_ASKED] })
    const out = collectPhase(input(plan, QUICK_CHECK_ANSWERS), t)
    expect(out).toMatchObject({ kind: "results", results: true, state: { phase: "results" } })
    expect(headings(out.sections)).toEqual(["Your Quick Check result", "How we calculate"])
  })

  it("answers a question or small talk with one line", () => {
    const state = { ...menu(), phase: "collect" as const, module: "quickCheck" as const, asked: [QC_ASKED] }
    const out = collectPhase(input(planStep("How is this calculated?", state, "question")), t)
    expect(out).toMatchObject({ kind: "reminder", sections: [{ blocks: [{ text: t.mail.conversation.reminder.collect }] }] })
  })
})

describe("collectPhase: Business Plan", () => {
  it("goes through the four steps: on with filled fields or “next”, the same step again when nothing was found, then the summary", () => {
    const qcDone = planStep("the rest", { ...menu(), phase: "collect", module: "both", asked: [QC_ASKED] })
    const one = collectPhase(input(qcDone, BOTH_DONE), t)
    expect(headings(one.sections)).toEqual(["Your Quick Check result", "How we calculate", "Business Plan, step 1 of 4: Define the opportunity"])
    expect(one).toMatchObject({ kind: "questions", results: false, state: { bpStep: 0, phase: "collect" } })

    const two = collectPhase(input(planStep("1. Sonnenhof", one.state), { "site.name": "Sonnenhof" }), t)
    expect(texts(two.sections)[0]).toBe(t.mail.conversation.bp.next)
    expect(two.state.bpStep).toBe(1)
    expect(two.state.asked).toEqual([QC_ASKED, "bp:business-logic"])
    expect(headings(two.sections).at(-1)).toBe("Business Plan, step 2 of 4: Build the business logic")

    const three = collectPhase(input(planStep("next", two.state, "other")), t)
    expect(three.state.bpStep).toBe(2)

    const again = collectPhase(input(planStep("I am not sure yet.", three.state)), t)
    expect(texts(again.sections)[0]).toBe(t.mail.conversation.bp.nothing)
    expect(again.state.bpStep).toBe(2)

    const four = collectPhase(input(planStep("Risk: low connection rate", again.state), { "businessPlan.assumptions.connectionRate": "60 % in year 3" }), t)
    expect(four.state.bpStep).toBe(3)

    const done = collectPhase(input(planStep("next", four.state, "other")), t)
    expect(done).toMatchObject({ kind: "results", results: true, state: { phase: "results", bpStep: 4 } })
    expect(headings(done.sections).at(-1)).toBe("Your Business Plan")
  })

  it("starts the Business Plan alone at step 1", () => {
    const out = collectPhase(input(planStep("2, no", menu(), "choose_business_plan")), t)
    expect(headings(out.sections)).toEqual(["Business Plan, step 1 of 4: Define the opportunity"])
    expect(out.state.bpStep).toBe(0)
  })
})
