import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single()

  if (!profile?.org_id) {
    return NextResponse.json({ error: "No org found" }, { status: 403 })
  }

  const { data: report, error } = await supabase
    .from("ifta_reports")
    .select("*")
    .eq("id", id)
    .eq("org_id", profile.org_id)
    .single()

  if (error || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  const { data: fuelPurchases } = await supabase
    .from("fuel_purchases")
    .select("*")
    .eq("ifta_report_id", id)

  return NextResponse.json({
    ...report,
    state_breakdown: report.state_breakdown as Record<string, unknown>[],
    fuel_purchases: fuelPurchases ?? [],
  })
}
