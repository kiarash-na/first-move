import { getExample, localizeExample } from "@/lib/examples"
import type { Locale } from "@/lib/i18n/locales"
import type { Project } from "@/lib/project"

/**
 * Slide 3: the real Quick Check engine on one of the app's illustrative examples. The server
 * renders the first result (`runDemo`); "Run again" runs the same engine in the browser on the
 * same inputs, and the fingerprint of the full result shows that nothing changed.
 */
export const DEMO_EXAMPLE_ID = "school-kindergarten-flats"

export function demoProject(lang: Locale): Project {
  const example = getExample(DEMO_EXAMPLE_ID)
  if (!example) throw new Error(`Example ${DEMO_EXAMPLE_ID} is missing`)
  return localizeExample(example, lang)
}

export { runDemo, type QuickCheckDemoResult } from "./run-demo"
