import "server-only"
import type { Locale } from "@/lib/i18n/locales"

/** Common function words; neither list holds a word of the other language. */
const WORDS: Record<Locale, ReadonlySet<string>> = {
  de: new Set(
    "und oder der die das den dem des ein eine einen einem einer ist sind wir ich sie es nicht mit für auf bei aus von zu zum zur im ins wie was wer wo warum gibt haben hat habe bitte danke hallo guten tag sehr geehrte liebe gebäude fläche wärme kälte ja nein auch noch nur schon über unter unser unsere ihr ihre kann können möchte möchten würde wurde werden".split(
      " ",
    ),
  ),
  en: new Set(
    "and or the a an is are we i you it not with for on at from to in into how what who where why there have has please thanks thank hello dear buildings area heat heating cooling yes no also still only already about under our your can could would like want this that these those".split(
      " ",
    ),
  ),
}

/** German letters that English text does not use. */
const UMLAUTS = /[äöüß]/i

/**
 * The language a person wrote in (the agent replies in it): German or English, by counting
 * function words, with umlauts as a tie-breaker. Null when the text is too short or unclear, so
 * the conversation keeps its language. Deterministic, so it runs before consent without any model.
 */
export function detectLocale(text: string): Locale | null {
  const words = text.toLowerCase().match(/[a-zäöüß]+/g) ?? []
  let de = 0
  let en = 0
  for (const word of words) {
    if (WORDS.de.has(word)) de++
    if (WORDS.en.has(word)) en++
  }
  if (UMLAUTS.test(text)) de += 1
  if (de + en < 2) return null
  if (de >= en * 1.5 && de > en) return "de"
  if (en >= de * 1.5 && en > de) return "en"
  return null
}
