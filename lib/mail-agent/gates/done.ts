import "server-only"
import { keys } from "../store/keys"
import { drop, pass, type Gate } from "./types"

/** Gate 1: an email that was already handled is never handled again (webhook retries, replays). */
export const doneGate: Gate = async ({ email, store }) => ((await store.get(keys.done(email.id))) ? drop("done") : pass)
