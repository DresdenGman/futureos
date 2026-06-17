import { LoadingState } from "@/components/shared/loading-state"

export default function AppLoading() {
  return (
    <div className="flex flex-col items-center py-24">
      <div className="max-w-2xl w-full">
        <LoadingState
          title="Loading..."
          description="Fetching latest data."
        />
      </div>
    </div>
  )
}
