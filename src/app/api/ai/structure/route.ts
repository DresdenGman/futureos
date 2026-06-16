import { NextResponse } from "next/server"
import { structureRequestSchema } from "@/lib/ai/structure/schema"
import { structureQuestion } from "@/lib/ai/structure/structure-question"
import { ExternalServiceTimeoutError } from "@/lib/utils/timeout"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const parsed = structureRequestSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400 }
      )
    }

    const { originalQuestion, domain } = parsed.data

    console.log(
      `[structure] Structuring question for domain="${domain}" length=${originalQuestion.length}`
    )

    const result = await structureQuestion({ originalQuestion, domain })

    console.log(
      `[structure] Result: isForecastable=${result.isForecastable} deadline=${result.deadlineSuggestion}`
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    if (error instanceof ExternalServiceTimeoutError) {
      console.error(
        `[structure] ${error.service} timeout after ${error.timeoutMs}ms`
      )
      return NextResponse.json(
        { success: false, error: "The AI service timed out. Please try again." },
        { status: 504 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("DEEPSEEK_API_KEY")) {
        console.error("[structure] DeepSeek API key not configured")
        return NextResponse.json(
          {
            success: false,
            error: "AI service is not configured. Please set the DEEPSEEK_API_KEY environment variable.",
          },
          { status: 503 }
        )
      }

      console.error("[structure] Error:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "AI service is temporarily unavailable. Please try again later.",
        },
        { status: 500 }
      )
    }

    console.error("[structure] Unknown error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
