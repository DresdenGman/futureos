import { NextResponse } from "next/server"
import { settleRequestSchema } from "@/lib/forecasts/settle/schema"
import {
  settleForecast,
  UnauthorizedError,
  ForbiddenError,
} from "@/lib/forecasts/settle/settle-forecast"
import { getCurrentUserId } from "@/lib/auth/current-user"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Forecast ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const parsed = settleRequestSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400 }
      )
    }

    const { outcome } = parsed.data
    const currentUserId = await getCurrentUserId()

    const result = await settleForecast(id, outcome, currentUserId)

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        console.error(`[settle] Forecast not found`)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes("already been settled")) {
        console.error(`[settle] Forecast already settled`)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 409 }
        )
      }

      console.error("[settle] Error:", error.message)
      return NextResponse.json(
        { success: false, error: "Database is currently unavailable. Please try again later." },
        { status: 500 }
      )
    }

    console.error("[settle] Unknown error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
