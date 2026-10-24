import type { Metadata } from "next"

import { LegalDoc, legalMetadata } from "../_components/legal/legal-doc"

export async function generateMetadata({ params }: PageProps<"/[lang]/imprint">): Promise<Metadata> {
  return legalMetadata("imprint", (await params).lang)
}

/** Imprint (PLAN-DASH-12). The text lives in `dictionaries/<lang>/imprint.json`. */
export default async function ImprintPage({ params }: PageProps<"/[lang]/imprint">) {
  return <LegalDoc slug="imprint" lang={(await params).lang} />
}
