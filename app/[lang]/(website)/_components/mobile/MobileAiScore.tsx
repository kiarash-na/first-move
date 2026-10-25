import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { withLocale } from '@/lib/i18n/locale-path'
import type { RecordedRun } from '@/lib/presentation/blind-test/recorded-run'
import { RichText } from '../rich-text'
import type { LandingCopyProps } from '../types'
import { MobileAiConsole } from './MobileAiConsole'

interface MobileAiScoreProps extends LandingCopyProps {
  /** The recorded blind test the console replays. */
  run: RecordedRun
}

/** The AI Plan Score chapter: the three facts, the route and the docs page, and the recorded run. */
export function MobileAiScore({ t, lang, run }: MobileAiScoreProps) {
  const copy = t.aiScore

  return (
    <section className="m-section m-section--split" id="m-ai-score" aria-labelledby="m-ai-score-title">
      <div className="m-section__inner">
        <div className="m-section__copy" data-m-reveal>
          <p className="m-kicker m-kicker--hot">{copy.kicker}</p>
          <h2 className="m-title" id="m-ai-score-title"><RichText text={copy.title} /></h2>
          <p className="m-body">{copy.body}</p>

          <dl className="m-facts">
            {copy.facts.map((fact) => (
              <div key={fact.title}>
                <dt><span>{fact.label}</span>{fact.title}</dt>
                <dd>{fact.text}</dd>
              </div>
            ))}
          </dl>

          <div className="m-actions">
            <Link className="m-primary" href={withLocale('/dashboard/ai-score', lang)}>
              {copy.primary}
              <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />
            </Link>
            <Link className="m-text-link" href={withLocale('/docs/ai-plan-score', lang)}>
              {copy.secondary}
              <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>
          <a className="m-text-link m-story-link" href="#m-methodology">
            {copy.link}
            <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>

        <div data-m-reveal>
          <MobileAiConsole copy={copy.console} lang={lang} run={run} />
        </div>
      </div>
    </section>
  )
}
