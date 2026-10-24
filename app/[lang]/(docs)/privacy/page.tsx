import type { Metadata } from "next"

import { LegalDoc, legalMetadata } from "../_components/legal/legal-doc"

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  return legalMetadata("privacy", (await params).lang)
}

/** Privacy Policy (PLAN-DASH-12). The text lives in `dictionaries/<lang>/privacy.json`. */
export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  return <LegalDoc slug="privacy" lang={(await params).lang} />
}
