#!/usr/bin/env node
/**
 * `node scripts/email-agent-on.mjs` switches the email agent on in `.env.local`
 * (`EMAIL_AGENT_ENABLED=true`); `--relay` also switches the human@ relay
 * (`EMAIL_HUMAN_RELAY_ENABLED=true`, its own switch per the A07 note). Idempotent: a line that
 * already says `true` is left alone, a missing line is appended. Prints the switch names and
 * their new state, never another variable and never a value. The same `true` goes to Vercel
 * Production, then redeploy (A07 note, checklist step 4).
 *
 * `scripts/email-agent-on.test.ts` covers `setSwitch`.
 */
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const ENV_FILE = path.join(ROOT, ".env.local")

/** Sets `name=value` in env-file content: replaces the existing line or appends. */
export function setSwitch(content, name, value) {
  const line = `${name}=${value}`
  const pattern = new RegExp(`^${name}=.*$`, "m")
  if (pattern.test(content)) return content.replace(pattern, line)
  return `${content.replace(/\s*$/, "")}\n${line}\n`
}

/** The state of one switch, for the report: `true`, `false` or `missing`. */
export function switchState(content, name) {
  const match = content.match(new RegExp(`^${name}=(.*)$`, "m"))
  if (!match) return "missing"
  return ["true", "1"].includes(match[1].trim().toLowerCase()) ? "true" : "false"
}

function main() {
  const relay = process.argv.includes("--relay")
  const names = ["EMAIL_AGENT_ENABLED", ...(relay ? ["EMAIL_HUMAN_RELAY_ENABLED"] : [])]
  let content = readFileSync(ENV_FILE, "utf8")
  const before = names.map((name) => switchState(content, name))
  for (const name of names) content = setSwitch(content, name, "true")
  writeFileSync(ENV_FILE, content)
  console.log(names.map((name, i) => `${name}: ${before[i]} -> true`).join("\n"))
  console.log("Next: node --env-file=.env.local scripts/mail-agent-doctor.mjs")
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
