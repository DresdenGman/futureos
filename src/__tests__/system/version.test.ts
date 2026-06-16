import { describe, it, expect } from "vitest"
import { resolveCommitSha } from "@/lib/system/version"

describe("resolveCommitSha", () => {
  it("returns RENDER_GIT_COMMIT when it is a valid 40-char hex SHA", () => {
    const sha = "03adcee7ac7ca2f82e8ebd3a5d6c9aedac5a8667"
    expect(resolveCommitSha({ RENDER_GIT_COMMIT: sha })).toBe(sha)
  })

  it("prefers RENDER_GIT_COMMIT over GIT_COMMIT_SHA", () => {
    const render = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    const fallback = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    expect(
      resolveCommitSha({
        RENDER_GIT_COMMIT: render,
        GIT_COMMIT_SHA: fallback,
      })
    ).toBe(render)
  })

  it("falls back to GIT_COMMIT_SHA when Render SHA is invalid", () => {
    const fallback = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    expect(
      resolveCommitSha({
        RENDER_GIT_COMMIT: "not-a-sha",
        GIT_COMMIT_SHA: fallback,
      })
    ).toBe(fallback)
  })

  it("falls back to GIT_COMMIT_SHA when Render SHA absent", () => {
    const sha = "cccccccccccccccccccccccccccccccccccccccc"
    expect(resolveCommitSha({ GIT_COMMIT_SHA: sha })).toBe(sha)
  })

  it("returns unknown when neither is a valid SHA", () => {
    expect(resolveCommitSha({})).toBe("unknown")
    expect(
      resolveCommitSha({ RENDER_GIT_COMMIT: "short", GIT_COMMIT_SHA: "bad" })
    ).toBe("unknown")
  })

  it("rejects 39-char hex", () => {
    expect(
      resolveCommitSha({
        RENDER_GIT_COMMIT: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      })
    ).toBe("unknown")
    // 39 chars
  })

  it("rejects 41-char hex", () => {
    expect(
      resolveCommitSha({
        RENDER_GIT_COMMIT: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      })
    ).toBe("unknown")
  })

  it("rejects non-hex characters", () => {
    expect(
      resolveCommitSha({ RENDER_GIT_COMMIT: "gggggggggggggggggggggggggggggggggggggggg" })
    ).toBe("unknown")
  })

  it("strips whitespace from valid SHA", () => {
    const sha = "dddddddddddddddddddddddddddddddddddddddd"
    expect(resolveCommitSha({ RENDER_GIT_COMMIT: `  ${sha}  ` })).toBe(sha)
  })
})

import { GET } from "@/app/api/version/route"

describe("GET /api/version", () => {
  it("returns 200 with service, status, commit", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get("Cache-Control")).toBe("no-store")

    const body = await res.json()
    expect(body.service).toBe("futureos")
    expect(body.status).toBe("ok")
    expect(typeof body.commit).toBe("string")
  })

  it("response has exactly three fields", async () => {
    const res = await GET()
    const body = await res.json()
    const keys = Object.keys(body).sort()
    expect(keys).toEqual(["commit", "service", "status"])
  })

  it("does not return environment variable values or secrets", async () => {
    const res = await GET()
    const text = await res.text()
    expect(text).not.toContain("RENDER_GIT_COMMIT")
    expect(text).not.toContain("DEEPSEEK")
    expect(text).not.toContain("TAVILY")
    expect(text).not.toContain("DATABASE")
    expect(text).not.toContain("SECRET")
  })
})
