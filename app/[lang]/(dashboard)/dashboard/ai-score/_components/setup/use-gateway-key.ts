"use client"

import { useSyncExternalStore } from "react"

import { maskedGatewayKey, subscribeGatewayKey } from "@/lib/assistant/gateway/key"

/** The masked Gateway key (`…a1b2`), or null; the key itself never reaches a component (D-71). */
export function useMaskedGatewayKey(): string | null {
  return useSyncExternalStore(subscribeGatewayKey, maskedGatewayKey, () => null)
}
