import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createForecastSchema } from "@/lib/forecasts/schema"
import { createForecast } from "@/lib/forecasts/create-forecast"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const parsed = createForecastSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400 }
      )
    }

    const session = await auth()
    const userId = session?.user?.id ?? null

    const result = await createForecast(parsed.data, userId)

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        console.error(`[forecasts] ${error.message}`)
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        )
      }

      console.error("[forecasts] Error:", error.message)
      return NextResponse.json(
        { success: false, error: "Database is currently unavailable. Please try again later." },
        { status: 500 }
      )
    }

    console.error("[forecasts] Unknown error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
