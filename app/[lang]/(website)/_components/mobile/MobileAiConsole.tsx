'use client'

import { useRef, type CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, CircleDashed, RotateCcw, X } from 'lucide-react'
import { EMPTY_VALUE, formatDate, formatNumber } from '@/lib/i18n/format'
import { interpolate } from '@/lib/i18n/interpolate'
import { withLocale } from '@/lib/i18n/locale-path'
import type { Locale } from '@/lib/i18n/locales'
import { PROMISING_FROM, SOLID_FROM, type RecordedOutcome, type RecordedRun } from '@/lib/presentation/blind-test/recorded-run'
import { BLIND_TEST_SLIDE } from '../sections/AiScoreConsole'
import { useAiScorePlayback, useCountUp } from '../sections/useAiScorePlayback'
import type { Landing } from '../types'

const OUTCOME_ICON: Record<RecordedOutcome, typeof Check> = { pass: Check, unclear: CircleDashed, fail: X }
const EVIDENCE = [0, 1, 2, 3, 4] as const

interface MobileAiConsoleProps {
  copy: Landing['aiScore']['console']
  lang: Locale
  /** The recorded blind test (`lib/presentation/blind-test/recorded-run.ts`). */
  run: RecordedRun
}

/**
 * The recorded blind test on phones and tablets (D-LM-6, PLAN-LANDING-POLISH-00 step f): the
 * same recording and playback hook as the desktop (`sections/useAiScorePlayback.ts`) in simpler
 * markup. Four turns light up their cells to the recorded evidence levels, one real decision
 * each, then the score with its band and level on the three-zone scale and the seven dimensions
 * after their caps. Plays once in view; with reduced motion the final state shows at once;
 * Replay starts over.
 */
export function MobileAiConsole({ copy, lang, run }: MobileAiConsoleProps) {
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
    <div className="m-panel m-panel--hot m-ai" data-step={step} data-scored={scored || undefined} ref={ref}>
      <div className="m-panel__head m-ai__head">
        <span>{copy.title}</span>
        <span className="m-ai__tag">{interpolate(copy.tag, { year })}</span>
        <button type="button" className="m-choice m-choice--hot m-ai__replay" onClick={replay}>
          <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
          {copy.replay}
        </button>
      </div>

      <div className="m-panel__body" role="img" aria-label={summary}>
        <ol className="m-ai-turns">
          {run.turns.map((turn, index) => {
            const state = step > index + 1 ? 'done' : step === index + 1 ? 'active' : 'pending'
            const { decision } = turn
            const Icon = decision.outcome ? OUTCOME_ICON[decision.outcome] : null
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
                <span className={`m-ai-turn__decision m-ai-turn__decision--${decision.outcome ?? 'branch'}`}>
                  <span className="m-ai-turn__kind">{decision.kind === 'branch' ? copy.branch : copy.gate}</span>
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
            {scored && <span className="m-ai-score__band">±{formatNumber(run.band, lang)}</span>}
            <span className={`m-ai-score__level m-ai-score__level--${run.level}`}>{level}</span>
          </div>
          {run.capped && <p className="m-ai-score__capped">{interpolate(copy.capped, { count: formatNumber(capped, lang) })}</p>}
          <div className="m-ai-scale" style={{ '--score': run.score, '--band': run.band } as CSSProperties}>
            <i className="m-ai-scale__zone m-ai-scale__zone--early" style={{ '--span': PROMISING_FROM } as CSSProperties} />
            <i className="m-ai-scale__zone m-ai-scale__zone--promising" style={{ '--span': SOLID_FROM - PROMISING_FROM } as CSSProperties} />
            <i className="m-ai-scale__zone m-ai-scale__zone--solid" style={{ '--span': 100 - SOLID_FROM } as CSSProperties} />
            <i className="m-ai-scale__range" />
            <i className={`m-ai-scale__marker m-ai-scale__marker--${run.level}`} />
          </div>
          <p className="m-ai-scale__legend">
            <span>{copy.levels.early} &lt; {formatNumber(PROMISING_FROM, lang)}</span>
            <span>{copy.levels.promising} &lt; {formatNumber(SOLID_FROM, lang)}</span>
            <span>{copy.levels.solid} ≥ {formatNumber(SOLID_FROM, lang)}</span>
          </p>

          <ul className="m-ai-dimensions" aria-label={copy.dimensionsLabel}>
            {run.dimensions.map((dimension, index) => (
              <li key={dimension.id} data-capped={dimension.capped || undefined} style={{ '--score': dimension.score, '--i': index } as CSSProperties}>
                <span>{copy.dimensions[dimension.id]}</span>
                <i />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="m-note m-ai__note">
        {interpolate(copy.note, { date: formatDate(run.at, lang, { dateStyle: 'long', timeZone: 'UTC' }), year })}{' '}
        <Link className="m-ai__link" href={`${withLocale('/presentation', lang)}${BLIND_TEST_SLIDE}`} prefetch={false}>
          {copy.link}
          <ArrowUpRight size={14} strokeWidth={1.7} aria-hidden="true" />
        </Link>
      </p>
    </div>
  )
}
