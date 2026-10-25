"use client"

import { ArrowRight, ArrowUpRight, Eye, Play } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import type { Locale } from "@/lib/i18n/locales"
import { CountUp } from "../count-up"
import { ExpertTable, type Seat } from "./expert-table"

export interface BlindTestView {
  seats: readonly Seat[]
  score: number
  band: number
  levelName: string
  turns: number
  /** Already formatted on the server. */
  input: string
  inputUrl: string
  decided: string
  gates: string
  mustHave: readonly string[]
  action: string | null
  outcome: readonly { text: string; url: string }[]
  recorded: string
  tryHref: string
}

export interface BlindTestCopy {
  blindLabel: string
  blindSource: string
  run: string
  mustHave: string
  suggestion: string
  reveal: string
  outcomeLabel: string
  sourceLink: string
  caveat: string
  tryIt: string
  replayHint: string
  tableLabel: string
}

type Phase = "idle" | "running" | "scored" | "revealed"

const TURN_MS = 520
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Slide 5's proof: a replay of the recorded blind run (`lib/presentation/blind-test`). First the
 * four turns light the table and the score appears with the decisions; then a second click shows
 * what really happened, with its sources.
 */
export function BlindTest({ lang, view, copy }: { lang: Locale; view: BlindTestView; copy: BlindTestCopy }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [turn, setTurn] = useState(0)
  const revealButton = useRef<HTMLButtonElement>(null)
  const outcomeLabel = useRef<HTMLParagraphElement>(null)
  const interacted = useRef(false)

  useEffect(() => {
    if (phase !== "running") return
    if (turn >= view.turns) {
      const done = window.setTimeout(() => setPhase("scored"), TURN_MS)
      return () => window.clearTimeout(done)
    }
    const next = window.setTimeout(() => setTurn((current) => current + 1), TURN_MS)
    return () => window.clearTimeout(next)
  }, [phase, turn, view.turns])

  // The button that was clicked gives way to the next step; focus follows, so it is never lost.
  useEffect(() => {
    if (!interacted.current) return
    if (phase === "scored") revealButton.current?.focus({ preventScroll: true })
    if (phase === "revealed") outcomeLabel.current?.focus({ preventScroll: true })
  }, [phase])

  const run = () => {
    interacted.current = true
    if (reducedMotion()) {
      setTurn(view.turns)
      setPhase("scored")
      return
    }
    setTurn(0)
    setPhase("running")
  }

  const scored = phase === "scored" || phase === "revealed"
  const lit = scored ? view.seats.length : Math.round((turn / view.turns) * view.seats.length)

  const centre = scored ? (
    <p className="expert-table__score">
      <span className="expert-table__number">
        <CountUp value={view.score} lang={lang} active={scored} duration={900} />
        <span className="expert-table__band">±{view.band}</span>
      </span>
      <span className="expert-table__level">{view.levelName}</span>
    </p>
  ) : (
    <p className="expert-table__score expert-table__score--idle">
      <span className="expert-table__number">{phase === "running" ? `${turn}/${view.turns}` : "—"}</span>
    </p>
  )

  return (
    <div className="blind" data-phase={phase}>
      <div className="blind__head">
        <p className="deck-label deck-label--hot">{copy.blindLabel}</p>
        <p className="blind__input">
          {view.input}{" "}
          <a href={view.inputUrl} target="_blank" rel="noopener noreferrer" className="deck-inline-link">
            {copy.blindSource}
            <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
          </a>
        </p>
      </div>

      <div className="blind__board">
        <ExpertTable seats={view.seats} lit={lit} centre={centre} label={copy.tableLabel} />
        <ul className="blind__dimensions">
          {view.seats.map((seat, index) => (
            <li key={seat.id} data-lit={index < lit || undefined} data-capped={seat.capped || undefined} style={{ "--score": scored ? seat.score : 0, "--i": index } as CSSProperties}>
              <span className="blind__dimension">{seat.name}</span>
              <span className="blind__bar" aria-hidden="true">
                <span />
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="blind__stage" aria-live="polite">
        {phase === "idle" || phase === "running" ? (
          <div className="blind__step">
            <button type="button" className="deck-cta" onClick={() => phase === "idle" && run()} aria-disabled={phase === "running"}>
              {copy.run}
              <Play size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <p className="blind__hint">{copy.replayHint}</p>
          </div>
        ) : null}

        {phase === "scored" ? (
          <div className="blind__step blind__step--scored">
            <p className="blind__stats">
              {view.decided} · {view.gates}
            </p>
            <p className="blind__musthave">
              <span className="deck-label deck-label--hot">{copy.mustHave}</span>
              {view.mustHave.map((gate) => (
                <span key={gate} className="deck-chip deck-chip--hot">
                  {gate}
                </span>
              ))}
            </p>
            {view.action ? (
              <blockquote className="blind__suggestion">
                <span className="deck-label deck-label--cool">{copy.suggestion}</span>
                <p>“{view.action}”</p>
              </blockquote>
            ) : null}
            <button ref={revealButton} type="button" className="deck-button deck-button--hot" onClick={() => setPhase("revealed")}>
              <Eye size={16} strokeWidth={1.6} aria-hidden="true" />
              {copy.reveal}
            </button>
          </div>
        ) : null}

        {phase === "revealed" ? (
          <div className="blind__step blind__step--revealed">
            <p ref={outcomeLabel} tabIndex={-1} className="deck-label deck-label--cool">
              {copy.outcomeLabel}
            </p>
            <ol className="blind__outcome">
              {view.outcome.map((item, index) => (
                <li key={item.url} style={{ "--i": index } as CSSProperties}>
                  <span>{item.text}</span>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="deck-inline-link">
                    {copy.sourceLink}
                    <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
            <p className="blind__caveat">{copy.caveat}</p>
            <p className="blind__try">
              <Link href={view.tryHref} className="deck-link-button" prefetch={false}>
                {copy.tryIt}
                <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
              </Link>
              <span className="blind__recorded">{view.recorded}</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
