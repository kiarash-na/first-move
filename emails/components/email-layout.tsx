import type { ReactNode } from "react"
import { COLORS, FONTS, WIDTH } from "../theme"

/**
 * The document around every email: one 600px column on the paper colour, a hidden preview line,
 * the header row, the body and the footer row. Tables only, inline styles only, square corners,
 * light colours declared, so clients that force a dark mode have less to invert.
 */
export function EmailLayout({ lang, title, preheader, header, footer, children }: { lang: string; title: string; preheader: string; header: ReactNode; footer: ReactNode; children: ReactNode }) {
  return (
    <html lang={lang}>
      {/* eslint-disable-next-line @next/next/no-head-element -- an email document, rendered to a string, not a Next.js page */}
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: COLORS.paper, fontFamily: FONTS.sans, color: COLORS.ink }}>
        <div aria-hidden="true" style={{ display: "none", maxHeight: 0, overflow: "hidden", opacity: 0, fontSize: 1, lineHeight: 1, color: COLORS.paper }}>
          {preheader}
        </div>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", background: COLORS.paper }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: "24px 12px" }}>
                <table role="presentation" width={WIDTH} cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", width: "100%", maxWidth: WIDTH, background: COLORS.raised, border: `1px solid ${COLORS.line}` }}>
                  <tbody>
                    <tr>{header}</tr>
                    <tr>
                      <td style={{ padding: "24px 24px 4px", background: COLORS.raised }}>{children}</td>
                    </tr>
                    <tr>{footer}</tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
