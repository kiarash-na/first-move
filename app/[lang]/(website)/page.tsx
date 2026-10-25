import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { recordedRun } from "@/lib/presentation/blind-test/recorded-run"
import Home from "./_components/Home"
import { LandingSwitch } from "./_components/LandingSwitch"
import { MobileLanding } from "./_components/mobile/MobileLanding"

/**
 * Landing page. The server loads the landing and common strings, names the recorded blind test
 * the AI Plan Score chapter replays (PLAN-LANDING-POLISH-00 step f) and renders both versions:
 * the desktop story (`Home`) from 1024 px and the simpler mobile and tablet landing below it; the
 * switch shows one by CSS and drops the other after hydration (PLAN-LANDING-MOBILE-00).
 */
export default async function Page({ params }: PageProps<"/[lang]">) {
  const lang = requireLocale((await params).lang)
  const [t, common, aiScore] = await Promise.all([getDictionary(lang, "landing"), getDictionary(lang, "common"), getDictionary(lang, "ai-score")])
  const run = recordedRun(aiScore.labels)

  return (
    <LandingSwitch
      desktop={<Home t={t} lang={lang} language={common.language} run={run} />}
      mobile={<MobileLanding t={t} lang={lang} language={common.language} run={run} />}
    />
  )
}
