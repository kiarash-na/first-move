import Link from "next/link"
import { lang } from "next/root-params"

import { NotFoundView } from "@/components/not-found/not-found-view"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales"

/** Localized 404 for `notFound()` in docs routes (unknown slug). */
export default async function DocsNotFound() {
  const value = await lang()
  const locale = isLocale(value) ? value : DEFAULT_LOCALE
  const common = await getDictionary(locale, "common")

  return (
    <NotFoundView copy={common.notFound}>
      <Button asChild variant="secondary">
        <Link href={`/${locale}/docs`}>{common.notFound.home}</Link>
      </Button>
    </NotFoundView>
  )
}
