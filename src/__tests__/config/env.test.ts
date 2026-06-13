import { describe, it, expect, beforeEach } from "vitest"
import { validateEnv, resetEnvCache } from "@/lib/config/env"

describe("validateEnv", () => {
  beforeEach(() => {
    resetEnvCache()
  })

  it("passes with all required vars set", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    expect(() => validateEnv()).not.toThrow()
  })

  it("throws with field name when DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    expect(() => validateEnv()).toThrow(/DATABASE_URL/)
  })

  it("throws with field name when DEEPSEEK_API_KEY is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    delete process.env.DEEPSEEK_API_KEY
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    expect(() => validateEnv()).toThrow(/DEEPSEEK_API_KEY/)
  })

  it("throws with field name when TAVILY_API_KEY is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    delete process.env.TAVILY_API_KEY
    process.env.AUTH_SECRET = "test-secret"

    expect(() => validateEnv()).toThrow(/TAVILY_API_KEY/)
  })

  it("throws with field name when AUTH_SECRET is missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    delete process.env.AUTH_SECRET

    expect(() => validateEnv()).toThrow(/AUTH_SECRET/)
  })

  it("throws when DATABASE_URL is empty string", () => {
    process.env.DATABASE_URL = ""
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    expect(() => validateEnv()).toThrow(/DATABASE_URL/)
  })

  it("aggregates all missing vars in error message", () => {
    delete process.env.DATABASE_URL
    delete process.env.DEEPSEEK_API_KEY
    delete process.env.TAVILY_API_KEY
    delete process.env.AUTH_SECRET

    try {
      validateEnv()
      expect.fail("Should have thrown")
    } catch (e) {
      const msg = (e as Error).message
      expect(msg).toContain("DATABASE_URL")
      expect(msg).toContain("DEEPSEEK_API_KEY")
      expect(msg).toContain("TAVILY_API_KEY")
      expect(msg).toContain("AUTH_SECRET")
    }
  })

  it("aggregates two missing vars in error message", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    delete process.env.TAVILY_API_KEY
    delete process.env.AUTH_SECRET

    try {
      validateEnv()
      expect.fail("Should have thrown")
    } catch (e) {
      const msg = (e as Error).message
      expect(msg).toContain("TAVILY_API_KEY")
      expect(msg).toContain("AUTH_SECRET")
      expect(msg).not.toContain("DATABASE_URL")
      expect(msg).not.toContain("DEEPSEEK_API_KEY")
    }
  })

  it("allows optional fields to be missing", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"
    delete process.env.AI_MODEL
    delete process.env.DEEPSEEK_BASE_URL
    delete process.env.OPENAI_API_KEY
    delete process.env.AUTH_GITHUB_ID
    delete process.env.AUTH_GITHUB_SECRET

    expect(() => validateEnv()).not.toThrow()
  })

  it("does not require OPENAI_API_KEY (migrated to DeepSeek)", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"
    delete process.env.OPENAI_API_KEY

    expect(() => validateEnv()).not.toThrow()
  })

  it("throws when DEEPSEEK_API_KEY is empty string", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = ""
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    expect(() => validateEnv()).toThrow(/DEEPSEEK_API_KEY/)
  })

  it("does not expose variable values in error messages", () => {
    process.env.DATABASE_URL = "postgresql://secret:password@db/test"
    process.env.DEEPSEEK_API_KEY = "sk-my-real-deepseek-key"
    process.env.TAVILY_API_KEY = "tvly-real"
    // Missing AUTH_SECRET to trigger error
    delete process.env.AUTH_SECRET

    try {
      validateEnv()
      expect.fail("Should have thrown")
    } catch (e) {
      const msg = (e as Error).message
      expect(msg).not.toContain("sk-my-real-deepseek-key")
      expect(msg).not.toContain("tvly-real")
      expect(msg).not.toContain("secret:password")
      expect(msg).not.toContain("postgresql://secret")
    }
  })

  it("caches results across calls", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    validateEnv()
    delete process.env.DEEPSEEK_API_KEY
    // Should still pass due to cache
    expect(() => validateEnv()).not.toThrow()
  })

  it("resets cache and re-validates after resetEnvCache", () => {
    process.env.DATABASE_URL = "postgresql://localhost/test"
    process.env.DEEPSEEK_API_KEY = "sk-test"
    process.env.TAVILY_API_KEY = "tvly-test"
    process.env.AUTH_SECRET = "test-secret"

    validateEnv()
    resetEnvCache()
    delete process.env.DATABASE_URL
    expect(() => validateEnv()).toThrow(/DATABASE_URL/)
  })
})
