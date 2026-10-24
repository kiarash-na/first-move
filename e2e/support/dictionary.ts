import { readFileSync } from "node:fs"
import path from "node:path"

export type Lang = "en" | "de"

type Json = { [key: string]: Json } | string | number | boolean | null | Json[]

function read(lang: Lang, area: string): Json {
  return JSON.parse(readFileSync(path.join(process.cwd(), "dictionaries", lang, `${area}.json`), "utf8")) as Json
}

function merge(base: Json, over: Json | undefined): Json {
  if (over === undefined) return base
  if (typeof base === "object" && base && !Array.isArray(base) && typeof over === "object" && over && !Array.isArray(over)) {
    const result: { [key: string]: Json } = { ...base }
    for (const key of Object.keys(over)) result[key] = merge(base[key] ?? over[key], over[key])
    return result
  }
  return over
}

/**
 * One dictionary text, with the German file merged over English exactly as the app does it
 * (D-32), so the same test runs in both languages and follows the copy when DE grows.
 */
export function text(lang: Lang, area: string, key: string): string {
  const value = key.split(".").reduce<Json | undefined>((node, part) => {
    return node && typeof node === "object" && !Array.isArray(node) ? node[part] : undefined
  }, merge(read("en", area), lang === "de" ? read("de", area) : undefined))
  if (typeof value !== "string") throw new Error(`Missing text ${area}:${key}`)
  return value
}

/** Escapes a dictionary text for use inside a regular expression. */
export function literal(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
