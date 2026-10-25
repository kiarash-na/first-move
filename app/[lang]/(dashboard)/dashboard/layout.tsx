import { getDictionary } from "@/lib/i18n/get-dictionary"
import { requireLocale } from "@/lib/i18n/require-locale"
import { AI_FEATURES_LIVE } from "@/lib/legal/ai"
import { DashboardShell } from "./_components/dashboard-shell"
import { I18nProvider } from "./_components/i18n-provider"

/**
 * The dashboard frame for every `/[lang]/dashboard/*` route (PLAN-DASH-07): loads the shared
 * dictionary areas on the server and hands them to the client shell. The shell is static;
 * project data is read on the client only. The `assistant` area comes along only while the AI
 * assistant is live (PLAN-AGENT-00 touch point), so nothing changes while it is dark.
 */
export default async function DashboardLayout({ children, params }: LayoutProps<"/[lang]/dashboard">) {
  const lang = requireLocale((await params).lang)
  const [common, shell, calc, quickCheck, businessPlan, assistant] = await Promise.all([
    getDictionary(lang, "common"),
    getDictionary(lang, "shell"),
    getDictionary(lang, "calc"),
    getDictionary(lang, "quick-check"),
    getDictionary(lang, "business-plan"),
    AI_FEATURES_LIVE ? getDictionary(lang, "assistant") : null,
  ])

  return (
    <I18nProvider lang={lang} dictionaries={{ common, shell, calc, "quick-check": quickCheck, "business-plan": businessPlan, ...(assistant && { assistant }) }}>
      <DashboardShell>{children}</DashboardShell>
    </I18nProvider>
  )
}
