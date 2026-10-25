import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { blindSummary } from "@/lib/presentation/blind-test/summary"
import { SLIDE_IDS, type SlideId } from "@/lib/presentation/slides"
import type { ResultLevel } from "@/lib/quick-check/overall-rule"
import { Deck } from "./_components/deck"
import { AiEngineSlide } from "./_components/slides/ai-engine-slide"
import { BusinessPlanSlide } from "./_components/slides/business-plan-slide"
import { ChallengeSlide } from "./_components/slides/challenge-slide"
import { ContactSlide } from "./_components/slides/contact-slide"
import { EmailsSlide } from "./_components/slides/emails-slide"
import { NextMovesSlide } from "./_components/slides/next-moves-slide"
import { QuickCheckSlide } from "./_components/slides/quick-check-slide"
import { SelfHealingSlide } from "./_components/slides/self-healing-slide"
import { SystemOneSlide } from "./_components/slides/system-one-slide"
import { WhySlide } from "./_components/slides/why-slide"

export async function generateMetadata({ params }: PageProps<"/[lang]/presentation">): Promise<Metadata> {
  const { meta } = await getDictionary(requireLocale((await params).lang), "presentation")
  return { title: meta.title, description: meta.description }
}

/**
 * The presentation (PLAN-PRESENTATION-00): ten slides, static at build time. The server loads the
 * copy and the data each slide shows; the deck makes them one slide at a time.
 */
export default async function PresentationPage({ params }: PageProps<"/[lang]/presentation">) {
  const lang = requireLocale((await params).lang)
  const [t, common, aiScore, quickCheck] = await Promise.all([
    getDictionary(lang, "presentation"),
    getDictionary(lang, "common"),
    getDictionary(lang, "ai-score"),
    getDictionary(lang, "quick-check"),
  ])
  const s = t.slides
  const levelNames = Object.fromEntries(Object.entries(quickCheck.results.levels).map(([level, entry]) => [level, entry.label])) as Record<ResultLevel, string>
  const number = (id: SlideId) => SLIDE_IDS.indexOf(id) + 1

  const content: Record<SlideId, ReactNode> = {
    why: <WhySlide number={number("why")} copy={s.why} />,
    challenge: <ChallengeSlide number={number("challenge")} copy={s.challenge} />,
    quickCheck: <QuickCheckSlide number={number("quickCheck")} lang={lang} copy={s.quickCheck} levelNames={levelNames} />,
    businessPlan: <BusinessPlanSlide number={number("businessPlan")} lang={lang} copy={s.businessPlan} />,
    aiEngine: <AiEngineSlide number={number("aiEngine")} lang={lang} copy={s.aiEngine} labels={aiScore.labels} summary={blindSummary(lang)} />,
    emails: <EmailsSlide number={number("emails")} copy={s.emails} />,
    systemOne: <SystemOneSlide number={number("systemOne")} lang={lang} copy={s.systemOne} />,
    selfHealing: <SelfHealingSlide number={number("selfHealing")} copy={s.selfHealing} />,
    nextMoves: <NextMovesSlide number={number("nextMoves")} copy={s.nextMoves} />,
    contact: <ContactSlide number={number("contact")} lang={lang} copy={s.contact} />,
  }

  return (
    <Deck
      lang={lang}
      appName={common.app.name}
      homeLabel={t.deck.home}
      language={common.language}
      copy={t.deck}
      slides={SLIDE_IDS.map((id) => ({ id, title: s[id].title, content: content[id] }))}
    />
  )
}
