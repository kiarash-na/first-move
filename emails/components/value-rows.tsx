import { Fragment } from "react"
import type { ValueRow } from "../model"
import { COLORS, FONTS, TEXT } from "../theme"

/**
 * Labels and values in two columns, 1px rules between rows: the values the agent understood, the
 * inputs a result used, key figures. A row in the `hot` tone (a risk) is marked in orange.
 */
export function ValueRows({ title, rows }: { title?: string; rows: ValueRow[] }) {
  return (
    <>
      {title && <h3 style={{ ...TEXT.kicker, color: COLORS.muted, margin: "4px 0 6px", fontWeight: 400 }}>{title}</h3>}
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 16px", borderTop: `1px solid ${COLORS.line}` }}>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td
                valign="top"
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 14,
                  lineHeight: 1.45,
                  color: COLORS.secondary,
                  padding: "8px 12px 8px 0",
                  borderBottom: `1px solid ${COLORS.line}`,
                  borderLeft: row.tone === "hot" ? `3px solid ${COLORS.hot}` : undefined,
                  paddingLeft: row.tone === "hot" ? 8 : 0,
                }}
              >
                {row.label}
                {row.note && (
                  <Fragment>
                    <br />
                    <span style={{ fontSize: 12, color: COLORS.muted }}>{row.note}</span>
                  </Fragment>
                )}
              </td>
              <td valign="top" style={{ ...TEXT.mono, color: row.tone === "hot" ? COLORS.hot : COLORS.ink, textAlign: "right", padding: "8px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
