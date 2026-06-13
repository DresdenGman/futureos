import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ForecastNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">Forecast Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        This forecast does not exist or may have been removed.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
        <Link href="/create">
          <Button variant="outline">Create a Forecast</Button>
        </Link>
      </div>
    </div>
  )
}
