import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'

/** The landing dictionary, loaded on the server and passed down as props. */
export type Landing = Dictionary<'landing'>

/** Props every landing section shares. */
export interface LandingCopyProps {
  t: Landing
  lang: Locale
}
