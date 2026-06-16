import { NextResponse } from "next/server"
import { probabilityRequestSchema } from "@/lib/ai/probability/schema"
import { estimateProbability } from "@/lib/ai/probability/estimate-probability"
import { ExternalServiceTimeoutError } from "@/lib/utils/timeout"
import { resolveCallerKey } from "@/lib/utils/identity"
import { checkRateLimit, ENDPOINT_WEIGHTS } from "@/lib/utils/ratelimit"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const parsed = probabilityRequestSchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
      return NextResponse.json(
        { success: false, error: `Validation error: ${errors}` },
        { status: 400 }
      )
    }

    const input = parsed.data

    const callerKey = await resolveCallerKey(request)
    const limitResult = checkRateLimit(callerKey, ENDPOINT_WEIGHTS.probability)
    if (!limitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many AI requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limitResult.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        }
      )
    }

    console.log(
      `[probability] Estimating probability: ${input.structuredQuestion.substring(0, 80)}... (${input.evidence.length} evidence items)`
    )

    const result = await estimateProbability(input)

    console.log(
      `[probability] Result: probability=${result.probability} confidence=${result.confidence} drivers=${result.keyDrivers.length} counters=${result.counterArguments.length}`
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    if (error instanceof ExternalServiceTimeoutError) {
      console.error(
        `[probability] ${error.service} timeout after ${error.timeoutMs}ms`
      )
      return NextResponse.json(
        { success: false, error: "The AI service timed out. Please try again." },
        { status: 504 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("DEEPSEEK_API_KEY")) {
        console.error("[probability] DeepSeek API key not configured")
        return NextResponse.json(
          {
            success: false,
            error:
              "AI service is not configured. Please set the DEEPSEEK_API_KEY environment variable.",
          },
          { status: 503 }
        )
      }

      console.error("[probability] Error:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "AI service is temporarily unavailable. Please try again later.",
        },
        { status: 500 }
      )
    }

    console.error("[probability] Unknown error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
