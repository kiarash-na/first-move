import "server-only"
import type { MailMessage, Section } from "@/emails/model"
import { renderMessage } from "@/emails/render/message"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/locales"
import { OPERATOR } from "@/lib/legal/operator"
import type { MailAgentConfig } from "../env"
import type { OutgoingReply, ReplyAttachment } from "./send"

/** The site page in the email's language: `${SITE_URL}/de/terms`. */
export const sitePage = (config: Pick<MailAgentConfig, "siteUrl">, locale: Locale, path = "") => `${config.siteUrl}/${locale}${path}`

export interface ComposeOptions {
  /** The hidden preview line; the first section's title or kicker when left out. */
  preheader?: string
  /** Conversation emails say how to start over or stop; notices do not. */
  commands?: boolean
}

/**
 * A whole email around the given sections (PLAN-AGENT-07 step 10): brand, greeting, sign-off and
 * the footer with the AI disclosure, human@, the Terms and the Privacy Policy, all in the
 * sender's language (DE falls back to EN per text, D-32).
 */
export async function composeMessage(config: Pick<MailAgentConfig, "siteUrl">, locale: Locale, sections: Section[], options: ComposeOptions = {}): Promise<MailMessage> {
  const { layout } = await getDictionary(locale, "mail")
  const first = sections[0]
  return {
    locale,
    title: layout.brand,
    preheader: options.preheader ?? first?.title ?? first?.kicker ?? layout.brand,
    brand: layout.brand,
    tagline: layout.tagline,
    greeting: layout.greeting,
    sections,
    signoff: layout.signoff,
    footer: {
      ai: layout.ai,
      human: layout.human,
      humanAddress: OPERATOR.emailHuman,
      links: [
        { label: layout.terms, href: sitePage(config, locale, "/terms") },
        { label: layout.privacy, href: sitePage(config, locale, "/privacy") },
      ],
      ...(options.commands && { commands: layout.commands }),
    },
  }
}

/** The reply for these sections, rendered to HTML and plain text, with an optional file. */
export async function composeReply(
  config: Pick<MailAgentConfig, "siteUrl">,
  locale: Locale,
  kind: string,
  sections: Section[],
  options: ComposeOptions & { attachment?: ReplyAttachment } = {},
): Promise<OutgoingReply> {
  const { html, text } = renderMessage(await composeMessage(config, locale, sections, options))
  return { kind, text, html, ...(options.attachment && { attachments: [options.attachment] }) }
}
