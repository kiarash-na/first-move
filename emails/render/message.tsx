import "server-only"
import { MessageEmail } from "../message-email"
import type { MailMessage } from "../model"
import { renderEmail, type RenderedEmail } from "./email"

/** An agent email as HTML and plain text, from the same template. */
export function renderMessage(message: MailMessage): RenderedEmail {
  return renderEmail(<MessageEmail message={message} />)
}
