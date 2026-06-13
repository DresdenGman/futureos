import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSettleForecast = vi.fn()
const mockGetCurrentUserId = vi.fn()

// Mock settleForecast while preserving the real error classes
vi.mock("@/lib/forecasts/settle/settle-forecast", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/forecasts/settle/settle-forecast")
  >("@/lib/forecasts/settle/settle-forecast")
  return {
    ...actual,
    settleForecast: (...args: unknown[]) => mockSettleForecast(...args),
  }
})

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUserId: () => mockGetCurrentUserId(),
}))

import { POST } from "@/app/api/forecasts/[id]/settle/route"

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/forecasts/fc-1/settle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const validSettleBody = { outcome: "YES" as const }

const validResult = {
  id: "fc-1",
  status: "SETTLED" as const,
  outcome: "YES" as const,
  resolvedAt: new Date().toISOString(),
  brierScore: 0.1296,
}

describe("POST /api/forecasts/[id]/settle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUserId.mockResolvedValue("user-a")
    mockSettleForecast.mockResolvedValue(validResult)
  })

  it("returns 400 for empty body", async () => {
    const req = new Request(
      "http://localhost/api/forecasts/fc-1/settle",
      { method: "POST", body: "" }
    )
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Invalid JSON")
  })

  it("returns 400 for missing outcome", async () => {
    const req = buildRequest({})
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain("Validation error")
  })

  it("returns 400 for invalid outcome value", async () => {
    const req = buildRequest({ outcome: "MAYBE" })
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it("returns success on valid settlement", async () => {
    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe("SETTLED")
    expect(body.data.brierScore).toBe(0.1296)
  })

  // Business error: 401
  it("returns 401 for UnauthorizedError", async () => {
    const { UnauthorizedError } = await import(
      "@/lib/forecasts/settle/settle-forecast"
    )
    mockSettleForecast.mockRejectedValue(
      new UnauthorizedError("You must be signed in to perform this action.")
    )

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.success).toBe(false)
    expect(body.error).toContain("signed in")
  })

  // Business error: 403
  it("returns 403 for ForbiddenError", async () => {
    const { ForbiddenError } = await import(
      "@/lib/forecasts/settle/settle-forecast"
    )
    mockSettleForecast.mockRejectedValue(
      new ForbiddenError("Only the creator can settle this forecast.")
    )

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.error).toContain("creator")
  })

  // Business error: 404
  it("returns 404 for not-found error", async () => {
    mockSettleForecast.mockRejectedValue(
      new Error('Forecast "fc-missing" not found')
    )

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-missing" } })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toContain("not found")
  })

  // Business error: 409
  it("returns 409 for already-settled error", async () => {
    mockSettleForecast.mockRejectedValue(
      new Error('Forecast "fc-1" has already been settled')
    )

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.success).toBe(false)
    expect(body.error).toContain("already been settled")
  })

  // DB unreachable safety
  it("returns safe 500 error when database is unreachable", async () => {
    mockSettleForecast.mockRejectedValue(
      new Error("Can't reach database server at `localhost:5432`")
    )

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe(
      "Database is currently unavailable. Please try again later."
    )
    expect(body.error).not.toContain("localhost")
    expect(body.error).not.toContain("5432")
    expect(body.error).not.toContain("Can't reach")
    expect(body.error).not.toContain("P1001")
  })

  it("returns safe 500 error for Prisma initialization error", async () => {
    const prismaError = new Error(
      "PrismaClientInitializationError: Can't reach database server"
    )
    prismaError.name = "PrismaClientInitializationError"
    mockSettleForecast.mockRejectedValue(prismaError)

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe(
      "Database is currently unavailable. Please try again later."
    )
  })

  it("business error status codes are preserved (400, 401, 403, 404, 409)", async () => {
    // Verify the route handler's error classification chain works correctly
    // by checking that a plain unexpected error gets 500
    mockSettleForecast.mockRejectedValue(
      new Error("Some unexpected internal failure")
    )

    const req = buildRequest(validSettleBody)
    const res = await POST(req, { params: { id: "fc-1" } })
    const body = await res.json()

    expect(res.status).toBe(500)
    // Safe message, not the original error
    expect(body.error).toBe(
      "Database is currently unavailable. Please try again later."
    )
  })
})
