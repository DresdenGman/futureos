import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/auth/current-user", () => ({
  getCurrentUserId: vi.fn(),
}))

import { getCurrentUserId } from "@/lib/auth/current-user"
import { resolveCallerKey } from "@/lib/utils/identity"

const mockGetCurrentUserId = vi.mocked(getCurrentUserId)

function buildRequest(headers?: Record<string, string>): Request {
  return new Request("http://localhost/api/ai/structure", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ originalQuestion: "test?", domain: "tech" }),
  })
}

describe("resolveCallerKey", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses user: prefix for logged-in user", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce("github-user-123")

    const key = await resolveCallerKey(buildRequest())
    expect(key).toBe("user:github-user-123")
  })

  it("uses ip: prefix for anonymous with x-forwarded-for", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce(null)

    const key = await resolveCallerKey(
      buildRequest({ "x-forwarded-for": "192.168.1.1" })
    )
    expect(key).toBe("ip:192.168.1.1")
  })

  it("uses first IP from multi-value x-forwarded-for", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce(null)

    const key = await resolveCallerKey(
      buildRequest({
        "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3",
      })
    )
    expect(key).toBe("ip:10.0.0.1")
  })

  it("falls back to x-real-ip when x-forwarded-for absent", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce(null)

    const key = await resolveCallerKey(
      buildRequest({ "x-real-ip": "172.16.0.1" })
    )
    expect(key).toBe("ip:172.16.0.1")
  })

  it("uses ip:unknown when no IP headers present", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce(null)

    const key = await resolveCallerKey(buildRequest())
    expect(key).toBe("ip:unknown")
  })

  it("ignores client-submitted userId in body", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce(null)

    const req = new Request("http://localhost/api/ai/structure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.0.5",
      },
      body: JSON.stringify({
        originalQuestion: "test?",
        domain: "tech",
        userId: "evil-user",
      }),
    })

    const key = await resolveCallerKey(req)
    expect(key).toBe("ip:10.0.0.5")
    expect(key).not.toContain("evil-user")
  })

  it("prioritizes authenticated user over IP", async () => {
    mockGetCurrentUserId.mockResolvedValueOnce("real-user")

    const key = await resolveCallerKey(
      buildRequest({ "x-forwarded-for": "1.2.3.4" })
    )
    expect(key).toBe("user:real-user")
  })
})
