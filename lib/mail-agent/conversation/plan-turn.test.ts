// @vitest-environment node
import { describe, expect, it } from "vitest"
import { parseReply } from "./commands"
import { planTurn, type TurnInput } from "./plan-turn"
import { MAX_ROUNDS, newConversation, type ConversationState } from "./state"
import { projectWith, QUICK_CHECK_ANSWERS } from "./test-utils/project"

const NOW = Date.UTC(2026, 9, 25, 10)

function turn(text: string, overrides: Partial<TurnInput> = {}): TurnInput {
  return { state: null, locale: "en", threadId: "t1", parsed: parseReply(text), intent: "other", action: "allow", attachments: 0, now: NOW, ...overrides }
}

const inPhase = (phase: ConversationState["phase"], extra: Partial<ConversationState> = {}): ConversationState => ({ ...newConversation("en", "t1", NOW), phase, ...extra })

describe("planTurn", () => {
  it("starts with the menu and answers a first question", () => {
    const plan = planTurn(turn("Hello, what is 5GDHC?", { intent: "question" }))
    expect(plan).toMatchObject({ kind: "turn", answer: true, extract: null, menuAgain: false, state: { phase: "menu", rounds: 1 } })
  })

  it("takes the menu choice and the file answer from a short reply", () => {
    const plan = planTurn(turn("3, yes", { state: inPhase("menu"), intent: "choose_both" }))
    expect(plan).toMatchObject({ kind: "turn", extract: null, state: { phase: "collect", module: "both", wantsFile: true } })
    if (plan.kind === "turn") expect(plan.state.project.meta.modules).toEqual({ quickCheck: true, businessPlan: true })
  })

  it("switches the draft to the Business Plan only", () => {
    const plan = planTurn(turn("2, no", { state: inPhase("menu") }))
    expect(plan.kind === "turn" && plan.state.project.meta.modules).toEqual({ quickCheck: false, businessPlan: true })
  })

  it("reads values from a first email that already holds data", () => {
    const plan = planTurn(turn("Please run a Quick Check: we have 42 buildings on 3.5 ha, all residential from 1961-1990.", { intent: "choose_quick_check" }))
    expect(plan).toMatchObject({ kind: "turn", extract: { quickCheck: true, bpSteps: [] }, state: { module: "quickCheck", phase: "collect" } })
    const data = planTurn(turn("We have 42 buildings and ground water.", { intent: "answers" }))
    expect(data).toMatchObject({ extract: { quickCheck: true }, state: { module: "quickCheck" } })
  })

  it("asks again when a menu reply chooses nothing", () => {
    expect(planTurn(turn("hmm", { state: inPhase("menu"), intent: "other" }))).toMatchObject({ menuAgain: true, extract: null })
  })

  it("reads the Quick Check while it is open, then the current Business Plan step", () => {
    const open = inPhase("collect", { module: "both" })
    expect(planTurn(turn("1. 42", { state: open, intent: "answers" }))).toMatchObject({ extract: { quickCheck: true, bpSteps: [] } })
    const done = inPhase("collect", { module: "both", bpStep: 2, project: projectWith({ ...QUICK_CHECK_ANSWERS, "meta.modules.businessPlan": true }) })
    expect(planTurn(turn("Our main risk is the connection rate.", { state: done, intent: "answers" }))).toMatchObject({ extract: { quickCheck: false, bpSteps: ["reality-check"] } })
    expect(planTurn(turn("see attached", { state: done, intent: "documents", attachments: 1 }))).toMatchObject({ extract: { quickCheck: true, bpSteps: ["opportunity", "business-logic", "reality-check", "implementation"] } })
  })

  it("reads nothing from small talk, a pure question or a command", () => {
    const state = inPhase("collect", { module: "quickCheck" })
    expect(planTurn(turn("Thanks!", { state, action: "small_talk", intent: "other" }))).toMatchObject({ extract: null, answer: false })
    expect(planTurn(turn("How is the heat density calculated?", { state, intent: "question" }))).toMatchObject({ extract: null, answer: true })
    expect(planTurn(turn("What if the area is 40000 m2?", { state, intent: "question" }))).toMatchObject({ extract: { quickCheck: true }, answer: true })
    expect(planTurn(turn("file", { state, intent: "wants_file" }))).toMatchObject({ extract: null, sendFile: true, state: { wantsFile: true } })
    expect(planTurn(turn("next", { state, intent: "other" }))).toMatchObject({ extract: null, next: true })
  })

  it("stops, hands over to a person, or starts over", () => {
    expect(planTurn(turn("stop", { state: inPhase("results") }))).toEqual({ kind: "stop", hadConversation: true })
    expect(planTurn(turn("Please delete everything you have about me", { intent: "stop" }))).toEqual({ kind: "stop", hadConversation: false })
    expect(planTurn(turn("Can I talk to a human?"))).toEqual({ kind: "handoff" })
    expect(planTurn(turn("new", { state: inPhase("results", { module: "quickCheck", rounds: 5 }) }))).toMatchObject({ restarted: true, state: { phase: "menu", module: null, rounds: 1 } })
  })

  it("points to the dashboard after the round limit", () => {
    expect(planTurn(turn("1. 43", { state: inPhase("results", { module: "quickCheck", rounds: MAX_ROUNDS }), intent: "answers" }))).toMatchObject({ limit: true, extract: null })
  })
})
