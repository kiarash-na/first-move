import type { Section } from "@/emails/model"
import type { Intent } from "../../guard/questions"
import { parseReply } from "../commands"
import { planTurn, type TurnStep } from "../plan-turn"
import type { ConversationState } from "../state"

export const TURN_NOW = Date.UTC(2026, 9, 25, 10)

/** Plans one email the way `respond` does; fails the test when it is a stop or a hand-off. */
export function planStep(text: string, state: ConversationState | null, intent: Intent | null = "answers", attachments = 0): TurnStep {
  const plan = planTurn({ state, locale: "en", threadId: "t1", parsed: parseReply(text), intent, action: "allow", attachments, now: TURN_NOW })
  if (plan.kind !== "turn") throw new Error(`Expected a turn, got ${plan.kind}`)
  return plan
}

/** Each section's title, or its kicker when it has none. */
export const headings = (sections: readonly Section[]) => sections.map((section) => section.title ?? section.kicker)

/** The numbered questions of the first questions block. */
export function questionTexts(sections: readonly Section[]): string[] {
  for (const section of sections) {
    for (const block of section.blocks) if (block.type === "questions") return block.items.map((item) => item.text)
  }
  return []
}

/** Every text block's text, in order. */
export const texts = (sections: readonly Section[]) => sections.flatMap((section) => section.blocks.flatMap((block) => (block.type === "text" ? [block.text] : [])))
