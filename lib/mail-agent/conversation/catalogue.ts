import "server-only"
import { fieldCatalogue, type CatalogueField, type FieldCatalogue } from "@/lib/ai/extract/field-catalogue"
import { fieldLabel } from "@/lib/ai/extract/field-label"
import { getField, QUICK_CHECK_STEPS, type BusinessPlanStep } from "@/lib/project"
import type { MailTexts } from "./texts"

/** The project name is a project field, not a module input; the email agent asks for it with the Quick Check. */
function projectName(t: MailTexts): CatalogueField {
  const field = getField("meta.name")!
  return {
    id: field.id,
    fieldId: field.id,
    module: "quickCheck",
    step: field.step,
    section: t.mail.conversation.questions.titleQuickCheck,
    label: fieldLabel(field, t.texts),
    kind: "text",
    maxLength: field.kind === "text" ? field.maxLength : 120,
    required: false,
    requirements: field.requirements,
  }
}

/**
 * What the extractor may fill for the Quick Check (PLAN-AGENT-07 step 8): every input of its four
 * steps (not the parameter playground) and the project name, labelled in the email's language.
 */
export function quickCheckCatalogue(t: MailTexts): FieldCatalogue {
  const catalogue = fieldCatalogue({ modules: ["quickCheck"], steps: QUICK_CHECK_STEPS }, t.locale, t.texts)
  return { ...catalogue, fields: [projectName(t), ...catalogue.fields] }
}

/** What the extractor may fill for the Business Plan: the given steps' fields, in the person's own words (D-27). */
export function businessPlanCatalogue(t: MailTexts, steps: readonly BusinessPlanStep[]): FieldCatalogue {
  return fieldCatalogue({ modules: ["businessPlan"], steps }, t.locale, t.texts)
}

/** The fields one email may fill: the Quick Check's, and the Business Plan steps in play. */
export interface ExtractScope {
  quickCheck: boolean
  bpSteps: readonly BusinessPlanStep[]
}

export function scopeCatalogue(scope: ExtractScope, t: MailTexts): FieldCatalogue {
  const fields = [...(scope.quickCheck ? quickCheckCatalogue(t).fields : []), ...(scope.bpSteps.length ? businessPlanCatalogue(t, scope.bpSteps).fields : [])]
  return { lang: t.locale, fields }
}
