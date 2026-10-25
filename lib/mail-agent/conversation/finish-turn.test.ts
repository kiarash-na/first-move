// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest"
import type { Proposal } from "@/lib/ai/extract/propose"
import { parseImportText } from "@/lib/storage/import"
import { applyProposal } from "./apply"
import { finishTurn, type TurnOutcome } from "./finish-turn"
import { QC_ASKED } from "./phase"
import { MAX_ROUNDS, newConversation, type ConversationState } from "./state"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"
import { headings, planStep, texts, TURN_NOW } from "./test-utils/turn"
import { loadTexts, type MailTexts } from "./texts"

let t: MailTexts
beforeAll(async () => {
  t = await loadTexts("en")
})

const LINKS = { docsUrl: "https://firstmove.energy/en/docs", dashboardUrl: "https://firstmove.energy/en/dashboard" }
const NOTHING: TurnOutcome = { answer: null, files: [], extraction: null, imported: false }
const collecting = (extra: Partial<ConversationState> = {}): ConversationState => ({ ...newConversation("en", "t1", TURN_NOW), phase: "collect", module: "quickCheck", asked: [QC_ASKED], rounds: 3, ...extra })

function proposalOf(patch: Record<string, unknown>): Proposal {
  const valid = Object.entries(patch).map(([key, value]) => ({ key, value, label: key, sources: [{ quote: String(value) }] }))
  return { patch, valid, invalid: [], incomplete: [], conflicts: [], unclear: [], notes: [] }
}

describe("finishTurn", () => {
  it("opens a new conversation with the answer and the menu", () => {
    const plan = planStep("What is 5GDHC?", null, "question")
    const out = finishTurn(plan, plan.state, { ...NOTHING, answer: { text: "A low-temperature network.", page: null } }, t, LINKS, TURN_NOW)
    expect(headings(out.sections)).toEqual(["Your question", "What would you like to do?"])
    expect(out).toMatchObject({ kind: "menu", attachment: null })
  })

  it("puts the files, then what it understood, before the next questions", () => {
    const plan = planStep("see attached", collecting(), "documents", 1)
    const proposal = proposalOf({ "buildings.total": 42 })
    const applied = applyProposal(plan.state.project, proposal, { model: "m", now: new Date(TURN_NOW) })
    const outcome: TurnOutcome = { ...NOTHING, files: [{ name: "stock.pdf", status: "read" }], extraction: { applied, proposal, notes: [] } }
    const out = finishTurn(plan, { ...plan.state, project: applied.project }, outcome, t, LINKS, TURN_NOW)
    expect(headings(out.sections)).toEqual(["Your attachments", "What I understood", "Quick Check: still needed"])
  })

  it("sends the results with the project file when the sender wanted it, and offers it otherwise", () => {
    const plan = planStep("All values", collecting({ wantsFile: true }))
    const proposal = proposalOf(QUICK_CHECK_ANSWERS)
    const applied = applyProposal(plan.state.project, proposal, { model: "m", now: new Date(TURN_NOW) })
    const out = finishTurn(plan, { ...plan.state, project: applied.project }, { ...NOTHING, extraction: { applied, proposal, notes: [] } }, t, LINKS, TURN_NOW)
    expect(out.kind).toBe("results")
    expect(out.attachment?.filename).toMatch(/\.firstmove\.json$/)
    const file = parseImportText(Buffer.from(out.attachment!.content, "base64").toString("utf8"))
    expect(file.ok && file.project.buildings.total).toBe(42)
    expect(texts(out.sections)).toContain(t.mail.conversation.file.provenance)

    const declined = finishTurn({ ...plan, state: { ...plan.state, wantsFile: false } }, { ...plan.state, wantsFile: false, project: applied.project }, { ...NOTHING, extraction: { applied, proposal, notes: [] } }, t, LINKS, TURN_NOW)
    expect(declined.attachment).toBeNull()
    expect(texts(declined.sections).at(-1)).toBe(t.mail.conversation.file.offer)
  })

  it("sends the file on “file” in any phase", () => {
    const plan = planStep("file", collecting(), "wants_file")
    const out = finishTurn(plan, plan.state, NOTHING, t, LINKS, TURN_NOW)
    expect(out.attachment).not.toBeNull()
    expect(headings(out.sections)).toEqual([t.mail.conversation.kicker.progress, t.mail.conversation.kicker.progress])
  })

  it("says it starts over, and points to the dashboard after the limit", () => {
    const restarted = planStep("new", collecting(), "other")
    expect(headings(finishTurn(restarted, restarted.state, NOTHING, t, LINKS, TURN_NOW).sections)).toEqual([t.mail.conversation.kicker.menu, "What would you like to do?"])
    const limit = planStep("file", collecting({ rounds: MAX_ROUNDS }), "wants_file")
    const out = finishTurn(limit, limit.state, NOTHING, t, LINKS, TURN_NOW)
    expect(out).toMatchObject({ kind: "limit" })
    expect(headings(out.sections)[0]).toBe(t.mail.conversation.limit.title)
    expect(out.attachment).not.toBeNull()
  })

  it("repeats the menu only when a reply chose nothing", () => {
    const menu = { ...newConversation("en", "t1", TURN_NOW), rounds: 1 }
    const again = planStep("hmm", menu, "other")
    expect(texts(finishTurn(again, again.state, NOTHING, t, LINKS, TURN_NOW).sections)[0]).toBe(t.mail.conversation.menu.again)
    const question = planStep("Is this free?", menu, "question")
    const out = finishTurn(question, question.state, { ...NOTHING, answer: { text: null, page: null } }, t, LINKS, TURN_NOW)
    expect(out.kind).toBe("reminder")
  })

  it("keeps the result for a project that already ran", () => {
    const state = collecting({ phase: "results", project: projectWith(QUICK_CHECK_ANSWERS) })
    const plan = planStep("Thanks!", state, "other")
    expect(finishTurn(plan, plan.state, NOTHING, t, LINKS, TURN_NOW)).toMatchObject({ kind: "reminder", attachment: null })
  })
})
