import type { Texts } from "@/lib/ai/extract/field-label"
import type { Proposal } from "@/lib/ai/extract/propose"
import type { SearchHit } from "@/lib/ai/knowledge/types"
import type { Locale } from "@/lib/i18n/locales"
import type { Project } from "@/lib/project"

/** What the assistant's tools may see and do in the browser. Read-only, except for showing a proposal. */
export interface AgentContext {
  lang: Locale
  /** The dashboard's dictionaries (shell, quick-check, business-plan, calc) in the UI language. */
  texts: Texts
  /** A fresh snapshot of the open project, or null. */
  project: () => Project | null
  /** Shows a proposal as a review card; nothing is applied until the user confirms. */
  onProposal: (toolCallId: string, proposal: Proposal) => void
  /** The public docs knowledge (D-57); injectable for tests. */
  search: (lang: Locale, query: string, limit?: number) => Promise<SearchHit[]>
}
