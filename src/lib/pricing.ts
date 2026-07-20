export type PlanId = "free" | "starter" | "pro" | "enterprise"
export type Feature = "ifta_save" | "ifta_export" | "dvir" | "team_members"

export interface PlanConfig {
  id: PlanId
  name: string
  price: number // cents
  currency: string
  interval: "month"
  paystack_plan_code?: string
  features: string[]
  limits: { vehicles: number; drivers: number; retention_days: number }
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "1 vehicle",
      "DVIR inspections",
      "30-day record retention",
    ],
    limits: { vehicles: 1, drivers: 1, retention_days: 30 },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 1500,
    currency: "USD",
    interval: "month",
    paystack_plan_code: "PLN_starter",
    features: [
      "3 vehicles",
      "IFTA fuel tax calculator",
      "Driver qualification files",
      "1-year record retention",
      "PDF export",
    ],
    limits: { vehicles: 3, drivers: 5, retention_days: 365 },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 3500,
    currency: "USD",
    interval: "month",
    paystack_plan_code: "PLN_pro",
    features: [
      "10 vehicles",
      "CSA score monitoring",
      "Dispatch board",
      "4-year record retention",
      "Priority support",
    ],
    limits: { vehicles: 10, drivers: 20, retention_days: 1460 },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    currency: "USD",
    interval: "month",
    features: [
      "Unlimited vehicles",
      "On-premise option",
      "Dedicated support",
      "Custom contract",
    ],
    limits: { vehicles: Infinity, drivers: Infinity, retention_days: Infinity },
  },
}

export const FEATURE_PLANS: Record<Feature, PlanId> = {
  ifta_save: "starter",
  ifta_export: "starter",
  dvir: "free",
  team_members: "starter",
}

const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "enterprise"]

export function planIndex(plan: PlanId): number {
  return PLAN_ORDER.indexOf(plan)
}

export function meetsRequirement(orgPlan: PlanId, requiredPlan: PlanId): boolean {
  return planIndex(orgPlan) >= planIndex(requiredPlan)
}

export function getPaidPlans(): PlanConfig[] {
  return [PLANS.starter, PLANS.pro]
}
