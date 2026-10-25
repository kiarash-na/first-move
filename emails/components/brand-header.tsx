import { COLORS, FONTS } from "../theme"

/**
 * The brand band (D-15, D-17): ink, the two logo nodes as small squares in cyan and orange, the
 * name and the tagline. Text and CSS only: no image, no remote URL.
 */
export function BrandHeader({ brand, tagline }: { brand: string; tagline: string }) {
  return (
    <td style={{ background: COLORS.ink, padding: "18px 24px" }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td aria-hidden="true" valign="middle" style={{ paddingRight: 10, fontSize: 0, lineHeight: 0 }}>
              <span style={{ display: "inline-block", width: 9, height: 9, background: COLORS.cyanNode }} />
              <span style={{ display: "inline-block", width: 6, height: 9 }} />
              <span style={{ display: "inline-block", width: 9, height: 9, background: COLORS.orangeNode }} />
            </td>
            <td valign="middle">
              <span style={{ fontFamily: FONTS.sans, fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: COLORS.paper }}>{brand}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.bandText, margin: "8px 0 0" }}>{tagline}</p>
    </td>
  )
}
