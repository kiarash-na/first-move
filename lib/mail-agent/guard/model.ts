import "server-only"
import { createGateway, type Experimental_DecisionModel } from "ai"
import type { MailAgentConfig } from "../env"

/** Jev through the Vercel AI Gateway with the agent's own Gateway key (D-52), never a global default. */
export function decisionModel(config: MailAgentConfig): Experimental_DecisionModel {
  return createGateway({ apiKey: config.gateway.apiKey }).decisionModel(config.gateway.decisionModel)
}
