import type { Metadata } from "next"

import { LegalDoc, legalMetadata } from "../_components/legal/legal-doc"

export async function generateMetadata({ params }: PageProps<"/[lang]/ai">): Promise<Metadata> {
  return legalMetadata("ai", (await params).lang)
}

/** AI transparency (PLAN-DASH-12). The text lives in `dictionaries/<lang>/ai.json`. */
export default async function AiPage({ params }: PageProps<"/[lang]/ai">) {
  return <LegalDoc slug="ai" lang={(await params).lang} />
}
