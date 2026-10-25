import { BrandHeader } from "./components/brand-header"
import { EmailFooter } from "./components/email-footer"
import { EmailLayout } from "./components/email-layout"
import { MessageSection } from "./components/message-section"
import { Paragraph } from "./components/paragraph"
import type { MailMessage } from "./model"

/**
 * The one template of the email agent (PLAN-AGENT-07 step 10): the greeting, the sections of this
 * reply (notice, menu, answer, questions, progress, results…), the sign-off, and the footer.
 */
export function MessageEmail({ message }: { message: MailMessage }) {
  return (
    <EmailLayout
      lang={message.locale}
      title={message.title}
      preheader={message.preheader}
      header={<BrandHeader brand={message.brand} tagline={message.tagline} />}
      footer={<EmailFooter footer={message.footer} />}
    >
      <Paragraph text={message.greeting} />
      {message.sections.map((section, index) => (
        <MessageSection key={index} section={section} />
      ))}
      <Paragraph text={message.signoff} tone="muted" />
    </EmailLayout>
  )
}
