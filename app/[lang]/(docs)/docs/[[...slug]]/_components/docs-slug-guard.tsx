import { notFound } from "next/navigation"

/**
 * Renders nothing for the docs index and a 404 for any slug (no content pages yet, D-22).
 * It reads the slug inside the page's `<Suspense>`, so the index stays URL-independent.
 */
export async function DocsSlugGuard({ params }: Pick<PageProps<"/[lang]/docs/[[...slug]]">, "params">) {
  const { slug } = await params
  if (slug?.length) notFound()
  return null
}
