import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { I18nProvider } from "../_components/i18n-provider"
import { ProjectGate } from "../_components/project-gate"
import { AiScoreView } from "./_components/ai-score-view"

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/ai-score">): Promise<Metadata> {
  const aiScore = await getDictionary(requireLocale((await params).lang), "ai-score")
  return { title: aiScore.meta.title, description: aiScore.meta.description }
}

/**
 * The AI Plan Score of the open project (PLAN-AI-SCORE-00, D-71): a separate AI scoring of the
 * Business Plan. Agent UI: it may import the AI layer (`boundary.test.ts`). The shell is static;
 * the project is read on the client behind the gate's skeleton, like every dashboard page.
 */
export default async function AiScorePage({ params }: PageProps<"/[lang]/dashboard/ai-score">) {
  const lang = requireLocale((await params).lang)
  const aiScore = await getDictionary(lang, "ai-score")

  return (
    <I18nProvider lang={lang} dictionaries={{ "ai-score": aiScore }}>
      <ProjectGate module="businessPlan">
        <AiScoreView />
      </ProjectGate>
    </I18nProvider>
  )
}
