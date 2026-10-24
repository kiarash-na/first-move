import type { Metadata } from "next"

import { getDictionary } from "@/lib/i18n/get-dictionary"
import { withLocale } from "@/lib/i18n/locale-path"
import { requireLocale } from "@/lib/i18n/require-locale"
import { ConfirmForm } from "./_components/confirm-form"

export async function generateMetadata({ params }: PageProps<"/[lang]/mail/confirm">): Promise<Metadata> {
  const mail = await getDictionary(requireLocale((await params).lang), "mail")
  return { title: mail.confirm.title, robots: { index: false, follow: false } }
}

/**
 * The consent page behind the confirm email's link (PLAN-AGENT-06 step 8, D-54). A static shell:
 * the token stays in the fragment and only the form reads it, after mount.
 */
export default async function MailConfirmPage({ params }: PageProps<"/[lang]/mail/confirm">) {
  const lang = requireLocale((await params).lang)
  const mail = await getDictionary(lang, "mail")

  return (
    <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-8 px-[clamp(20px,3.2vw,52px)] py-12 sm:py-15">
      <header className="flex flex-col items-start gap-5">
        <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{mail.sender.name}</p>
        <h1 className="max-w-[24ch] text-[clamp(25px,3vw,35px)] leading-[1.1] font-[560] tracking-[-0.04em] [font-stretch:84%]">
          {mail.confirm.title}
        </h1>
        <p className="max-w-[68ch] text-lg leading-relaxed text-text-secondary">{mail.confirm.lead}</p>
      </header>
      <ConfirmForm copy={mail.confirm} termsHref={withLocale("/terms", lang)} />
    </main>
  )
}
