import { NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import type { PlanId } from "@/lib/pricing"

export async function POST(req: Request) {
  const signature = req.headers.get("x-paystack-signature")
  const body = await req.text()

  if (!signature) {
    return NextResponse.json({ message: "No signature" }, { status: 400 })
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex")

  if (hash !== signature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  switch (event.event) {
    case "charge.success": {
      const data = event.data
      const metadata = data.metadata || {}
      const orgId: string | undefined = metadata.org_id
      const planId: string | undefined = metadata.plan

      if (!orgId || !planId) {
        return NextResponse.json({ message: "Missing metadata" }, { status: 200 })
      }

      await supabase.from("invoices").insert({
        org_id: orgId,
        plan: planId,
        amount: data.amount / 100,
        currency: data.currency || "USD",
        status: "paid",
        paystack_reference: data.reference,
        paystack_transaction_id: String(data.id),
        paystack_authorization: data.authorization || null,
        paid_at: new Date(data.paid_at || Date.now()).toISOString(),
      })
      break
    }

    case "subscription.create": {
      const sub = event.data
      const customerCode = sub.customer?.customer_code
      const planCode = sub.plan?.plan_code
      const subCode = sub.subscription_code
      const email = sub.customer?.email

      if (!customerCode || !subCode) {
        return NextResponse.json({ message: "Missing subscription data" }, { status: 200 })
      }

      const planId = planCodeToPlanId(planCode)
      if (!planId) {
        return NextResponse.json({ message: "Unknown plan: " + planCode }, { status: 200 })
      }

      const nextPayment = sub.next_payment_date
        ? new Date(sub.next_payment_date).toISOString()
        : null

      const { data: org } = await supabase
        .from("orgs")
        .update({
          plan: planId,
          paystack_customer_code: customerCode,
          paystack_subscription_code: subCode,
          subscription_status: "active",
          subscription_ends_at: nextPayment,
          billing_email: email || undefined,
        })
        .eq("paystack_customer_code", customerCode)
        .select("id")
        .single()

      if (!org) {
        const { data: orgByEmail } = await supabase
          .from("orgs")
          .update({
            plan: planId,
            paystack_customer_code: customerCode,
            paystack_subscription_code: subCode,
            subscription_status: "active",
            subscription_ends_at: nextPayment,
            billing_email: email || undefined,
          })
          .eq("billing_email", email)
          .select("id")
          .single()

        if (!orgByEmail) {
          return NextResponse.json({ message: "Org not found for subscription" }, { status: 200 })
        }
      }
      break
    }

    case "subscription.disable": {
      const disabledSub = event.data
      const subCode = disabledSub.subscription_code

      await supabase
        .from("orgs")
        .update({
          plan: "free",
          subscription_status: "cancelled",
          paystack_subscription_code: null,
        })
        .eq("paystack_subscription_code", subCode)
      break
    }

    case "subscription.expiring.cancellation": {
      const expiringSub = event.data
      const expiringSubCode = expiringSub.subscription_code

      await supabase
        .from("orgs")
        .update({ subscription_status: "expiring" })
        .eq("paystack_subscription_code", expiringSubCode)
      break
    }
  }

  return NextResponse.json({ message: "OK" }, { status: 200 })
}

function planCodeToPlanId(code: string): PlanId | null {
  const map: Record<string, PlanId> = {
    PLN_starter: "starter",
    PLN_pro: "pro",
  }
  return map[code] || null
}
