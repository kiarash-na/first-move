import type { IndicatorItem } from "../model"
import { COLORS, FONTS, TEXT } from "../theme"

const EFFECT = { supporting: COLORS.cool, limiting: COLORS.hot } as const

/** One card's cell: label, value, class and effect, with a 3px top rule in the effect colour. */
function cardCell(item: IndicatorItem) {
  const color = item.effect ? EFFECT[item.effect] : COLORS.lineStrong
  return (
    <td key={item.label} valign="top" width="49%" style={{ width: "49%", padding: "12px 14px", background: COLORS.raised, border: `1px solid ${COLORS.line}`, borderTop: `3px solid ${color}` }}>
      <p style={{ ...TEXT.kicker, color: COLORS.muted }}>{item.label}</p>
      <p style={{ fontFamily: FONTS.mono, fontSize: 22, lineHeight: 1.2, color: COLORS.ink, margin: "0 0 4px" }}>{item.value}</p>
      <p style={{ ...TEXT.small, color: COLORS.secondary, margin: 0 }}>
        {item.classLabel}
        {item.effectLabel && <span style={{ color: item.effect ? EFFECT[item.effect] : COLORS.muted }}>{` · ${item.effectLabel}`}</span>}
      </p>
    </td>
  )
}

/**
 * The indicators as cards, two per row (QCT-KF-02): value, class, and whether it supports or
 * limits the result. Square corners; spacer cells instead of margins, which mail clients ignore.
 */
export function IndicatorCards({ items }: { items: IndicatorItem[] }) {
  const rows: IndicatorItem[][] = []
  for (let index = 0; index < items.length; index += 2) rows.push(items.slice(index, index + 2))
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 14px" }}>
      <tbody>
        {rows.map((row, index) => [
          index > 0 && (
            <tr key={`gap-${index}`}>
              <td colSpan={3} height={8} style={{ height: 8, fontSize: 0, lineHeight: 0 }} />
            </tr>
          ),
          <tr key={`row-${index}`}>
            {cardCell(row[0])}
            <td width="2%" style={{ width: "2%" }} />
            {row[1] ? cardCell(row[1]) : <td width="49%" style={{ width: "49%" }} />}
          </tr>,
        ])}
      </tbody>
    </table>
  )
}
