import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { AI_FEATURES_LIVE, AI_PLAN_SCORE_LIVE, aiStatus, type AiStatus } from "@/lib/legal/ai"
import type { LegalSlug } from "@/lib/legal/docs"
import type { LegalDocCopy } from "@/lib/legal/types"
import { AiProviders } from "./ai-providers"
import { LegalPage } from "./legal-page"
import { ThirdPartyTable } from "./third-party-table"

/** The AI page carries a status line for each state of the features (`lib/legal/ai.ts`). */
type AiDocCopy = LegalDocCopy & { status: Record<AiStatus, string> }

async function loadDoc(slug: LegalSlug, lang: ReturnType<typeof requireLocale>): Promise<LegalDocCopy> {
  return (await getDictionary(lang, slug)) as unknown as LegalDocCopy
}

export async function legalMetadata(slug: LegalSlug, rawLang: string): Promise<Metadata> {
  const { meta } = await loadDoc(slug, requireLocale(rawLang))
  return { title: meta.title, description: meta.description }
}

/** Shared body of the six legal routes: loads the document and the shared labels, adds the extras. */
export async function LegalDoc({ slug, lang: rawLang }: { slug: LegalSlug; lang: string }) {
  const lang = requireLocale(rawLang)
  const [doc, legal] = await Promise.all([loadDoc(slug, lang), getDictionary(lang, "legal")])

  const status =
    slug === "ai" ? (doc as AiDocCopy).status[aiStatus(AI_FEATURES_LIVE, AI_PLAN_SCORE_LIVE)] : undefined
  const after =
    slug === "license"
      ? { "third-party": <ThirdPartyTable copy={legal.thirdParty} /> }
      : slug === "ai"
        ? { "how-it-runs": <AiProviders copy={legal.aiProviders} /> }
        : undefined

  return <LegalPage doc={doc} lang={lang} legal={legal} status={status} after={after} />
}
