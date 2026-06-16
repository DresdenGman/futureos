export class ExternalServiceTimeoutError extends Error {
  public readonly service: "deepseek" | "tavily"
  public readonly timeoutMs: number

  constructor(service: "deepseek" | "tavily", timeoutMs: number) {
    super(`${service} timed out after ${timeoutMs}ms`)
    this.name = "ExternalServiceTimeoutError"
    this.service = service
    this.timeoutMs = timeoutMs
  }
}

export const DEEPSEEK_TIMEOUT_MS = 60_000
export const TAVILY_TIMEOUT_MS = 20_000

export function createTimeoutSignal(ms: number): {
  signal: AbortSignal
  clear: () => void
} {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  }
}

export async function withTimeout<T>(
  service: "deepseek" | "tavily",
  timeoutMs: number,
  task: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  const { signal, clear } = createTimeoutSignal(timeoutMs)

  try {
    return await task(signal)
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw new ExternalServiceTimeoutError(service, timeoutMs)
    }
    throw error
  } finally {
    clear()
  }
}

function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.name === "AbortError") return true
    if (
      "cause" in error &&
      error.cause instanceof Error &&
      error.cause.name === "AbortError"
    ) {
      return true
    }
  }
  return false
}
