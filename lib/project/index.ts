/**
 * The project model (PLAN-DASH-03): schema, field registry, `createProject`, `applyPatch`,
 * migrations and the JSON Schema contract. Pure TypeScript, no React, no storage.
 */
export { applyPatch, type ApplyPatchOptions, type PatchResult, type ProjectPatch } from "./apply-patch"
export * from "./catalog"
export { clearPatch } from "./clear-patch"
export { groupRuleStatus, type GroupRuleStatus } from "./completeness/group-rule"
export { inputStatus, type InputStatus } from "./completeness/input-status"
export { createListItem } from "./create-list-item"
export { createProject, type CreateProjectOptions } from "./create-project"
export { emptyValue } from "./empty-value"
export * from "./fields"
export { projectJsonSchema } from "./json-schema"
export * from "./migrations"
export { getAt, parsePath } from "./path"
export { PATCH_ERROR_CODES, type PatchError, type PatchErrorCode } from "./patch-errors"
export * from "./schema"
export { METHODOLOGY_VERSION, SCHEMA_VERSION } from "./versions"
