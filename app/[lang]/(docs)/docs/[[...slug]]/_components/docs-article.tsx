import type { DocSlug } from "@/lib/docs/pages"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { Locale } from "@/lib/i18n/locales"
import { loadDocContent } from "./doc-content"
import { DocsPager } from "./docs-pager"
import { docsMdxComponents } from "./mdx/docs-mdx-components"

/**
 * One docs page: the MDX content and the pager. A German route shows the English page with a
 * note, and the content carries `lang="en"` (D-32).
 */
export async function DocsArticle({ slug, lang, copy, live }: { slug: DocSlug; lang: Locale; copy: Dictionary<"docs">; live: boolean }) {
  const { Content, lang: shown } = await loadDocContent(slug, lang)
  const fallback = shown !== lang

  return (
    <div className="flex min-w-0 flex-col gap-12">
      <article className="flex min-w-0 flex-col items-start gap-5">
        {fallback ? (
          <p role="note" className="max-w-[68ch] border-l-2 border-hot bg-panel px-4 py-3 text-base leading-relaxed text-foreground">
            {copy.page.englishOnly}
          </p>
        ) : null}
        <div lang={fallback ? shown : undefined} className="flex min-w-0 flex-col items-start gap-4">
          <Content components={docsMdxComponents({ lang, live })} />
        </div>
      </article>
      <DocsPager lang={lang} slug={slug} copy={copy} live={live} />
    </div>
  )
}
