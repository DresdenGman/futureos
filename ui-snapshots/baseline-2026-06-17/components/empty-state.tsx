import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title = "Nothing here yet",
  description = "Get started by creating your first item.",
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
        <FileQuestion className="h-12 w-12 text-muted-foreground/50" />
        <div className="text-center space-y-1">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {actionLabel && actionHref && (
          <Button asChild variant="outline" size="sm">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
