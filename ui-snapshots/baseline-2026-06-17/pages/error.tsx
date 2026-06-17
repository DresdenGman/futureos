"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void _error
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        An unexpected error occurred. Please try again or return to the home
        page.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
