import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import type { EvidenceItem } from "@/lib/ai/evidence/schema"

const directionLabels: Record<EvidenceItem["direction"], string> = {
  SUPPORT: "Supporting",
  OPPOSE: "Opposing",
  NEUTRAL: "Neutral",
}

const directionColors: Record<EvidenceItem["direction"], string> = {
  SUPPORT: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
  OPPOSE: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
  NEUTRAL: "bg-muted text-muted-foreground",
}

const credibilityVariant: Record<
  EvidenceItem["credibility"],
  "default" | "secondary" | "outline"
> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
}

const relevanceVariant: Record<
  EvidenceItem["relevance"],
  "default" | "secondary" | "outline"
> = {
  HIGH: "default",
  MEDIUM: "secondary",
  LOW: "outline",
}

export function EvidenceCard({ evidence }: { evidence: EvidenceItem }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base font-medium leading-snug">
            {evidence.title}
          </CardTitle>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${directionColors[evidence.direction]}`}
          >
            {directionLabels[evidence.direction]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Source line */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{evidence.source}</span>
          {evidence.publishedDate && (
            <>
              <span>·</span>
              <span>{evidence.publishedDate}</span>
            </>
          )}
          <a
            href={evidence.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Summary */}
        <p className="text-sm">{evidence.summary}</p>

        {/* Reasoning */}
        <p className="text-xs text-muted-foreground italic">
          {evidence.reasoning}
        </p>

        {/* Badges */}
        <div className="flex gap-2 pt-1">
          <Badge variant={credibilityVariant[evidence.credibility]}>
            Cred: {evidence.credibility}
          </Badge>
          <Badge variant={relevanceVariant[evidence.relevance]}>
            Rel: {evidence.relevance}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
