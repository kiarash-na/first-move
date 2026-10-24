import type { Metadata } from "next"

import { LegalDoc, legalMetadata } from "../_components/legal/legal-doc"

export async function generateMetadata({ params }: PageProps<"/[lang]/license">): Promise<Metadata> {
  return legalMetadata("license", (await params).lang)
}

/** Open-source licence (PLAN-DASH-12). The text lives in `dictionaries/<lang>/license.json`. */
export default async function LicensePage({ params }: PageProps<"/[lang]/license">) {
  return <LegalDoc slug="license" lang={(await params).lang} />
}
