import type { Metadata } from "next"

import { LegalDoc, legalMetadata } from "../_components/legal/legal-doc"

export async function generateMetadata({ params }: PageProps<"/[lang]/cookies">): Promise<Metadata> {
  return legalMetadata("cookies", (await params).lang)
}

/** Cookie Policy (PLAN-DASH-12). The text lives in `dictionaries/<lang>/cookies.json`. */
export default async function CookiesPage({ params }: PageProps<"/[lang]/cookies">) {
  return <LegalDoc slug="cookies" lang={(await params).lang} />
}
