import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Locale } from "@/lib/i18n/locales"
import { parseBlocks } from "@/lib/legal/parse-blocks"
import { InlineText } from "./inline-text"

const TEXT = "max-w-[68ch] text-base leading-relaxed text-text-secondary"

/** The body of one section: paragraphs, lists, notes and tables from the lines of the dictionary. */
export function LegalBlocks({ body, lang, label }: { body: readonly string[]; lang: Locale; label: string }) {
  return (
    <>
      {parseBlocks(body).map((block, index) => {
        switch (block.type) {
          case "ul":
            return (
              <ul key={index} className={`${TEXT} list-disc space-y-2 pl-6 marker:text-muted-foreground`}>
                {block.items.map((item, i) => (
                  <li key={i}><InlineText text={item} lang={lang} /></li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={index} className={`${TEXT} list-decimal space-y-2 pl-6 marker:text-muted-foreground`}>
                {block.items.map((item, i) => (
                  <li key={i}><InlineText text={item} lang={lang} /></li>
                ))}
              </ol>
            )
          case "note":
            return (
              <p key={index} role="note" className={`${TEXT} border-l-2 border-hot bg-panel px-4 py-3 text-foreground`}>
                <InlineText text={block.text} lang={lang} />
              </p>
            )
          case "table":
            return (
              <Table key={index} scrollLabel={label} className="min-w-[36rem] text-sm">
                <TableHeader>
                  <TableRow>
                    {block.head.map((cell, i) => (
                      <TableHead key={i} scope="col">
                        <InlineText text={cell} lang={lang} />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.rows.map((row, r) => (
                    <TableRow key={r}>
                      {row.map((cell, c) => (
                        <TableCell key={c} className="min-w-40 align-top leading-relaxed whitespace-normal text-text-secondary">
                          <InlineText text={cell} lang={lang} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          default:
            return (
              <p key={index} className={TEXT}>
                <InlineText text={block.text} lang={lang} />
              </p>
            )
        }
      })}
    </>
  )
}
