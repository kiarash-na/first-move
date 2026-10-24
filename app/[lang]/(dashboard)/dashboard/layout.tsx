import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { DashboardShell } from "./_components/dashboard-shell"
import { I18nProvider } from "./_components/i18n-provider"

/**
 * The dashboard frame for every `/[lang]/dashboard/*` route (PLAN-DASH-07): loads the shared
 * dictionary areas on the server and hands them to the client shell. The shell is static;
 * project data is read on the client only.
 */
export default async function DashboardLayout({ children, params }: LayoutProps<"/[lang]/dashboard">) {
  const lang = requireLocale((await params).lang)
  const [common, shell, calc, quickCheck, businessPlan] = await Promise.all([
    getDictionary(lang, "common"),
    getDictionary(lang, "shell"),
    getDictionary(lang, "calc"),
    getDictionary(lang, "quick-check"),
    getDictionary(lang, "business-plan"),
  ])

  return (
    <I18nProvider lang={lang} dictionaries={{ common, shell, calc, "quick-check": quickCheck, "business-plan": businessPlan }}>
      <DashboardShell>{children}</DashboardShell>
    </I18nProvider>
  )
}
