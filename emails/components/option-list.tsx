import { COLORS, FONTS, TEXT } from "../theme"

export interface Option {
  number: number
  label: string
  description: string
}

/** The menu's choices (PLAN-AGENT-07 step 6): a square number tile, the name and one line about it. */
export function OptionList({ items }: { items: Option[] }) {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 16px", border: `1px solid ${COLORS.line}` }}>
      <tbody>
        {items.map((option, index) => (
          <tr key={option.number}>
            <td
              valign="top"
              width={44}
              style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 600, color: COLORS.paper, background: COLORS.ink, textAlign: "center", padding: "12px 0", width: 44, borderTop: index > 0 ? `1px solid ${COLORS.lineStrong}` : undefined }}
            >
              {option.number}
            </td>
            <td valign="top" style={{ padding: "10px 14px", background: COLORS.raised, borderTop: index > 0 ? `1px solid ${COLORS.line}` : undefined }}>
              <strong style={{ ...TEXT.body, fontWeight: 600 }}>{option.label}</strong>
              <br />
              <span style={{ ...TEXT.small }}>{option.description}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
