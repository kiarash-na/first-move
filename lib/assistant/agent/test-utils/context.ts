import { vi } from "vitest"
import type { Texts } from "@/lib/ai/extract/field-label"
import type { Proposal } from "@/lib/ai/extract/propose"
import type { KnowledgeChunk } from "@/lib/ai/knowledge/types"
import { EXAMPLES, localizeExample } from "@/lib/examples"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/locales"
import type { Project } from "@/lib/project"
import type { AgentContext } from "../context"

/** Tests only: the dictionaries the dashboard layout loads, as the assistant gets them. */
export async function dashboardTexts(lang: Locale): Promise<Texts> {
  const [shell, quickCheck, businessPlan, calc] = await Promise.all([
    getDictionary(lang, "shell"),
    getDictionary(lang, "quick-check"),
    getDictionary(lang, "business-plan"),
    getDictionary(lang, "calc"),
  ])
  return { shell, "quick-check": quickCheck, "business-plan": businessPlan, calc }
}

export const exampleProject = (lang: Locale = "en", index = 0): Project => localizeExample(EXAMPLES[index], lang)

const CHUNK: KnowledgeChunk = { id: "docs:quick-check#results", lang: "en", title: "Quick Check · Results", url: "/en/docs/quick-check#results", text: "The overall result combines coverage, densities and economics.", source: "content/docs/en/quick-check.mdx" }

/** Tests only: an agent context over one project, recording proposals and searches. */
export async function testContext(project: Project | null = exampleProject(), lang: Locale = "en") {
  const proposals = new Map<string, Proposal>()
  const search = vi.fn(async () => [{ chunk: CHUNK, score: 3.2 }])
  const context: AgentContext = {
    lang,
    texts: await dashboardTexts(lang),
    project: () => project,
    onProposal: (id, proposal) => proposals.set(id, proposal),
    search,
  }
  return { context, proposals, search }
}
