import "server-only"
import { MICRO_USD, spentToday } from "../store/budget"
import { drop, pass, type Gate } from "./types"

/** Gate 7: today's model spend under `EMAIL_AGENT_DAILY_BUDGET_USD`, else the agent pauses silently. */
export const budgetGate: Gate = async ({ config, store, now }) =>
  (await spentToday(store, now)) >= config.limits.dailyBudgetUsd * MICRO_USD ? drop("budget") : pass
