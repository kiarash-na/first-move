import type { Metadata } from "next"

import { LegalDoc, legalMetadata } from "../_components/legal/legal-doc"

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  return legalMetadata("terms", (await params).lang)
}

/** Terms of Use (PLAN-DASH-12). The text lives in `dictionaries/<lang>/terms.json`. */
export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  return <LegalDoc slug="terms" lang={(await params).lang} />
}
