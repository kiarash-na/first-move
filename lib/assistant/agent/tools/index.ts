import type { ToolSet } from "ai"
import type { AgentContext } from "../context"
import { explainTool } from "./explain"
import { getProjectTool } from "./get-project"
import { proposeValuesTool } from "./propose-values"
import { searchDocsTool } from "./search-docs"

/**
 * The assistant's tools (PLAN-AGENT-05 step 7, kept minimal for O7): three read-only tools and
 * one that only shows a proposal. No network, browsing or write tool (D-51).
 */
export function assistantTools(context: AgentContext): ToolSet {
  const project = context.project()
  const propose = project ? proposeValuesTool(context, project) : null
  return {
    get_project: getProjectTool(context),
    search_docs: searchDocsTool(context),
    explain: explainTool(context),
    ...(propose && { propose_values: propose }),
  }
}
