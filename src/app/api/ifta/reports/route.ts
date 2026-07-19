import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateIFTA } from "@/lib/ifta"
import { isFeatureAccessible } from "@/lib/subscription"

export async function POST(request: Request) {
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

  if (!isFeatureAccessible(profile.org_id, "ifta_save")) {
    return NextResponse.json(
      { error: "Upgrade to Starter plan to save IFTA reports" },
      { status: 403 }
    )
  }

  const body: {
    quarter: string
    stateMiles: Record<string, number> | Array<{ state: string; miles: number }>
    fuelPurchases: Array<{
      state: string
      gallons: number
      taxPaid?: number
      pricePerGallon?: number
      vehicle_id?: string
      date: string
      price_per_gallon?: number
      total_cost?: number
      receipt_url?: string
    }>
  } = await request.json()

  const result = calculateIFTA({ stateMiles: body.stateMiles, fuelPurchases: body.fuelPurchases })

  const { data: report, error } = await supabase
    .from("ifta_reports")
    .insert({
      org_id: profile.org_id,
      quarter: body.quarter,
      status: "draft",
      total_miles: result.totalMiles,
      total_gallons: result.totalGallonsPurchased,
      tax_due: result.totalTaxDue,
      tax_paid: result.totalTaxPaid,
      net_due: result.netDue,
      state_breakdown: result.rows as unknown as Record<string, unknown>[],
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.fuelPurchases.length > 0) {
    const purchases = body.fuelPurchases.map((p: Record<string, unknown>) => ({
      org_id: profile.org_id,
      ifta_report_id: report.id,
      vehicle_id: (p.vehicle_id as string | undefined) ?? null,
      date: p.date as string,
      gallons: p.gallons as number,
      price_per_gallon: (p.price_per_gallon as number | undefined) ?? null,
      total_cost: (p.total_cost as number | undefined) ?? null,
      state: p.state as string,
      receipt_url: (p.receipt_url as string | undefined) ?? null,
    }))

    const { error: fpError } = await supabase
      .from("fuel_purchases")
      .insert(purchases)

    if (fpError) {
      return NextResponse.json({ error: fpError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ id: report.id })
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100)
  const offset = (page - 1) * limit

  const { data: reports, error, count } = await supabase
    .from("ifta_reports")
    .select("*", { count: "exact" })
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    reports,
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  })
}
