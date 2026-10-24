import { FIRST_MOVE_SCOPE, languageRule } from "../prompts/scope"
import { UNTRUSTED_RULE, untrustedDocument, untrustedEmail } from "../prompts/untrusted"
import type { CatalogueField, FieldCatalogue } from "./field-catalogue"

function range(field: CatalogueField): string {
  const low = field.exclusiveMin !== undefined ? `> ${field.exclusiveMin}` : field.min !== undefined ? `${field.min}` : null
  if (low === null && field.max === undefined) return ""
  if (low?.startsWith(">")) return `, ${low}, at most ${field.max}`
  return `, ${low ?? "any"} to ${field.max}`
}

/** How a field's value is written, for the model. */
function kindOf(field: CatalogueField): string {
  const unit = field.unit ? ` in ${field.unit}` : ""
  switch (field.kind) {
    case "integer":
      return `whole number${unit}${range(field)}`
    case "number":
      return `number${unit}${range(field)}`
    case "percent":
      return `percent as written (35 % is 35)${range(field)}`
    case "boolean":
      return "true or false"
    case "choice":
      return `one of: ${(field.options ?? []).map((option) => `${option.value} (${option.label})`).join(", ")}`
    case "textList":
      return `list: one value per entry, each at most ${field.maxLength} characters, at most ${field.maxItems} entries`
    default: {
      const text = field.kind === "longText" ? "text" : "one line of text"
      const rows = field.property ? `; a property of new rows, give each row an item number (1, 2, …), at most ${field.maxItems} rows` : ""
      return `${text}, at most ${field.maxLength} characters${rows}`
    }
  }
}

/** The catalogue as a compact list, by section and group, for the system prompt. */
export function catalogueBlock(catalogue: FieldCatalogue): string {
  const lines: string[] = []
  let section = ""
  let group = ""
  for (const field of catalogue.fields) {
    if (field.section !== section) {
      section = field.section
      group = ""
      lines.push("", `## ${section}`)
    }
    if (field.group && field.group.id !== group) {
      group = field.group.id
      lines.push(`Group "${field.group.label}"${field.group.help ? `: ${field.group.help}` : ""}`)
    }
    const help = field.help ? ` — ${field.help}` : ""
    lines.push(`- ${field.id} | ${field.label} | ${kindOf(field)}${field.required ? " | required" : ""}${help}`)
  }
  return lines.join("\n").trim()
}

/**
 * The system prompt for reading documents into field values (PLAN-AGENT-03 step 4): role, the
 * First Move scope, documents as untrusted data, only what the documents say, a quote for every
 * value, the output rules and the field catalogue. Written for the catalogue's language.
 */
export function extractionInstructions(catalogue: FieldCatalogue): string {
  return [
    "You read documents and find the values of First Move project fields in them.",
    FIRST_MOVE_SCOPE,
    UNTRUSTED_RULE,
    "",
    "Rules:",
    "- Use only what the documents state. Never estimate, calculate, assume or fill a value from general knowledge.",
    "- Return every value with a short verbatim quote from the document that states it, the document name in `file`, and the page in `page` when the text shows [page N] markers.",
    "- Use only the field ids listed below. Return numbers as JSON numbers. When the document uses another unit than the field, give the number as written and its unit in `unit`.",
    "- For choice fields return the option key. For list fields return one value per entry. For properties of new rows give the same item number to all properties of one row.",
    "- When a document is unclear, contradicts itself or gives only part of a value, add it to `unclear` with a short reason instead of guessing.",
    "- Return nothing for fields the documents do not mention.",
    `- ${languageRule(catalogue.lang)} This applies to \`unclear\`; quotes stay in the document's language.`,
    "",
    "Fields:",
    catalogueBlock(catalogue),
  ].join("\n")
}

export interface ExtractionContext {
  /** The in-app user's own message: their words, so it stays outside the untrusted blocks. */
  request?: string
  /** An email's text (email agent): from outside, so it goes in as an untrusted block. */
  email?: string
}

/** The user message: the in-app request, then the email and each document as untrusted blocks. */
export function extractionRequest(documents: readonly { name: string; text: string }[], { request, email }: ExtractionContext = {}): string {
  return [
    ...(request?.trim() ? [request.trim()] : []),
    ...(email?.trim() ? [untrustedEmail(email.trim())] : []),
    ...documents.map((document) => untrustedDocument(document.name, document.text)),
  ].join("\n\n")
}
