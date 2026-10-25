import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import Home from "./_components/Home"
import { LandingSwitch } from "./_components/LandingSwitch"
import { MobileLanding } from "./_components/mobile/MobileLanding"

/**
 * Landing page. The server loads the landing and common strings and renders both versions: the
 * desktop story (`Home`) from 1024 px and the simpler mobile and tablet landing below it; the
 * switch shows one by CSS and drops the other after hydration (PLAN-LANDING-MOBILE-00).
 */
export default async function Page({ params }: PageProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const [t, common] = await Promise.all([getDictionary(lang, "landing"), getDictionary(lang, "common")])

  return (
    <LandingSwitch
      desktop={<Home t={t} lang={lang} language={common.language} />}
      mobile={<MobileLanding t={t} lang={lang} language={common.language} />}
    />
  )
}
