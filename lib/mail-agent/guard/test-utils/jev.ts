import { Experimental_DecisionMockModelV4 } from "ai/test"
import type { GuardDecision } from "../decide"
import { INTENTS, TOPICS } from "../questions"

const SAFE: GuardDecision = { topic: "first_move", offTopic: 0.05, intent: "question", injection: 0.01, harassment: 0.01, malicious: 0.01 }

/** A topic distribution with the chosen topic on top and `offTopic` as P(off_topic). */
function topicAnswer(topic: GuardDecision["topic"], offTopic: number) {
  const probabilities = Object.fromEntries(TOPICS.map((option) => [option, 0])) as Record<string, number>
  probabilities.off_topic = offTopic
  if (topic === "off_topic") {
    probabilities.first_move = (1 - offTopic) / 2
    probabilities.small_talk = (1 - offTopic) / 2
  } else probabilities[topic] = 1 - offTopic
  return { type: "choice" as const, choice: topic, probabilities }
}

/**
 * A mock Jev for tests: answers with `decision` (safe defaults for the rest), refuses, or fails.
 * `calls` records what the guard sent.
 */
export function mockJev(decision: Partial<GuardDecision> | "refuse" | "fail" = {}, inputTokens = 900) {
  const calls: Parameters<Experimental_DecisionMockModelV4["doDecide"]>[0][] = []
  const model = new Experimental_DecisionMockModelV4({
    provider: "test",
    modelId: "jev-test",
    doDecide: async (options) => {
      calls.push(options)
      if (decision === "fail") throw new Error("gateway down")
      if (decision === "refuse") {
        return { answers: Object.fromEntries(Object.keys(options.questions).map((id) => [id, { type: "refusal" as const }])), warnings: [] }
      }
      const d = { ...SAFE, ...decision }
      const answers = {
        topic: topicAnswer(d.topic, d.offTopic),
        intent: { type: "choice" as const, choice: d.intent, probabilities: Object.fromEntries(INTENTS.map((option) => [option, option === d.intent ? 1 : 0])) },
        injection: { type: "boolean" as const, probability: d.injection },
        harassment: { type: "boolean" as const, probability: d.harassment },
        malicious: { type: "boolean" as const, probability: d.malicious },
      }
      const asked = Object.fromEntries(Object.keys(options.questions).map((id) => [id, answers[id as keyof typeof answers]]))
      return { answers: asked, usage: { inputTokens }, warnings: [] }
    },
  })
  return { model, calls }
}
