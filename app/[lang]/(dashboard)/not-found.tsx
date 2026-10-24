import Link from "next/link"
import { lang } from "next/root-params"

import { NotFoundView } from "@/components/not-found/not-found-view"
import { Button } from "@/components/ui/button"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locales"

/** Localized 404 for `notFound()` in dashboard routes (e.g. an unknown step). */
export default async function DashboardNotFound() {
  const value = await lang()
  const locale = isLocale(value) ? value : DEFAULT_LOCALE
  const common = await getDictionary(locale, "common")

  return (
    <div className="flex min-h-dvh flex-col">
      <NotFoundView copy={common.notFound}>
        <Button asChild variant="secondary">
          <Link href={`/${locale}/dashboard`}>{common.notFound.home}</Link>
        </Button>
      </NotFoundView>
    </div>
  )
}
