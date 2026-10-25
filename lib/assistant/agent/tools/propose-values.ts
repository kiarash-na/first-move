import { tool } from "ai"
import { z } from "zod"
import { fieldCatalogue, type CatalogueModule } from "@/lib/ai/extract/field-catalogue"
import { extractionSchema } from "@/lib/ai/extract/output-schema"
import { buildProposal } from "@/lib/ai/extract/propose"
import type { Project } from "@/lib/project"
import type { AgentContext } from "../context"

const modulesOf = (project: Project): CatalogueModule[] => (["quickCheck", "businessPlan"] as const).filter((module) => project.meta.modules[module])

/**
 * `propose_values`: the only way the assistant can change the project (D-51, D-60). The values are
 * checked against the field registry and dry-run through `applyPatch`, then shown as a review
 * card. Nothing is applied here: the user picks values and confirms, and the store applies them
 * with AI provenance. The model gets back what was valid and what was not.
 */
export function proposeValuesTool(context: AgentContext, project: Project) {
  const catalogue = fieldCatalogue({ modules: modulesOf(project) }, context.lang, context.texts)
  const ids = catalogue.fields.map((field) => field.id)
  if (ids.length === 0) return null
  const values = extractionSchema(ids).shape.values
  return tool({
    description:
      "Propose values for the open project's inputs. The user reviews them in a card and decides; nothing changes until they apply them. " +
      "Use field ids from get_project or the enum. Numbers as JSON numbers, with the unit when you know it. " +
      "Choices by option key or label. For a new row of a list (risks, partners…) give each property with the same `item` number. " +
      "`quote` is the user's words or the document passage the value comes from.",
    inputSchema: z.object({ values, note: z.string().max(300).optional().describe("One sentence for the user about the proposal") }),
    execute: async (input, { toolCallId }) => {
      const current = context.project()
      if (!current) return { status: "no-project" }
      const proposal = buildProposal([{ output: { values: input.values, unclear: [] } }], current, catalogue, context.texts)
      context.onProposal(toolCallId, proposal)
      return {
        status: "shown-for-review",
        note: "Nothing is applied yet. The user selects values and applies them in the review card; do not say they were applied.",
        valid: proposal.valid.map((entry) => ({ key: entry.key, label: entry.label })),
        invalid: proposal.invalid.map((entry) => ({ key: entry.key, label: entry.label, problem: entry.message })),
        unclear: proposal.unclear.map((entry) => ({ label: entry.label, reason: entry.reason })),
        conflicts: proposal.conflicts.length,
      }
    },
  })
}
