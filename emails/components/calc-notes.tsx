import type { CalcNote } from "../model"
import { COLORS, FONTS, TEXT } from "../theme"

/**
 * "How we calculate" (D-33) in an email: there is nothing to collapse, so each result gets one
 * sunken panel with its sentence and the equations of the methodology it uses, by ID and name.
 */
export function CalcNotes({ items }: { items: CalcNote[] }) {
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 16px", background: COLORS.sunken, border: `1px solid ${COLORS.line}` }}>
      <tbody>
        {items.map((note, index) => (
          <tr key={index}>
            <td style={{ padding: "12px 14px", borderTop: index > 0 ? `1px solid ${COLORS.line}` : undefined }}>
              <p style={{ ...TEXT.body, fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{note.title}</p>
              <p style={{ ...TEXT.small, color: COLORS.secondary, margin: "0 0 6px" }}>{note.text}</p>
              <p style={{ fontFamily: FONTS.mono, fontSize: 12, lineHeight: 1.5, color: COLORS.muted, margin: 0 }}>{note.formulas.join(" · ")}</p>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
