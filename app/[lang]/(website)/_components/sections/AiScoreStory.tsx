'use client'

import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { withLocale } from '@/lib/i18n/locale-path'
import type { RecordedRun } from '@/lib/presentation/blind-test/recorded-run'
import { RichText } from '../rich-text'
import type { LandingCopyProps } from '../types'
import { AiScoreConsole } from './AiScoreConsole'

interface AiScoreStoryProps extends LandingCopyProps {
  /** The recorded blind test the console replays. */
  run: RecordedRun
}

/**
 * The AI Plan Score chapter (PLAN-LANDING-FIX-00 step 9), after the Business Plan's "next move"
 * and before the methodology: a separate AI opinion on the written plan, every decision shown.
 * The console replays the recorded blind test (PLAN-LANDING-POLISH-00 step f). Links to the
 * dashboard route and the docs page; the story link continues to the methodology.
 */
export function AiScoreStory({ t, lang, run }: AiScoreStoryProps) {
  const copy = t.aiScore

  return (
    <section className="story-section ai-score-section" id="ai-score" data-chapter aria-labelledby="ai-score-title">
      <div className="story-section__inner split-layout">
        <div className="section-copy" data-reveal>
          <p className="section-kicker section-kicker--hot">{copy.kicker}</p>
          <h2 className="section-title" id="ai-score-title"><RichText text={copy.title} /></h2>
          <p className="section-body">{copy.body}</p>

          <dl className="ai-facts">
            {copy.facts.map((fact) => (
              <div key={fact.title}>
                <dt><span>{fact.label}</span>{fact.title}</dt>
                <dd>{fact.text}</dd>
              </div>
            ))}
          </dl>

          <div className="ai-actions">
            <Link className="primary-action" href={withLocale('/dashboard/ai-score', lang)}>
              {copy.primary}
              <ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link className="text-link" href={withLocale('/docs/ai-plan-score', lang)}>
              {copy.secondary}
              <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>
          <a className="text-link story-link" href="#methodology">
            {copy.link}
            <ArrowDownRight size={17} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>

        <div className="ai-console-stage" data-reveal>
          <AiScoreConsole copy={copy.console} lang={lang} run={run} />
        </div>
      </div>
    </section>
  )
}
