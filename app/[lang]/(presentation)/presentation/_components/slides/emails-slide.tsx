import { Bot, Mail, UserRound } from "lucide-react"
import type { CSSProperties } from "react"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { interpolate } from "@/lib/i18n/interpolate"
import { OPERATOR } from "@/lib/legal/operator"
import { SlideHeading } from "../slide-heading"

type Copy = Dictionary<"presentation">["slides"]["emails"]

/**
 * Slide 6: the two addresses (lib/legal/operator.ts). agent@ is answered by an AI agent and is not
 * live yet (intake and guard built in A06, the conversation is A07); human@ is read by a person.
 */
export function EmailsSlide({ number, copy }: { number: number; copy: Copy }) {
  const cards = [
    { key: "agent", address: OPERATOR.emailAgent, icon: Bot, tone: "cool", ...copy.agent },
    { key: "human", address: OPERATOR.emailHuman, icon: UserRound, tone: "paper", ...copy.human },
  ] as const

  return (
    <div className="slide slide--stack slide--emails">
      <SlideHeading number={number} kicker={copy.kicker} headline={copy.headline} accent={copy.accent} />
      <ul className="mail-cards">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <li key={card.key} className="mail-card" data-tone={card.tone} data-reveal style={{ "--i": 3 + index } as CSSProperties}>
              <p className="mail-card__who">
                <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                {card.who}
                {"status" in card ? <span className="deck-chip deck-chip--hot">{card.status}</span> : null}
              </p>
              <a className="mail-card__address" href={`mailto:${card.address}`} aria-label={interpolate(copy.write, { address: card.address })}>
                <Mail className="mail-card__envelope" size={22} strokeWidth={1.6} aria-hidden="true" />
                <span>
                  {card.address.split("@")[0]}
                  <span className="mail-card__domain">@{card.address.split("@")[1]}</span>
                </span>
              </a>
              <p className="mail-card__text">{card.text}</p>
              {"statusNote" in card ? <p className="mail-card__note">{card.statusNote}</p> : null}
              <span className="mail-card__route" aria-hidden="true" />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
