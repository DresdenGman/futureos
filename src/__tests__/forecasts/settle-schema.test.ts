import { describe, it, expect } from "vitest"
import { settleRequestSchema } from "@/lib/forecasts/settle/schema"

describe("settleRequestSchema", () => {
  it("accepts YES", () => {
    const result = settleRequestSchema.safeParse({ outcome: "YES" })
    expect(result.success).toBe(true)
  })

  it("accepts NO", () => {
    const result = settleRequestSchema.safeParse({ outcome: "NO" })
    expect(result.success).toBe(true)
  })

  it("rejects invalid outcome", () => {
    const result = settleRequestSchema.safeParse({ outcome: "MAYBE" })
    expect(result.success).toBe(false)
  })

  it("rejects empty outcome", () => {
    const result = settleRequestSchema.safeParse({ outcome: "" })
    expect(result.success).toBe(false)
  })

  it("rejects missing outcome", () => {
    const result = settleRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
