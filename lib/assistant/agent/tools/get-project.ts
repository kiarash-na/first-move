import { tool } from "ai"
import { z } from "zod"
import { untrustedDocument } from "@/lib/ai/prompts/untrusted"
import type { AgentContext } from "../context"
import { projectView } from "../project-view"

/**
 * `get_project`: the open project as a compact view (inputs, empty fields, the Quick Check result
 * from the engine). The texts are the user's own data, so they arrive as an untrusted block.
 */
export function getProjectTool(context: AgentContext) {
  return tool({
    description:
      "Read the open project: its filled inputs (id, label, value, unit), the empty inputs, the Quick Check result as First Move computed it, and the AI Plan Score if there is one. Call it before answering about the project.",
    inputSchema: z.object({}),
    execute: async () => {
      const project = context.project()
      if (!project) return "No project is open."
      return untrustedDocument("open-project", JSON.stringify(projectView(project, context.texts, context.lang)))
    },
  })
}
