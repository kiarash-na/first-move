'use client'

import { useRef, type CSSProperties } from 'react'
import { Check, CircleDashed, RotateCcw, X } from 'lucide-react'
import { formatNumber } from '@/lib/i18n/format'
import { interpolate } from '@/lib/i18n/interpolate'
import type { Locale } from '@/lib/i18n/locales'
import type { Landing } from '../types'
import {
  EXAMPLE_DIMENSIONS,
  EXAMPLE_JUDGEMENTS,
  EXAMPLE_LEVEL,
  EXAMPLE_SCORE,
  EXAMPLE_TURNS,
  PROMISING_FROM,
  SOLID_FROM,
  type ExampleOutcome,
} from './aiScoreExample'
import { useAiScorePlayback, useCountUp } from './useAiScorePlayback'

const outcomeIcon: Record<ExampleOutcome, typeof Check> = { pass: Check, unclear: CircleDashed, fail: X }
const EVIDENCE_LEVELS = [0, 1, 2, 3, 4] as const

interface AiScoreConsoleProps {
  copy: Landing['aiScore']['console']
  lang: Locale
}

/**
 * The AI Plan Score chapter's visual (PLAN-LANDING-FIX-00 step 9): an example run that plays when
 * it scrolls into view. Four turns light up the 27 judgements to their evidence level, one
 * decision per turn, then the score with its band on the Early / Promising / Solid scale and the
 * seven dimensions. Fixed, illustrative data (`aiScoreExample.ts`), labelled as such.
 */
export function AiScoreConsole({ copy, lang }: AiScoreConsoleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { step, final, run, replay } = useAiScorePlayback(ref, EXAMPLE_TURNS.length)
  const scored = step >= final
  const shown = useCountUp(EXAMPLE_SCORE.score, scored, run)
  const level = copy.levels[EXAMPLE_LEVEL]
  const summary = interpolate(copy.summary, {
    fields: formatNumber(EXAMPLE_JUDGEMENTS, lang),
    score: formatNumber(EXAMPLE_SCORE.score, lang),
    band: formatNumber(EXAMPLE_SCORE.band, lang),
    level,
  })

  return (
    <div className="ai-console" data-step={step} data-scored={scored || undefined} ref={ref}>
      <div className="ai-console__head">
        <span className="ai-console__title">{copy.title}</span>
        <span className="ai-console__tag">{copy.tag}</span>
        <button type="button" className="ai-console__replay" onClick={replay}>
          <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
          {copy.replay}
        </button>
      </div>

      <div className="ai-console__body" role="img" aria-label={summary}>
        <ol className="ai-turns">
          {EXAMPLE_TURNS.map((turn, index) => {
            const state = step > index + 1 ? 'done' : step === index + 1 ? 'active' : 'pending'
            const decision = copy.decisions[turn.turn]
            const outcome = turn.decision.kind === 'gate' ? turn.decision.outcome : null
            const Icon = outcome ? outcomeIcon[outcome] : null
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
                <span className={`ai-turn__decision ${outcome ? `ai-turn__decision--${outcome}` : 'ai-turn__decision--branch'}`}>
                  <span className="ai-turn__kind">{turn.decision.kind === 'branch' ? copy.branch : copy.gate}</span>
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
            <strong className={`ai-result__value ai-result__value--${EXAMPLE_LEVEL}`}>
              <span className="ai-result__number">{formatNumber(shown, lang)}</span>
              <span className="ai-result__band">±{formatNumber(EXAMPLE_SCORE.band, lang)}</span>
            </strong>
            <span className={`ai-result__level ai-result__level--${EXAMPLE_LEVEL}`}>{level}</span>
            <div className="ai-result__scale" style={{ '--score': EXAMPLE_SCORE.score, '--band': EXAMPLE_SCORE.band } as CSSProperties}>
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
              <i className={`ai-result__marker ai-result__marker--${EXAMPLE_LEVEL}`} />
            </div>
          </div>

          <ul className="ai-dimensions" aria-label={copy.dimensionsLabel}>
            {EXAMPLE_DIMENSIONS.map((dimension, index) => (
              <li key={dimension.id} style={{ '--score': dimension.score / 100, '--i': index } as CSSProperties}>
                <span>{copy.dimensions[dimension.id]}</span>
                <i />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="ai-console__note">{copy.note}</p>
    </div>
  )
}
