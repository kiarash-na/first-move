import type { Accent, Block } from "../model"
import { BulletList } from "./bullet-list"
import { CalcNotes } from "./calc-notes"
import { IndicatorCards } from "./indicator-cards"
import { LinkButton } from "./link-button"
import { OptionList } from "./option-list"
import { Paragraph } from "./paragraph"
import { QuestionList } from "./question-list"
import { ValueRows } from "./value-rows"
import { VerdictBanner } from "./verdict-banner"

/** One block of a section, by its type. */
export function MessageBlock({ block, accent }: { block: Block; accent: Accent }) {
  switch (block.type) {
    case "text":
      return <Paragraph text={block.text} tone={block.tone} />
    case "bullets":
      return <BulletList items={block.items} accent={accent} />
    case "questions":
      return <QuestionList items={block.items} accent={accent} />
    case "options":
      return <OptionList items={block.items} />
    case "rows":
      return <ValueRows title={block.title} rows={block.rows} />
    case "verdict":
      return <VerdictBanner level={block.level} label={block.label} description={block.description} badge={block.badge} />
    case "indicators":
      return <IndicatorCards items={block.items} />
    case "button":
      return <LinkButton label={block.label} href={block.href} hint={block.hint} />
    case "notes":
      return <CalcNotes items={block.items} />
  }
}
