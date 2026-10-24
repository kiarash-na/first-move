/**
 * The project model (PLAN-DASH-03): schema, field registry, `createProject`, `applyPatch`,
 * migrations. Pure TypeScript, no React, no storage. The JSON Schema contract for agents is
 * imported from `./json-schema` directly, so `z.toJSONSchema` callers stay out of the client graph.
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
export * from "./migrations"
export { getAt, parsePath } from "./path"
export { PATCH_ERROR_CODES, type PatchError, type PatchErrorCode } from "./patch-errors"
export * from "./schema"
export { METHODOLOGY_VERSION, SCHEMA_VERSION } from "./versions"
