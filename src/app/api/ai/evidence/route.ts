import { NextResponse } from "next/server"
import { evidenceRequestSchema } from "@/lib/ai/evidence/schema"
import { gatherEvidence } from "@/lib/ai/evidence/gather-evidence"
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

    const parsed = evidenceRequestSchema.safeParse(body)
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
    const limitResult = checkRateLimit(callerKey, ENDPOINT_WEIGHTS.evidence)
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
      `[evidence] Gathering evidence for question length=${input.structuredQuestion.length} domain=${input.domain}`
    )

    const result = await gatherEvidence(input)

    console.log(
      `[evidence] Found ${result.evidence.length} evidence items, ${result.limitations.length} limitations`
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error: unknown) {
    if (error instanceof ExternalServiceTimeoutError) {
      console.error(
        `[evidence] ${error.service} timeout after ${error.timeoutMs}ms`
      )
      const message =
        error.service === "tavily"
          ? "The search service timed out. Please try again."
          : "The AI service timed out. Please try again."
      return NextResponse.json(
        { success: false, error: message },
        { status: 504 }
      )
    }

    if (error instanceof Error) {
      if (error.message.includes("TAVILY_API_KEY")) {
        console.error("[evidence] Tavily API key not configured")
        return NextResponse.json(
          {
            success: false,
            error:
              "Search service is not configured. Please set the TAVILY_API_KEY environment variable.",
          },
          { status: 503 }
        )
      }

      if (error.message.includes("DEEPSEEK_API_KEY")) {
        console.error("[evidence] DeepSeek API key not configured")
        return NextResponse.json(
          {
            success: false,
            error:
              "AI service is not configured. Please set the DEEPSEEK_API_KEY environment variable.",
          },
          { status: 503 }
        )
      }

      console.error("[evidence] Error:", error.message)
      return NextResponse.json(
        {
          success: false,
          error: "AI service is temporarily unavailable. Please try again later.",
        },
        { status: 500 }
      )
    }

    console.error("[evidence] Unknown error:", error)
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
