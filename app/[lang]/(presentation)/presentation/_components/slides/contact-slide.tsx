import { ArrowUpRight } from "lucide-react"
import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"
import { COST, displayUrl, ONE_SLASH } from "@/lib/presentation/facts"
import { OWNER_LINK } from "@/lib/presentation/qr"
import { SlideHeading } from "../slide-heading"
import { CostFigures } from "./cost-figures"
import { QrCode } from "./qr-code"

/**
 * Slide 10: what it cost to make and costs to run (the owner's figures), the offer to work
 * together, the owner's link page with a QR code, and /1Slash, a human and AI service.
 */
export function ContactSlide({ number, lang, copy }: { number: number; lang: Locale; copy: Dictionary<"presentation">["slides"]["contact"] }) {
  return (
    <div className="slide slide--split slide--contact">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <div className="slide__body">
        <CostFigures lang={lang} copy={copy} cost={COST} />
        <p className="contact__open" data-reveal style={{ "--i": 4 } as CSSProperties}>
          {copy.open}
        </p>
        <p className="contact__slash" data-reveal style={{ "--i": 5 } as CSSProperties}>
          <span className="deck-label">{copy.poweredBy}</span>
          <a href={ONE_SLASH.url} target="_blank" rel="noopener noreferrer" className="contact__slash-link">
            {ONE_SLASH.name}
            <ArrowUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </a>
          <span className="contact__slash-note">{copy.slash}</span>
        </p>
      </div>
      <div className="slide__visual contact__qr" data-reveal style={{ "--i": 2 } as CSSProperties}>
        <div className="qr-panel">
          <QrCode value={OWNER_LINK} label={copy.qrLabel} />
          <span className="qr-panel__scan" aria-hidden="true" />
        </div>
        <a href={OWNER_LINK} target="_blank" rel="noopener noreferrer" className="contact__link">
          <span className="deck-label">{copy.links}</span>
          <span className="contact__url">
            {displayUrl(OWNER_LINK)}
            <ArrowUpRight size={18} strokeWidth={1.6} aria-hidden="true" />
          </span>
        </a>
      </div>
    </div>
  )
}
