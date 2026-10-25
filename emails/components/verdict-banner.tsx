import type { ResultLevel } from "../model"
import { COLORS, FONTS, TEXT } from "../theme"

/** The state mapping of DESIGN-TOKENS §2: promising in cyan, not promising in orange, further analysis in ink. */
const LEVEL: Record<ResultLevel, { color: string; mark: string }> = {
  promising: { color: COLORS.cool, mark: "✓" },
  further_analysis: { color: COLORS.ink, mark: "?" },
  not_promising: { color: COLORS.hot, mark: "✕" },
}

/**
 * The overall Quick Check result (QCT-KF-01): a 3px bar in the level's colour, a square mark,
 * the level and its description, and a badge when a fixed rule set it. No images: the bar and the
 * mark are CSS and text.
 */
export function VerdictBanner({ level, label, description, badge }: { level: ResultLevel; label: string; description: string; badge?: string }) {
  const { color, mark } = LEVEL[level]
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 18px", background: COLORS.raised, border: `1px solid ${COLORS.line}`, borderTop: `3px solid ${color}` }}>
      <tbody>
        <tr>
          <td valign="top" width={56} style={{ padding: "16px 0 16px 16px", width: 56 }}>
            <div aria-hidden="true" style={{ width: 40, height: 40, lineHeight: "40px", border: `1px solid ${color}`, color, textAlign: "center", fontFamily: FONTS.mono, fontSize: 20 }}>
              {mark}
            </div>
          </td>
          <td valign="top" style={{ padding: "14px 16px" }}>
            <p style={{ ...TEXT.title, color, fontSize: 24, margin: "0 0 4px" }}>{label}</p>
            <p style={{ ...TEXT.small, color: COLORS.secondary, margin: badge ? "0 0 8px" : 0 }}>{description}</p>
            {badge && <p style={{ ...TEXT.kicker, color: COLORS.ink, border: `1px solid ${COLORS.lineStrong}`, display: "inline-block", padding: "2px 8px", margin: 0 }}>{badge}</p>}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
