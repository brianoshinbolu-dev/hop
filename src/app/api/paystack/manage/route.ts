import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase
    .from("users")
    .select("*, orgs(*)")
    .eq("id", user.id)
    .single()

  if (!profile?.orgs) return NextResponse.json({ error: "No org found" }, { status: 403 })

  const org = profile.orgs as Record<string, string | null>
  const customerCode = org.paystack_customer_code

  if (!customerCode) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 })
  }

  const response = await fetch(
    `https://api.paystack.co/subscription/${customerCode}/manage/link`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  )

  const data = await response.json()
  return NextResponse.json(data)
}
