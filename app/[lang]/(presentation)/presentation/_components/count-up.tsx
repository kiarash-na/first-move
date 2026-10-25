"use client"

import { useEffect, useRef } from "react"
import { formatEur, formatNumber } from "@/lib/i18n/format"
import type { Locale } from "@/lib/i18n/locales"

export type CountUpStyle = "number" | "eur"

const format = (value: number, lang: Locale, style: CountUpStyle) => (style === "eur" ? formatEur(value, lang) : formatNumber(value, lang, { maximumFractionDigits: 0 }))

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * A number that counts up from zero while `active` turns true, then rests on the exact value. The
 * server and assistive technology always get the final value; only the visible digits move, and
 * not at all with reduced motion.
 */
export function CountUp({ value, lang, style = "number", active, duration = 1400 }: { value: number; lang: Locale; style?: CountUpStyle; active: boolean; duration?: number }) {
  const digits = useRef<HTMLSpanElement>(null)
  const final = format(value, lang, style)

  useEffect(() => {
    const element = digits.current
    if (!element || !active || reducedMotion()) return
    let frame = 0
    const started = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - (1 - progress) ** 3
      element.textContent = progress < 1 ? format(Math.round(value * eased), lang, style) : final
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      element.textContent = final
    }
  }, [active, value, lang, style, duration, final])

  return (
    <span className="count-up">
      <span ref={digits} aria-hidden="true">
        {final}
      </span>
      <span className="sr-only">{final}</span>
    </span>
  )
}
