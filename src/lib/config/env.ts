import { z } from "zod"

/**
 * Server-side environment variable validation.
 * Does NOT expose values. Only validates presence and format.
 */

const REQUIRED_VARS = [
  "DATABASE_URL",
  "DEEPSEEK_API_KEY",
  "TAVILY_API_KEY",
  "AUTH_SECRET",
] as const

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DEEPSEEK_API_KEY: z.string().min(1),
  DEEPSEEK_BASE_URL: z.string().url().optional(),
  TAVILY_API_KEY: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  AI_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
})

export type ValidatedEnv = z.infer<typeof envSchema>

let cachedEnv: ValidatedEnv | null = null

/**
 * Validate and return environment variables.
 * Results are cached so repeated calls are zero-cost.
 * Throws with a descriptive message if required vars are missing.
 * Error messages never contain variable values.
 */
export function validateEnv(): ValidatedEnv {
  if (cachedEnv) return cachedEnv

  // Pre-check required vars for clear field-specific error messages.
  // Zod v4 returns generic "Invalid input" for undefined process.env values.
  const missing = REQUIRED_VARS.filter(
    (name) => !process.env[name] || process.env[name]!.trim() === ""
  )

  if (missing.length > 0) {
    const formatted = missing.map((m) => `  - Missing required environment variable: ${m}`).join("\n")
    throw new Error(
      `Missing required environment variable(s):\n${formatted}\n\nPlease check your .env file against .env.example.`
    )
  }

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n  - ")
    throw new Error(
      `Invalid environment variable(s):\n  - ${issues}\n\nPlease check your .env file against .env.example.`
    )
  }

  cachedEnv = result.data
  return result.data
}

/**
 * Reset the cached env (useful in tests).
 */
export function resetEnvCache() {
  cachedEnv = null
}
