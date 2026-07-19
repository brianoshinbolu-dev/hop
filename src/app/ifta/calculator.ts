"use client"

export interface StateMiles {
  state: string
  miles: number
}

export interface FuelPurchase {
  state: string
  gallons: number
  pricePerGallon?: number
}

export type { IFTAResult, StateResult } from "@/lib/ifta"

export async function calculateIFTA(
  stateMiles: StateMiles[],
  fuelPurchases: FuelPurchase[]
) {
  const res = await fetch("/api/ifta/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stateMiles, fuelPurchases }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Calculation failed" }))
    throw new Error(err.error || "Calculation failed")
  }

  return res.json() as Promise<import("@/lib/ifta").IFTAResult>
}
