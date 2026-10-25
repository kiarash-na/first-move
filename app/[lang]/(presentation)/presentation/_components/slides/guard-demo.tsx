"use client"

import { Ban, Check, MessageCircle, Send, TriangleAlert, Zap } from "lucide-react"
import { useEffect, useState, type CSSProperties } from "react"
import { formatNumber } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"
import { GUARD_SAMPLES, GUARD_SIGNALS, thresholdFor, type GuardSample, type GuardVerdict } from "@/lib/presentation/guard-demo"

export interface GuardDemoCopy {
  fast: { label: string; name: string; text: string }
  slow: { label: string; name: string; text: string }
  demoLabel: string
  pick: string
  samples: Record<GuardSample["id"], string>
  signals: Record<(typeof GUARD_SIGNALS)[number], string>
  verdicts: Record<GuardVerdict, string>
  thresholds: string
}

const VERDICT_ICON = { allow: Check, small_talk: MessageCircle, strike: TriangleAlert, block: Ban } as const
const JUDGE_MS = 650
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Slide 7's demo, scripted and offline: a sample email goes into System 1, the decision model's
 * four probabilities fill against the guard's real thresholds, and the code decides. Only an
 * allowed email reaches System 2, the text model.
 */
export function GuardDemo({ lang, copy, thresholds }: { lang: Locale; copy: GuardDemoCopy; thresholds: string }) {
  const [sample, setSample] = useState<GuardSample | null>(null)
  const [judged, setJudged] = useState(false)

  useEffect(() => {
    if (!sample || judged) return
    const timer = window.setTimeout(() => setJudged(true), JUDGE_MS)
    return () => window.clearTimeout(timer)
  }, [sample, judged])

  const send = (next: GuardSample) => {
    setSample(next)
    setJudged(reducedMotion())
  }

  const verdict = sample && judged ? sample.verdict : null
  const Icon = verdict ? VERDICT_ICON[verdict] : null

  return (
    <>
      <div className="slide__body systems">
        <div className="system system--fast" data-busy={(sample !== null && !judged) || undefined} data-reveal style={{ "--i": 3 } as CSSProperties}>
          <p className="deck-label deck-label--cool">
            <Zap size={14} strokeWidth={1.8} aria-hidden="true" />
            {copy.fast.label}
          </p>
          <p className="system__name">{copy.fast.name}</p>
          <p className="system__text">{copy.fast.text}</p>
        </div>
        <div className="system system--slow" data-on={verdict === "allow" || undefined} data-reveal style={{ "--i": 4 } as CSSProperties}>
          <p className="deck-label">{copy.slow.label}</p>
          <p className="system__name">{copy.slow.name}</p>
          <p className="system__text">{copy.slow.text}</p>
        </div>
      </div>

      <div className="slide__visual" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <div className="guard console">
          <p className="console__head">
            <span className="deck-label">{copy.demoLabel}</span>
          </p>
          <p className="guard__pick">{copy.pick}</p>
          <ul className="guard__samples">
            {GUARD_SAMPLES.map((entry) => (
              <li key={entry.id}>
                <button type="button" className="guard__sample" aria-pressed={sample?.id === entry.id} onClick={() => send(entry)}>
                  <Send size={14} strokeWidth={1.6} aria-hidden="true" />
                  <span>“{copy.samples[entry.id]}”</span>
                </button>
              </li>
            ))}
          </ul>
          <dl className="guard__signals">
            {GUARD_SIGNALS.map((signal) => {
              const value = sample && judged ? sample.signals[signal] : 0
              const over = value >= thresholdFor(signal)
              return (
                <div key={signal} className="guard__signal" data-over={over || undefined} style={{ "--value": value, "--threshold": thresholdFor(signal) } as CSSProperties}>
                  <dt>{copy.signals[signal]}</dt>
                  <dd>
                    <span className="guard__bar" aria-hidden="true">
                      <span className="guard__fill" />
                      <span className="guard__tick" />
                    </span>
                    <span className="guard__value">{sample && judged ? formatNumber(value, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "–"}</span>
                  </dd>
                </div>
              )
            })}
          </dl>
          <p className="guard__verdict" data-verdict={verdict ?? undefined} aria-live="polite">
            {Icon ? <Icon size={18} strokeWidth={1.8} aria-hidden="true" /> : null}
            {verdict ? copy.verdicts[verdict] : null}
          </p>
          <p className="guard__thresholds">{thresholds}</p>
        </div>
      </div>
    </>
  )
}
