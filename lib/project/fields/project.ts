import { fieldText, trace } from "./define"
import { TEXT_LIMITS } from "./limits"
import type { FieldDef, FieldGroup } from "./types"

/**
 * Project-level inputs: the name and the module switches (start screen, project menu).
 * System fields (`meta.id`, timestamps, versions, `exampleId`) are not inputs and cannot be
 * patched. Labels: `shell` dictionary.
 */
const AREA = "shell"
const MODULE = "project"

export const PROJECT_FIELDS: readonly FieldDef[] = [
  {
    id: "meta.name",
    module: MODULE,
    step: "project",
    kind: "text",
    maxLength: TEXT_LIMITS.name,
    text: fieldText(AREA, "meta.name"),
    nullable: false,
    required: false,
    alsoShownIn: [],
    ...trace({ decisions: ["D-02"] }),
  },
  {
    id: "meta.modules.quickCheck",
    module: MODULE,
    step: "project",
    kind: "boolean",
    text: fieldText(AREA, "meta.modules.quickCheck"),
    nullable: false,
    required: false,
    group: "meta.modules",
    alsoShownIn: [],
    ...trace({ decisions: ["D-01", "D-03"] }),
  },
  {
    id: "meta.modules.businessPlan",
    module: MODULE,
    step: "project",
    kind: "boolean",
    text: fieldText(AREA, "meta.modules.businessPlan"),
    nullable: false,
    required: false,
    group: "meta.modules",
    alsoShownIn: [],
    ...trace({ decisions: ["D-01", "D-03"] }),
  },
]

export const PROJECT_GROUPS: readonly FieldGroup[] = [
  {
    id: "meta.modules",
    module: MODULE,
    step: "project",
    layout: "section",
    text: fieldText(AREA, "meta.modules"),
    // "At least one module" is a schema rule: `applyPatch` rejects turning off the last one.
    ...trace({ decisions: ["D-01"] }),
  },
]
