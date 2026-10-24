/**
 * Browser storage and data safety (PLAN-DASH-04, D-11..D-14): IndexedDB with a localStorage mirror,
 * snapshots, recovery, tab sync, unload guard, export reminder, file link, export and import.
 * Nothing here talks to a network. The UI uses it through `@/lib/store`.
 */
export { downloadFile } from "./download"
export { buildExport, buildExportEnvelope, EXPORT_FORMAT, EXPORT_FORMAT_VERSION, type ExportEnvelope, type ExportFile } from "./export"
export { FILE_LINK_ERROR_CODES, isFileLinkSupported, type FileLinkErrorCode } from "./file-link"
export { EXPORT_EXTENSION, exportFileName } from "./file-name"
export { IMPORT_ERROR_CODES, parseImportText, readImportFile, type ImportErrorCode, type ImportFailure, type ImportFieldError, type ImportResult, type ImportSuccess } from "./import"
export * from "./keys"
export * from "./limits"
export { STORAGE_WARNINGS, type StorageHealth, type StorageWarning } from "./persist"
export { SAVE_ERROR_CODES, type SaveErrorCode } from "./save-error"
export { SNAPSHOT_REASONS, type SnapshotInfo, type SnapshotReason, type StorageMode } from "./types"
