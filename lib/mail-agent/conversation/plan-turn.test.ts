// @vitest-environment node
import { describe, expect, it } from "vitest"
import { parseReply } from "./commands"
import { adoptProject, planTurn, type TurnInput } from "./plan-turn"
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
    const withFile = planTurn(turn("Please send me the project file. We have 42 buildings on 3.5 ha.", { intent: "wants_file" }))
    expect(withFile).toMatchObject({ sendFile: true, chose: "default", extract: { quickCheck: true }, state: { module: "quickCheck" } })
    expect(planTurn(turn("What if a project has 40 buildings?", { intent: "question" }))).toMatchObject({ chose: null, extract: null, state: { phase: "menu" } })
  })

  it("takes the module from Jev when an opener or a number starts the menu reply, and reads its values", () => {
    const menu = { state: inPhase("menu", { rounds: 1 }) }
    const quickCheckOnly = { quickCheck: true, businessPlan: false }
    for (const text of ["All right, the Quick Check please.", "Alles klar, ich nehme den Quick Check. Datei ja."]) {
      const plan = planTurn(turn(text, { ...menu, intent: "choose_quick_check" }))
      expect(plan, text).toMatchObject({ chose: "explicit", extract: { quickCheck: true, bpSteps: [] }, state: { module: "quickCheck" } })
      expect(plan.kind === "turn" && plan.state.project.meta.modules, text).toEqual(quickCheckOnly)
    }
    const values = planTurn(turn("3,5 ha, 42 Gebäude, Wohngebäude 1961-1990: 100 %, Grundwasser hoch", { ...menu, intent: "answers" }))
    expect(values).toMatchObject({ chose: "default", extract: { quickCheck: true, bpSteps: [] }, state: { module: "quickCheck" } })
    const question = planTurn(turn("One question first: what does 5GDHC mean?", { ...menu, intent: "question" }))
    expect(question).toMatchObject({ answer: true, extract: null, chose: null, state: { phase: "menu", module: null } })
    expect(planTurn(turn("1, yes", { ...menu, intent: "choose_business_plan" }))).toMatchObject({ state: { module: "businessPlan" } })
    expect(planTurn(turn("2, no\n\nThe project is called Sonnenhof.", { ...menu, intent: "choose_business_plan" }))).toMatchObject({ extract: { quickCheck: false } })
  })

  it("keeps project text that mentions people out of the hand-off", () => {
    for (const text of [
      "We will talk to people in the district at a town hall meeting",
      "first we need to speak with someone at the municipality",
      "Our plan is to chat with people from the neighbourhood association",
      "Quick Check: 42 Gebäude, 3,5 ha. Wir wollen mit echten Menschen im Quartier reden.",
    ]) {
      const plan = planTurn(turn(text, { state: inPhase("collect", { module: "both", rounds: 3 }), intent: "answers" }))
      expect(plan, text).toMatchObject({ kind: "turn", extract: { quickCheck: true } })
    }
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

  it("records how the module was chosen; a project file decides a module that was only assumed", () => {
    expect(planTurn(turn("2", { state: inPhase("menu") }))).toMatchObject({ chose: "explicit" })
    expect(planTurn(turn("1. 42", { state: inPhase("collect", { module: "quickCheck" }), intent: "answers" }))).toMatchObject({ chose: null })
    const assumed = planTurn(turn("see attached", { intent: "documents", attachments: 1 }))
    expect(assumed).toMatchObject({ chose: "default", state: { module: "quickCheck" } })
    const file = projectWith({ "meta.modules.businessPlan": true, "site.name": "Sonnenhof" })
    if (assumed.kind !== "turn") throw new Error("expected a turn")
    expect(adoptProject(assumed.state, file, assumed.chose, NOW)).toMatchObject({ module: "both", phase: "collect", project: { site: { name: "Sonnenhof" } } })
    const named = adoptProject({ ...assumed.state, module: "businessPlan" }, file, "explicit", NOW)
    expect(named.project.meta.modules).toEqual({ quickCheck: false, businessPlan: true })
  })

  it("points to the dashboard after the round limit", () => {
    expect(planTurn(turn("1. 43", { state: inPhase("results", { module: "quickCheck", rounds: MAX_ROUNDS }), intent: "answers" }))).toMatchObject({ limit: true, extract: null })
  })
})
