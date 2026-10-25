import type { Section } from "../model"
import { ACCENTS, TEXT } from "../theme"
import { MessageBlock } from "./message-block"

/**
 * One part of an email (menu, questions, progress, results…): a 3px rule and a mono kicker in the
 * section's accent, an optional title, then its blocks.
 */
export function MessageSection({ section }: { section: Section }) {
  const color = ACCENTS[section.accent]
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 26px" }}>
      <tbody>
        <tr>
          <td style={{ borderTop: `3px solid ${color}`, paddingTop: 14 }}>
            <p style={{ ...TEXT.kicker, color }}>{section.kicker}</p>
            {section.title && <h2 style={{ ...TEXT.title }}>{section.title}</h2>}
            {section.blocks.map((block, index) => (
              <MessageBlock key={index} block={block} accent={section.accent} />
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
