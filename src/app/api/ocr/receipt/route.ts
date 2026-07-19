import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

interface ReceiptData {
  date: string | null
  vendor: string | null
  gallons: number | null
  price_per_gallon: number | null
  total_cost: number | null
  state: string | null
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string
      }[]
    }
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image")

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Image file is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const fileExt = imageFile.name.split(".").pop() ?? "jpg"
    const fileName = `${randomUUID()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from("receipts")
      .getPublicUrl(filePath)

    const receiptUrl = urlData.publicUrl

    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const base64 = buffer.toString("base64")
    const mimeType = imageFile.type || "image/jpeg"

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
                {
                  text: "Extract fuel purchase information from this receipt. Return ONLY valid JSON with these fields: date (YYYY-MM-DD), vendor (string), gallons (number), price_per_gallon (number), total_cost (number), state (2-letter abbreviation). If you cannot determine a field, use null.",
                },
              ],
            },
          ],
        }),
      }
    )

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text()
      return NextResponse.json(
        { success: false, error: `Gemini API error: ${errorText}` },
        { status: 502 }
      )
    }

    const geminiData = (await geminiRes.json()) as GeminiResponse
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Gemini returned no content" },
        { status: 502 }
      )
    }

    const jsonMatch = text.match(/{[\s\S]*}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: "Gemini did not return valid JSON" },
        { status: 502 }
      )
    }

    const data = JSON.parse(jsonMatch[0]) as ReceiptData

    return NextResponse.json({
      success: true,
      data: {
        date: data.date ?? null,
        vendor: data.vendor ?? null,
        gallons: data.gallons ?? null,
        price_per_gallon: data.price_per_gallon ?? null,
        total_cost: data.total_cost ?? null,
        state: data.state ?? null,
      },
      receipt_url: receiptUrl,
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
