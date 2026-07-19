import { NextRequest, NextResponse } from "next/server"
import { calculateIFTA, type IFTACalculationInput } from "@/lib/ifta"

export async function POST(request: NextRequest) {
  const body = (await request.json()) as IFTACalculationInput

  if (!body.stateMiles || Object.keys(body.stateMiles).length === 0) {
    return NextResponse.json({ error: "At least one state with miles is required" }, { status: 400 })
  }

  try {
    const result = calculateIFTA(body)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 })
  }
}
