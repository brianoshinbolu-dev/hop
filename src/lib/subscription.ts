export type Feature = "ifta_save" | "ifta_export" | "dvir" | "team_members"

const FEATURE_PLANS: Record<Feature, string> = {
  ifta_save: "starter",
  ifta_export: "starter",
  dvir: "free",
  team_members: "starter",
}

function getOrgPlan(_orgId: string): string {
  return "free"
}

export function isFeatureAccessible(
  orgId: string,
  feature: Feature
): boolean {
  const requiredPlan = FEATURE_PLANS[feature]
  if (requiredPlan === "free") return true
  const orgPlan = getOrgPlan(orgId)
  if (requiredPlan === "starter") {
    return orgPlan === "starter" || orgPlan === "growth" || orgPlan === "enterprise"
  }
  return false
}
