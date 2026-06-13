import { createOpenAI } from "@ai-sdk/openai"

let _provider: ReturnType<typeof createOpenAI> | null = null

function getProvider() {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error(
      "DEEPSEEK_API_KEY is not configured. Please set the DEEPSEEK_API_KEY environment variable."
    )
  }
  if (!_provider) {
    _provider = createOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    })
  }
  return _provider
}

export function getModel() {
  const modelName = process.env.AI_MODEL || "deepseek-v4-flash"
  return getProvider().chat(modelName)
}
