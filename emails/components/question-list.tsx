import { Fragment } from "react"
import type { Accent, Question } from "../model"
import { ACCENTS, COLORS, FONTS, TEXT } from "../theme"

/**
 * Numbered questions (PLAN-AGENT-07 step 7): the number in the accent, the question, and its
 * examples and options as small lines below. One table per question, so the plain-text version
 * keeps each question with its hints.
 */
export function QuestionList({ items, accent }: { items: Question[]; accent: Accent }) {
  return (
    <>
      {items.map((question) => (
        <table key={question.number} role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse", margin: "0 0 14px" }}>
          <tbody>
            <tr>
              <td valign="top" width={32} style={{ ...TEXT.mono, color: ACCENTS[accent], fontWeight: 600, paddingTop: 2, width: 32 }}>
                {`${question.number}.`}
              </td>
              <td valign="top" style={{ ...TEXT.body, margin: 0 }}>
                {question.text}
                {question.optional && <span style={{ color: COLORS.muted, fontSize: 13 }}>{` (${question.optional})`}</span>}
                {question.hints.map((hint, index) => (
                  <Fragment key={index}>
                    <br />
                    <span style={{ fontFamily: FONTS.sans, fontSize: 13, lineHeight: 1.5, color: COLORS.muted }}>{hint}</span>
                  </Fragment>
                ))}
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </>
  )
}
