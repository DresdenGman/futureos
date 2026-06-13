import { LoadingState } from "@/components/shared/loading-state"

export default function ForecastLoading() {
  return (
    <div className="flex flex-col items-center py-24">
      <div className="max-w-3xl w-full space-y-6">
        <LoadingState
          title="Loading forecast..."
          description="Fetching prediction data."
        />
      </div>
    </div>
  )
}
