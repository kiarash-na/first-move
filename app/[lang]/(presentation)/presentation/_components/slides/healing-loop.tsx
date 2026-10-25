"use client"

import { Bug, Check, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export interface HealingLoopCopy {
  stages: readonly string[]
  break: string
  healed: string
  loopLabel: string
}

/** -1 idle, 0..3 the stage reached, 4 healed. */
type Step = -1 | 0 | 1 | 2 | 3 | 4

const STEP_MS = 950
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Slide 8's loop (a concept, not built): "Break something" puts an error into a small app; a
 * token runs the four stages around it (tracked, reproduced, fix proposed, a person approves)
 * and the app comes back fixed.
 */
export function HealingLoop({ copy }: { copy: HealingLoopCopy }) {
  const [step, setStep] = useState<Step>(-1)

  useEffect(() => {
    if (step < 0 || step >= 4) return
    const timer = window.setTimeout(() => setStep((current) => (current + 1) as Step), step === 3 ? STEP_MS * 1.3 : STEP_MS)
    return () => window.clearTimeout(timer)
  }, [step])

  const breakIt = () => setStep(reducedMotion() ? 4 : 0)
  const running = step >= 0 && step < 4

  return (
    <div className="healing" data-step={step}>
      <div className="healing__loop" role="group" aria-label={copy.loopLabel}>
        <span className="healing__track" aria-hidden="true" />
        <ol className="healing__stages">
          {copy.stages.map((stage, index) => (
            <li key={stage} className="healing__stage" data-corner={index} data-reached={(step >= index && step >= 0) || undefined} data-current={step === index || undefined}>
              <span className="healing__index" aria-hidden="true">
                {index + 1}
              </span>
              <span className="healing__label">{stage}</span>
            </li>
          ))}
        </ol>
        <span className="healing__token" aria-hidden="true" />
        <div className="healing__app" aria-hidden="true">
          <span className="healing__app-bar" />
          <span className="healing__app-line" />
          <span className="healing__app-line healing__app-line--short" />
          <span className="healing__app-mark">{step === 4 ? <Check size={22} strokeWidth={2} /> : step >= 0 ? <Bug size={22} strokeWidth={1.8} /> : null}</span>
        </div>
      </div>
      <div className="healing__actions">
        <button type="button" className="deck-button deck-button--hot" onClick={() => !running && breakIt()} aria-disabled={running}>
          <Zap size={16} strokeWidth={1.6} aria-hidden="true" />
          {copy.break}
        </button>
        <p className="healing__status" aria-live="polite">
          {step === 4 ? copy.healed : step >= 0 ? copy.stages[step] : null}
        </p>
      </div>
    </div>
  )
}
