import { createClient } from "@/lib/supabase/server"
import { FEATURE_PLANS, meetsRequirement, type Feature, type PlanId } from "@/lib/pricing"

export async function getOrgPlan(orgId: string): Promise<PlanId> {
  const supabase = await createClient()
  const { data: org } = await supabase
    .from("orgs")
    .select("plan")
    .eq("id", orgId)
    .single()

  if (!org?.plan) return "free"

  const plan = org.plan as PlanId
  if (!["free", "starter", "pro", "enterprise"].includes(plan)) return "free"
  return plan
}

export async function setOrgPlan(
  orgId: string,
  plan: PlanId,
  subscriptionData?: {
    paystack_customer_code?: string
    paystack_subscription_code?: string
    subscription_status?: string
    subscription_ends_at?: string
    billing_email?: string
  }
): Promise<void> {
  const supabase = await createClient()
  const update: Record<string, string | null> = { plan }

  if (subscriptionData?.paystack_customer_code) {
    update.paystack_customer_code = subscriptionData.paystack_customer_code
  }
  if (subscriptionData?.paystack_subscription_code) {
    update.paystack_subscription_code = subscriptionData.paystack_subscription_code
  }
  if (subscriptionData?.subscription_status) {
    update.subscription_status = subscriptionData.subscription_status
  }
  if (subscriptionData?.subscription_ends_at) {
    update.subscription_ends_at = subscriptionData.subscription_ends_at
  }
  if (subscriptionData?.billing_email) {
    update.billing_email = subscriptionData.billing_email
  }

  await supabase.from("orgs").update(update).eq("id", orgId)
}

export async function isFeatureAccessible(
  orgId: string,
  feature: Feature
): Promise<boolean> {
  const requiredPlan = FEATURE_PLANS[feature]
  if (requiredPlan === "free") return true
  const orgPlan = await getOrgPlan(orgId)
  return meetsRequirement(orgPlan, requiredPlan)
}
