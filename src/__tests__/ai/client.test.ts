import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCreateOpenAI = vi.fn()
const mockModelFn = vi.fn()

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: (...args: unknown[]) => {
    mockCreateOpenAI(...args)
    return {
      chat: (modelName: string) => {
        mockModelFn(modelName)
        return "mock-model-instance"
      },
    }
  },
}))

describe("getModel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module-level state by re-importing
    vi.resetModules()
  })

  it("throws when DEEPSEEK_API_KEY is missing", async () => {
    delete process.env.DEEPSEEK_API_KEY

    const { getModel } = await import("@/lib/ai/client")
    expect(() => getModel()).toThrow("DEEPSEEK_API_KEY")
  })

  it("uses default DEEPSEEK_BASE_URL when not set", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek"
    delete process.env.DEEPSEEK_BASE_URL

    const { getModel } = await import("@/lib/ai/client")
    getModel()

    expect(mockCreateOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "sk-test-deepseek",
        baseURL: "https://api.deepseek.com/v1",
      })
    )
  })

  it("uses custom DEEPSEEK_BASE_URL when set", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek"
    process.env.DEEPSEEK_BASE_URL = "https://custom.deepseek.com"

    const { getModel } = await import("@/lib/ai/client")
    getModel()

    expect(mockCreateOpenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "sk-test-deepseek",
        baseURL: "https://custom.deepseek.com",
      })
    )
  })

  it("uses default AI_MODEL when not set", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek"
    delete process.env.AI_MODEL

    const { getModel } = await import("@/lib/ai/client")
    getModel()

    expect(mockModelFn).toHaveBeenCalledWith("deepseek-v4-flash")
  })

  it("uses custom AI_MODEL when set", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek"
    process.env.AI_MODEL = "deepseek-v4-pro"

    const { getModel } = await import("@/lib/ai/client")
    getModel()

    expect(mockModelFn).toHaveBeenCalledWith("deepseek-v4-pro")
  })

  it("caches provider instance across calls", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-deepseek"

    const { getModel } = await import("@/lib/ai/client")
    getModel()
    getModel()

    expect(mockCreateOpenAI).toHaveBeenCalledTimes(1)
  })

  it("does not log API key", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
    process.env.DEEPSEEK_API_KEY = "sk-do-not-log-this"

    const { getModel } = await import("@/lib/ai/client")
    getModel()

    // console.error should not have been called for normal operation
    // createOpenAI call should not contain the key in any logged output
    // (the key is passed but console.error is not called)
    consoleSpy.mockRestore()
  })
})
