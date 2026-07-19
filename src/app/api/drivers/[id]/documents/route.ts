import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: driverId } = await params
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

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("id", driverId)
    .eq("org_id", profile.org_id)
    .single()

  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") ?? "all"

  let query = supabase
    .from("driver_documents")
    .select("*")
    .eq("driver_id", driverId)
    .eq("org_id", profile.org_id)

  if (status === "active") {
    query = query.eq("status", "active")
  }

  const { data: documents, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: driverId } = await params
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

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("id", driverId)
    .eq("org_id", profile.org_id)
    .single()

  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const documentType = formData.get("document_type") as string | null
  const title = formData.get("title") as string | null
  const expiryDate = formData.get("expiry_date") as string | null
  const notes = formData.get("notes") as string | null

  if (!file || !documentType || !title) {
    return NextResponse.json(
      { error: "file, document_type, and title are required" },
      { status: 400 }
    )
  }

  const validTypes = [
    "cdl",
    "medical_card",
    "mvr",
    "drug_test",
    "insurance",
    "dot_annual_review",
    "other",
  ]
  if (!validTypes.includes(documentType)) {
    return NextResponse.json({ error: "Invalid document_type" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "bin"
  const filePath = `${driverId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("driver-documents")
    .upload(filePath, file)

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from("driver-documents")
    .getPublicUrl(filePath)

  const { data: document, error: insertError } = await supabase
    .from("driver_documents")
    .insert({
      driver_id: driverId,
      org_id: profile.org_id,
      document_type: documentType,
      title,
      file_url: publicUrl,
      file_type: file.type || null,
      expiry_date: expiryDate || null,
      notes: notes || null,
      status: "active",
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ document }, { status: 201 })
}
