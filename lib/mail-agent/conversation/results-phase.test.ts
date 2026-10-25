// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import { createProject } from "@/lib/project"
import type { PhaseInput } from "./phase"
import { resultsPhase } from "./results-phase"
import { newConversation, type ConversationState } from "./state"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"
import { headings, planStep, texts, TURN_NOW } from "./test-utils/turn"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

const results = (): ConversationState => ({
  ...newConversation("en", "t1", TURN_NOW),
  phase: "results",
  module: "both",
  bpStep: 4,
  rounds: 8,
  project: projectWith({ ...QUICK_CHECK_ANSWERS, "meta.modules.businessPlan": true, "site.name": "Sonnenhof" }),
})

function input(patch: Record<string, unknown>, extra: Partial<PhaseInput> = {}): PhaseInput {
  const plan = planStep("a correction", results())
  return { plan, state: { ...plan.state, project: projectWith(patch, plan.state.project) }, applied: Object.keys(patch), imported: false, docsUrl: "https://x/docs", ...extra }
}

describe("resultsPhase", () => {
  it("points to the last email when nothing changed", () => {
    expect(resultsPhase(input({}), t)).toMatchObject({ kind: "reminder", results: false, sections: [{ blocks: [{ text: t.mail.conversation.reminder.results }] }] })
  })

  it("computes again and sends only the part that changed, marked as updated", () => {
    const qc = resultsPhase(input({ "buildings.total": 60 }), t)
    expect(qc).toMatchObject({ kind: "results", results: true })
    expect(headings(qc.sections)).toEqual(["Your Quick Check result", "How we calculate"])
    expect(texts(qc.sections)).toContain(t.mail.conversation.results.updated)
    expect(headings(resultsPhase(input({ "site.location": "Graz" }), t).sections)).toEqual(["Your Business Plan"])
  })

  it("sends everything for a new project file, and asks again when the file lacks Quick Check inputs", () => {
    expect(headings(resultsPhase(input({}, { imported: true }), t).sections)).toEqual(["Your Quick Check result", "How we calculate", "Your Business Plan"])
    const empty = createProject({ modules: { quickCheck: true, businessPlan: true }, now: new Date(TURN_NOW) })
    const back = resultsPhase({ ...input({}), state: { ...results(), project: empty }, imported: true }, t)
    expect(back).toMatchObject({ kind: "questions", state: { phase: "collect" } })
    expect(headings(back.sections)).toEqual(["Quick Check: still needed"])
  })
})
