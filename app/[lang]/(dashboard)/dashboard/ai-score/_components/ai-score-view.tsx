"use client"

import { useDictionary } from "../../_components/i18n-provider"
import { PageHeader } from "../../_components/page-header"

/** The AI Plan Score page (PLAN-AI-SCORE-00 step 6). */
export function AiScoreView() {
  const copy = useDictionary("ai-score")
  return <PageHeader tone="hot" title={copy.title} description={copy.lead} />
}
