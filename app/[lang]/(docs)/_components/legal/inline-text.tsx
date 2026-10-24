import Link from "next/link"

import { interpolate } from "@/lib/legal/interpolate"
import { tokenizeInline } from "@/lib/legal/inline"
import type { Locale } from "@/lib/i18n/locales"
import { withLocale } from "@/lib/i18n/locale-path"

const LINK = "text-foreground underline decoration-1 underline-offset-4 hover:text-cool"

/**
 * One line of legal text: `{{tokens}}` resolved, then bold, code and links drawn as elements.
 * Text is never parsed as HTML, so angle brackets in a dictionary stay visible text.
 */
export function InlineText({ text, lang }: { text: string; lang: Locale }) {
  return (
    <>
      {tokenizeInline(interpolate(text, lang)).map((token, index) => {
        switch (token.type) {
          case "strong":
            return <strong key={index} className="font-semibold text-foreground">{token.value}</strong>
          case "code":
            return (
              <code key={index} className="bg-muted px-1 py-0.5 font-mono text-[0.875em] text-foreground">
                {token.value}
              </code>
            )
          case "link":
            return token.kind === "internal" ? (
              <Link key={index} href={withLocale(token.href, lang)} className={LINK}>
                {token.label}
              </Link>
            ) : (
              <a key={index} href={token.href} className={LINK} rel={token.kind === "external" ? "noopener noreferrer" : undefined}>
                {token.label}
              </a>
            )
          default:
            return token.value
        }
      })}
    </>
  )
}
