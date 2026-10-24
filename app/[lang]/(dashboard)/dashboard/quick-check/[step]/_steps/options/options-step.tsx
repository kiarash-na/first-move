"use client"

import { fieldsOf, getGroup, type BooleanField as BooleanFieldDef, type FieldDef } from "@/lib/project"
import { formatEnergy, formatQuantity } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import type { QuickCheckRun } from "@/lib/quick-check"
import { BooleanField } from "./boolean-field"
import { isNumberField, NumberField } from "../../../../_components/fields/number-field"
import { useDictionary, useLocale, useTextRef } from "../../../../_components/i18n-provider"
import { useQuickCheck } from "../../../../_components/use-quick-check"

const FIELDS = fieldsOf({ module: "quickCheck", step: "options" })
const DEMAND_GROUP = getGroup("quickCheck.manualDemand")!
const DEMAND_FIELDS = FIELDS.filter((field) => field.group === DEMAND_GROUP.id).filter(isNumberField)
const OTHER_FIELDS = FIELDS.filter((field) => field.group !== DEMAND_GROUP.id)

/** The estimate a manual value replaces (QCT-IN-05, QCT-IN-08), when the result has it. */
function estimateOf(field: FieldDef, result: QuickCheckRun | null, lang: Locale): string | null {
  if (result?.status !== "complete") return null
  const { values } = result
  if (field.id === "quickCheck.manualDemand.heatingKwhPerYear") return formatEnergy(values.estimatedHeatingDemandKwh, lang, { perYear: true })
  if (field.id === "quickCheck.manualDemand.coolingKwhPerYear") return formatEnergy(values.estimatedCoolingDemandKwh, lang, { perYear: true })
  if (field.id === "quickCheck.networkLengthM") return formatQuantity(values.estimatedNetworkLengthM, "m", lang, { maximumFractionDigits: 0 })
  return null
}

/** Step 4, options: known demand totals, a known network length and PV (QCT-IN-05, 08, 09). */
export function OptionsStep() {
  const lang = useLocale()
  const text = useTextRef()
  const copy = useDictionary("quick-check").ui.field
  const { result } = useQuickCheck()

  const numberField = (field: FieldDef) => {
    if (!isNumberField(field)) return null
    const estimate = estimateOf(field, result, lang)
    return (
      <NumberField
        key={field.id}
        field={field}
        placeholder={copy.optional}
        hint={estimate ? interpolate(copy.estimate, { value: estimate }) : copy.estimated}
      />
    )
  }

  return (
    <div data-slot="options-step" className="flex flex-col gap-6">
      <section aria-labelledby="manual-demand" className="flex flex-col gap-5 border bg-card p-[clamp(20px,3vw,32px)]">
        <div className="flex max-w-[64ch] flex-col gap-1.5">
          <h2 id="manual-demand" className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
            {text(DEMAND_GROUP.text)}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{text(DEMAND_GROUP.text, "help")}</p>
        </div>
        <div className="grid gap-x-8 gap-y-6 @xl:grid-cols-2">{DEMAND_FIELDS.map(numberField)}</div>
      </section>
      <section className="flex flex-col divide-y border bg-card">
        {OTHER_FIELDS.map((field) =>
          field.kind === "boolean" ? (
            <BooleanField key={field.id} field={field as BooleanFieldDef} className="p-[clamp(20px,3vw,32px)]" />
          ) : (
            <div key={field.id} className="p-[clamp(20px,3vw,32px)]">
              <div className="@xl:w-1/2 @xl:pr-4">{numberField(field)}</div>
            </div>
          ),
        )}
      </section>
    </div>
  )
}
