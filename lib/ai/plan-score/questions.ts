import type { Experimental_DecisionQuestion } from "ai"
import { BRANCHES, followUpGate, type Branch } from "./branches"
import { GATES, type Gate, type GateContext } from "./gates"
import { JUDGEMENTS, type Judgement, type Turn } from "./judgements"
import { LEVEL_CRITERIA } from "./scale"

/**
 * The questions of one turn (PLAN-AI-SCORE-00 § Method): a score question per filled judgement of
 * the step, the step's gates that no rule decided, the follow-up gates chosen by earlier branches,
 * and the branches that steer the next turn. The wording is part of the method: change it only
 * together with the method version.
 */

/** Trusted context for every question; the plan itself is only ever the state. */
export const CONTEXT =
  "The state is a business plan for a fifth-generation district heating and cooling network (5GDHC, also called an " +
  "anergy network: a low-temperature network that shares local heat sources between buildings, each with its own heat " +
  "pump), written by a project team in a planning tool. `plan` lists its parts by key, `scenario` names a predefined " +
  "use case if one was chosen, `quickCheck` holds figures from the tool's rough technical screening when available, " +
  "and `decisions` holds earlier judgements about this plan. The plan may be written in English or German. Judge the " +
  "substance, not the length or the style."

export type QuestionNode = { kind: "judgement"; judgement: Judgement } | { kind: "gate"; gate: Gate; branch: string | null } | { kind: "branch"; branch: Branch }

/** Decided before any AI: a gate whose rule already gives the outcome. */
export interface RuleDecision {
  gate: Gate
  branch: string | null
  outcome: "fail" | "skip"
}

export interface TurnQuestions {
  questions: Record<string, Experimental_DecisionQuestion>
  nodes: Record<string, QuestionNode>
  rules: RuleDecision[]
}

/** Question ids are short and safe: `j_<id>`, `g_<id>`, `b_<id>`. */
export const questionId = (prefix: "j" | "g" | "b", id: string) => `${prefix}_${id.replace(/[^A-Za-z0-9]+/g, "_")}`

export function scoreQuestion(judgement: Judgement): Experimental_DecisionQuestion {
  const fields = judgement.fields.length > 1 ? ` It covers: ${judgement.fields.map((field) => field.label).join("; ")}.` : ""
  return {
    type: "score",
    instructions:
      `${CONTEXT} Rate the plan part "${judgement.label}" (key \`${judgement.id}\`) on the evidence scale.${fields} ` +
      `What a strong answer contains: ${judgement.good} Judge only this part and use the others only to understand the project.`,
    criteria: LEVEL_CRITERIA,
  }
}

export function gateQuestion(gate: Pick<Gate, "question" | "options">): Experimental_DecisionQuestion {
  const instructions = `${CONTEXT} ${gate.question} Answer from what the plan states; what it only implies counts as not stated.`
  if (gate.options) return { type: "choice", instructions, criteria: Object.fromEntries(gate.options.map((option) => [option.id, option.criterion])) }
  return { type: "boolean", instructions }
}

export function branchQuestion(branch: Branch): Experimental_DecisionQuestion {
  return {
    type: "choice",
    instructions: `${CONTEXT} ${branch.question}`,
    criteria: Object.fromEntries(branch.options.map((option) => [option.id, option.criterion])),
  }
}

/**
 * @param filled ids of the judgements that have content (the others are not asked)
 * @param choices the options earlier branches chose, by branch id
 */
export function turnQuestions(turn: Turn, filled: ReadonlySet<string>, choices: Readonly<Record<string, string>>, context: GateContext): TurnQuestions {
  const questions: Record<string, Experimental_DecisionQuestion> = {}
  const nodes: Record<string, QuestionNode> = {}
  const rules: RuleDecision[] = []
  for (const judgement of JUDGEMENTS) {
    if (judgement.turn !== turn || !filled.has(judgement.id)) continue
    nodes[questionId("j", judgement.id)] = { kind: "judgement", judgement }
    questions[questionId("j", judgement.id)] = scoreQuestion(judgement)
  }
  const gates: { gate: Gate; branch: string | null }[] = [
    ...GATES.filter((gate) => gate.turn === turn).map((gate) => ({ gate, branch: null })),
    ...BRANCHES.filter((branch) => branch.followUpTurn === turn).flatMap((branch) => {
      const gate = choices[branch.id] ? followUpGate(branch, choices[branch.id]) : null
      return gate ? [{ gate, branch: branch.id }] : []
    }),
  ]
  for (const { gate, branch } of gates) {
    const rule = gate.precheck?.(context) ?? null
    if (rule) {
      rules.push({ gate, branch, outcome: rule })
      continue
    }
    nodes[questionId("g", gate.id)] = { kind: "gate", gate, branch }
    questions[questionId("g", gate.id)] = gateQuestion(gate)
  }
  for (const branch of BRANCHES.filter((entry) => entry.turn === turn)) {
    nodes[questionId("b", branch.id)] = { kind: "branch", branch }
    questions[questionId("b", branch.id)] = branchQuestion(branch)
  }
  return { questions, nodes, rules }
}
