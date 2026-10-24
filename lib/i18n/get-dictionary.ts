import "server-only"
import { deepMerge } from "./deep-merge"
import { dictionaryLoaders, type Area, type Dictionary } from "./dictionaries"
import { FALLBACK_LOCALE, type Locale } from "./locales"

/**
 * Loads one dictionary area on the server. DE is deep-merged over EN, so a key
 * missing in DE shows the EN text (D-32). Pass the strings (or a client
 * `I18nProvider`) to client components; never import the JSON there.
 */
export async function getDictionary<A extends Area>(lang: Locale, area: A): Promise<Dictionary<A>> {
  const base = (await dictionaryLoaders[FALLBACK_LOCALE][area]()) as Dictionary<A>
  if (lang === FALLBACK_LOCALE) return base
  const override = await dictionaryLoaders[lang][area]()
  return deepMerge(base, override)
}
