"use client"

import { fieldsOf } from "@/lib/project"
import { isNumberField, NumberField } from "../../../../_components/fields/number-field"
import { DensityPreview } from "./density-preview"

const AREA_FIELDS = fieldsOf({ module: "quickCheck", step: "area" }).filter(isNumberField)

/** Step 1, project area: QCT-IN-01 and QCT-IN-02 from the registry, then the derived density (QCT-IN-03). */
export function AreaStep() {
  return (
    <div data-slot="area-step" className="flex flex-col gap-8">
      <section className="grid gap-x-8 gap-y-7 border bg-card p-[clamp(20px,3vw,32px)] @xl:grid-cols-2">
        {AREA_FIELDS.map((field) => (
          <NumberField key={field.id} field={field} />
        ))}
      </section>
      <DensityPreview />
    </div>
  )
}
