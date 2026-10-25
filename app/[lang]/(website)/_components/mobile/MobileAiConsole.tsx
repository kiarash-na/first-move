'use client'

import { useRef, type CSSProperties } from 'react'
import { Check, CircleDashed, RotateCcw, X } from 'lucide-react'
import { EMPTY_VALUE, formatNumber } from '@/lib/i18n/format'
import { interpolate } from '@/lib/i18n/interpolate'
import type { Locale } from '@/lib/i18n/locales'
import {
  EXAMPLE_DIMENSIONS,
  EXAMPLE_JUDGEMENTS,
  EXAMPLE_LEVEL,
  EXAMPLE_SCORE,
  EXAMPLE_TURNS,
  PROMISING_FROM,
  SOLID_FROM,
  type ExampleOutcome,
} from '../sections/aiScoreExample'
import { useAiScorePlayback, useCountUp } from '../sections/useAiScorePlayback'
import type { Landing } from '../types'

const OUTCOME_ICON: Record<ExampleOutcome, typeof Check> = { pass: Check, unclear: CircleDashed, fail: X }
const EVIDENCE = [0, 1, 2, 3, 4] as const

interface MobileAiConsoleProps {
  copy: Landing['aiScore']['console']
  lang: Locale
}

/**
 * The example run on phones and tablets (D-LM-6): the desktop's illustrative data and playback
 * (`sections/aiScoreExample.ts`, `sections/useAiScorePlayback.ts`, imported, not changed) in
 * simpler markup. Four turns light up their cells, one decision each, then the score with its
 * band and level on the three-zone scale and the seven dimensions. Plays once in view; with
 * reduced motion the final state shows at once; Replay starts over.
 */
export function MobileAiConsole({ copy, lang }: MobileAiConsoleProps) {
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
    <div className="m-panel m-panel--hot m-ai" data-step={step} data-scored={scored || undefined} ref={ref}>
      <div className="m-panel__head m-ai__head">
        <span>{copy.title}</span>
        <span className="m-ai__tag">{copy.tag}</span>
        <button type="button" className="m-choice m-choice--hot m-ai__replay" onClick={replay}>
          <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
          {copy.replay}
        </button>
      </div>

      <div className="m-panel__body" role="img" aria-label={summary}>
        <ol className="m-ai-turns">
          {EXAMPLE_TURNS.map((turn, index) => {
            const state = step > index + 1 ? 'done' : step === index + 1 ? 'active' : 'pending'
            const decision = copy.decisions[turn.turn]
            const outcome = turn.decision.kind === 'gate' ? turn.decision.outcome : null
            const Icon = outcome ? OUTCOME_ICON[outcome] : null
            return (
              <li className="m-ai-turn" data-state={state} key={turn.turn}>
                <span className="m-ai-turn__index">0{turn.turn}</span>
                <span className="m-ai-turn__name">
                  {copy.turns[turn.turn]}
                  <small>{interpolate(copy.fields, { count: formatNumber(turn.levels.length, lang) })}</small>
                </span>
                <span className="m-ai-turn__cells">
                  {turn.levels.map((cellLevel, cell) => (
                    <i key={cell} style={{ '--level': cellLevel, '--i': cell } as CSSProperties} />
                  ))}
                </span>
                <span className={`m-ai-turn__decision m-ai-turn__decision--${outcome ?? 'branch'}`}>
                  <span className="m-ai-turn__kind">{turn.decision.kind === 'branch' ? copy.branch : copy.gate}</span>
                  <span>{decision.name}</span>
                  <span className="m-ai-turn__result">
                    {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
                    {decision.result}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="m-ai-legend">
          <span className="m-ai-legend__label">{copy.evidenceLabel}</span>
          {EVIDENCE.map((evidence) => (
            <span key={evidence}>
              <i style={{ '--level': evidence } as CSSProperties} />
              {copy.evidence[evidence]}
            </span>
          ))}
        </div>

        <div className="m-ai-result">
          <span className="m-label">{copy.scoreLabel}</span>
          <div className="m-ai-score">
            <strong className="m-ai-score__number">{scored ? formatNumber(shown, lang) : EMPTY_VALUE}</strong>
            <span className="m-ai-score__band">±{formatNumber(EXAMPLE_SCORE.band, lang)}</span>
            <span className={`m-ai-score__level m-ai-score__level--${EXAMPLE_LEVEL}`}>{level}</span>
          </div>
          <div className="m-ai-scale" style={{ '--score': EXAMPLE_SCORE.score, '--band': EXAMPLE_SCORE.band } as CSSProperties}>
            <i className="m-ai-scale__zone m-ai-scale__zone--early" style={{ '--span': PROMISING_FROM } as CSSProperties} />
            <i className="m-ai-scale__zone m-ai-scale__zone--promising" style={{ '--span': SOLID_FROM - PROMISING_FROM } as CSSProperties} />
            <i className="m-ai-scale__zone m-ai-scale__zone--solid" style={{ '--span': 100 - SOLID_FROM } as CSSProperties} />
            <i className="m-ai-scale__range" />
            <i className={`m-ai-scale__marker m-ai-scale__marker--${EXAMPLE_LEVEL}`} />
          </div>
          <p className="m-ai-scale__legend">
            <span>{copy.levels.early} &lt; {formatNumber(PROMISING_FROM, lang)}</span>
            <span>{copy.levels.promising} &lt; {formatNumber(SOLID_FROM, lang)}</span>
            <span>{copy.levels.solid} ≥ {formatNumber(SOLID_FROM, lang)}</span>
          </p>

          <ul className="m-ai-dimensions" aria-label={copy.dimensionsLabel}>
            {EXAMPLE_DIMENSIONS.map((dimension, index) => (
              <li key={dimension.id} style={{ '--score': dimension.score / 100, '--i': index } as CSSProperties}>
                <span>{copy.dimensions[dimension.id]}</span>
                <i />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="m-note m-ai__note">{copy.note}</p>
    </div>
  )
}
