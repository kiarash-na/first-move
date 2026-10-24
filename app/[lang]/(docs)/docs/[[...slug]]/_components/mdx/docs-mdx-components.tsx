import type { MDXComponents } from "mdx/types"
import type * as React from "react"

import type { Locale } from "@/lib/i18n/locales"
import { AiOnly } from "./ai-only"
import { MdxCode } from "./mdx-code"
import { MdxH1 } from "./mdx-h1"
import { MdxH2 } from "./mdx-h2"
import { MdxLink } from "./mdx-link"
import { MdxList } from "./mdx-list"
import { MdxNote } from "./mdx-note"
import { MdxOrderedList } from "./mdx-ordered-list"
import { MdxParagraph } from "./mdx-paragraph"
import { MdxStrong } from "./mdx-strong"

/**
 * The elements a docs page may use, passed to the page's MDX content (MDX guide, "Local styles
 * and components"). Links open in the page's language; `<AiOnly>` follows the AI switch.
 */
export function docsMdxComponents({ lang, live }: { lang: Locale; live: boolean }): MDXComponents {
  function DocsLink({ href, children }: React.ComponentProps<"a">) {
    return (
      <MdxLink href={href} lang={lang}>
        {children}
      </MdxLink>
    )
  }

  function DocsAiOnly({ children }: { children?: React.ReactNode }) {
    return <AiOnly live={live}>{children}</AiOnly>
  }

  return {
    h1: MdxH1,
    h2: MdxH2,
    p: MdxParagraph,
    ul: MdxList,
    ol: MdxOrderedList,
    a: DocsLink,
    blockquote: MdxNote,
    code: MdxCode,
    strong: MdxStrong,
    AiOnly: DocsAiOnly,
  }
}
