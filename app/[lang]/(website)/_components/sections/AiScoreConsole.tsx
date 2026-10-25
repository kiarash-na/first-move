'use client'

import { useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, CircleDashed, RotateCcw, X } from 'lucide-react'
import { EMPTY_VALUE, formatDate, formatNumber } from '@/lib/i18n/format'
import { interpolate } from '@/lib/i18n/interpolate'
import { withLocale } from '@/lib/i18n/locale-path'
import type { Locale } from '@/lib/i18n/locales'
import { PROMISING_FROM, SOLID_FROM, type RecordedOutcome, type RecordedRun } from '@/lib/presentation/blind-test/recorded-run'
import type { Landing } from '../types'
import { useAiScorePlayback, useCountUp } from './useAiScorePlayback'

const outcomeIcon: Record<RecordedOutcome, typeof Check> = { pass: Check, unclear: CircleDashed, fail: X }
const EVIDENCE_LEVELS = [0, 1, 2, 3, 4] as const

/** Slide 5 of the presentation: the blind test, with what happened afterwards. */
export const BLIND_TEST_SLIDE = '#5'

interface AiScoreConsoleProps {
  copy: Landing['aiScore']['console']
  lang: Locale
  /** The recorded blind test (`lib/presentation/blind-test/recorded-run.ts`). */
  run: RecordedRun
}

/**
 * The AI Plan Score chapter's visual (PLAN-LANDING-FIX-00 step 9, PLAN-LANDING-POLISH-00 step f):
 * the recorded blind test on a real 2017 Vienna plan, replayed when it scrolls into view. Four
 * turns light up the 27 judgements to the evidence level Jev gave them, one real decision per
 * turn, then the score with its band on the Early / Promising / Solid scale and the seven
 * dimensions after their caps. Nothing is invented: every number is the recording's. Before the
 * run the score shows the empty value, no band and (CSS) no level, so nothing reads as a 0.
 */
export function AiScoreConsole({ copy, lang, run }: AiScoreConsoleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { step, final, run: play, replay } = useAiScorePlayback(ref, run.turns.length)
  const scored = step >= final
  const shown = useCountUp(run.score, scored, play)
  const level = copy.levels[run.level]
  const year = formatDate(run.planCreated, lang, { year: 'numeric', timeZone: 'UTC' })
  const capped = run.dimensions.filter((dimension) => dimension.capped).length
  const summary = interpolate(copy.summary, {
    year,
    fields: formatNumber(run.judgements, lang),
    score: formatNumber(run.score, lang),
    band: formatNumber(run.band, lang),
    level,
  })

  return (
    <div className="ai-console" data-step={step} data-scored={scored || undefined} ref={ref}>
      <div className="ai-console__head">
        <span className="ai-console__title">{copy.title}</span>
        <span className="ai-console__tag">{interpolate(copy.tag, { year })}</span>
        <button type="button" className="ai-console__replay" onClick={replay}>
          <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
          {copy.replay}
        </button>
      </div>

      <div className="ai-console__body" role="img" aria-label={summary}>
        <ol className="ai-turns">
          {run.turns.map((turn, index) => {
            const state = step > index + 1 ? 'done' : step === index + 1 ? 'active' : 'pending'
            const { decision } = turn
            const Icon = decision.outcome ? outcomeIcon[decision.outcome] : null
            return (
              <li className="ai-turn" data-state={state} key={turn.turn}>
                <span className="ai-turn__index">0{turn.turn}</span>
                <span className="ai-turn__name">
                  {copy.turns[turn.turn]}
                  <small>{interpolate(copy.fields, { count: formatNumber(turn.levels.length, lang) })}</small>
                </span>
                <span className="ai-turn__cells">
                  {turn.levels.map((cellLevel, cell) => (
                    <i key={cell} style={{ '--level': cellLevel, '--i': cell } as CSSProperties} />
                  ))}
                </span>
                <span className={`ai-turn__decision ai-turn__decision--${decision.outcome ?? 'branch'}`}>
                  <span className="ai-turn__kind">{decision.kind === 'branch' ? copy.branch : copy.gate}</span>
                  <span className="ai-turn__question">{decision.name}</span>
                  <span className="ai-turn__result">
                    {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
                    {decision.result}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="ai-legend">
          <span className="ai-legend__label">{copy.evidenceLabel}</span>
          {EVIDENCE_LEVELS.map((evidence) => (
            <span className="ai-legend__item" key={evidence}>
              <i style={{ '--level': evidence } as CSSProperties} />
              {copy.evidence[evidence]}
            </span>
          ))}
        </div>

        <div className="ai-result">
          <div className="ai-result__score">
            <span className="ai-result__label">{copy.scoreLabel}</span>
            <strong className={`ai-result__value ai-result__value--${run.level}`}>
              <span className="ai-result__number">{scored ? formatNumber(shown, lang) : EMPTY_VALUE}</span>
              {scored && <span className="ai-result__band">±{formatNumber(run.band, lang)}</span>}
            </strong>
            <span className={`ai-result__level ai-result__level--${run.level}`}>{level}</span>
            {run.capped && <span className="ai-result__capped">{interpolate(copy.capped, { count: formatNumber(capped, lang) })}</span>}
            <div className="ai-result__scale" style={{ '--score': run.score, '--band': run.band } as CSSProperties}>
              <span className="ai-result__zone ai-result__zone--early" style={{ '--span': PROMISING_FROM } as CSSProperties}>
                {copy.levels.early}<small>&lt; {formatNumber(PROMISING_FROM, lang)}</small>
              </span>
              <span className="ai-result__zone ai-result__zone--promising" style={{ '--span': SOLID_FROM - PROMISING_FROM } as CSSProperties}>
                {copy.levels.promising}<small>&lt; {formatNumber(SOLID_FROM, lang)}</small>
              </span>
              <span className="ai-result__zone ai-result__zone--solid" style={{ '--span': 100 - SOLID_FROM } as CSSProperties}>
                {copy.levels.solid}<small>≥ {formatNumber(SOLID_FROM, lang)}</small>
              </span>
              <i className="ai-result__range" />
              <i className={`ai-result__marker ai-result__marker--${run.level}`} />
            </div>
          </div>

          <ul className="ai-dimensions" aria-label={copy.dimensionsLabel}>
            {run.dimensions.map((dimension, index) => (
              <li key={dimension.id} data-capped={dimension.capped || undefined} style={{ '--score': dimension.score, '--i': index } as CSSProperties}>
                <span>{copy.dimensions[dimension.id]}</span>
                <i />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="ai-console__note">
        {interpolate(copy.note, { date: formatDate(run.at, lang, { dateStyle: 'long', timeZone: 'UTC' }), year })}{' '}
        <Link className="ai-console__link" href={`${withLocale('/presentation', lang)}${BLIND_TEST_SLIDE}`} prefetch={false}>
          {copy.link}
          <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </p>
    </div>
  )
}
