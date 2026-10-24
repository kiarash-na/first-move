import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import Home from "./_components/Home"

/** Landing page. The server loads the landing and common strings and passes them down as props. */
export default async function Page({ params }: PageProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const [t, common] = await Promise.all([getDictionary(lang, "landing"), getDictionary(lang, "common")])

  return <Home t={t} lang={lang} language={common.language} />
}
