import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PLANS, type PlanId } from "@/lib/pricing"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("users")
    .select("*, orgs(*)")
    .eq("id", user.id)
    .single()

  if (!profile?.orgs) return NextResponse.json({ error: "No org found" }, { status: 403 })

  const { plan: planId }: { plan: string } = await req.json()
  if (!["starter", "pro"].includes(planId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  const plan = PLANS[planId as PlanId]
  if (!plan.paystack_plan_code) {
    return NextResponse.json({ error: "Plan not configured for payments" }, { status: 500 })
  }

  const org = profile.orgs as Record<string, string | null>
  const email = profile.email

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: plan.price.toString(),
      plan: plan.paystack_plan_code,
      metadata: {
        org_id: org.id,
        plan: planId,
        user_id: user.id,
      },
    }),
  })

  const data = await response.json()
  return NextResponse.json(data)
}
