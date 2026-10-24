import "server-only"
import { keys } from "../store/keys"
import { drop, pass, type Gate } from "./types"

/** Gate 4 (D-55): a blocked or banned sender is dropped silently; the one notice went out before. */
export const blockedGate: Gate = async ({ sid, store }) => {
  if (await store.get(keys.block(sid))) return drop("blocked")
  if (await store.get(keys.ban(sid))) return drop("banned")
  return pass
}
