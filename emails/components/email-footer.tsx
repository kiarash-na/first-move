import { Fragment } from "react"
import type { Footer } from "../model"
import { COLORS, FONTS } from "../theme"

const small = { fontFamily: FONTS.sans, fontSize: 12, lineHeight: 1.5, color: COLORS.muted, margin: "0 0 6px" } as const

/**
 * Every email's footer (PLAN-AGENT-07 step 10, AI Act Art. 50(1)): written by an AI system and
 * not binding; human@ for privacy, legal requests or a person; the Terms and the Privacy Policy;
 * and, in a conversation, how to start over or stop.
 */
export function EmailFooter({ footer }: { footer: Footer }) {
  const [before, after = ""] = footer.human.split("{address}")
  return (
    <td style={{ padding: "16px 24px 20px", borderTop: `1px solid ${COLORS.line}`, background: COLORS.raised }}>
      <p style={{ ...small, color: COLORS.secondary }}>{footer.ai}</p>
      <p style={small}>
        {before}
        <a href={`mailto:${footer.humanAddress}`} style={{ color: COLORS.cool }}>
          {footer.humanAddress}
        </a>
        {after}
      </p>
      {footer.commands && <p style={small}>{footer.commands}</p>}
      <p style={{ ...small, margin: 0 }}>
        {footer.links.map((link, index) => (
          <Fragment key={link.href}>
            {index > 0 && " · "}
            <a href={link.href} style={{ color: COLORS.cool }}>
              {link.label}
            </a>
          </Fragment>
        ))}
      </p>
    </td>
  )
}
