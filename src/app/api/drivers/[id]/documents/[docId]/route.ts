import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id: driverId, docId } = await params
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

  const { data: existing } = await supabase
    .from("driver_documents")
    .select("id")
    .eq("id", docId)
    .eq("driver_id", driverId)
    .eq("org_id", profile.org_id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const body = await request.json()
  const allowedFields = ["title", "notes", "expiry_date", "status"] as const
  const updates: Record<string, unknown> = {}

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const { data: document, error } = await supabase
    .from("driver_documents")
    .update(updates)
    .eq("id", docId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ document })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id: driverId, docId } = await params
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

  const { data: document } = await supabase
    .from("driver_documents")
    .select("file_url")
    .eq("id", docId)
    .eq("driver_id", driverId)
    .eq("org_id", profile.org_id)
    .single()

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const storagePrefix = "/storage/v1/object/public/driver-documents/"
  const pathIndex = document.file_url.indexOf(storagePrefix)
  if (pathIndex !== -1) {
    const filePath = document.file_url.slice(pathIndex + storagePrefix.length)
    await supabase.storage.from("driver-documents").remove([filePath])
  }

  const { error } = await supabase
    .from("driver_documents")
    .delete()
    .eq("id", docId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
