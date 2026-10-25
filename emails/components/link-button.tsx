import { COLORS, FONTS, TEXT } from "../theme"

/**
 * A square, solid ink button that is a plain link (the confirm link, D-54), and, for clients that
 * hide buttons, the hint with the full address below it. Only `https:` links render.
 */
export function LinkButton({ label, href, hint }: { label: string; href: string; hint?: string }) {
  return (
    <>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "4px 0 16px" }}>
        <tbody>
          <tr>
            <td style={{ background: COLORS.ink, border: `1px solid ${COLORS.ink}` }}>
              <a href={href} style={{ display: "inline-block", padding: "12px 22px", fontFamily: FONTS.sans, fontSize: 15, fontWeight: 600, color: COLORS.paper, textDecoration: "none" }}>
                {label}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      {hint && (
        <p style={{ ...TEXT.small }} aria-hidden="true">
          {hint}
          <br />
          <a href={href} style={{ color: COLORS.cool, wordBreak: "break-all" }}>
            {href}
          </a>
        </p>
      )}
    </>
  )
}
