import { NextResponse } from "next/server"
import { resolveCommitSha } from "@/lib/system/version"

export function GET() {
  const commit = resolveCommitSha(process.env)

  return NextResponse.json(
    { service: "futureos", status: "ok", commit },
    { headers: { "Cache-Control": "no-store" } }
  )
}
