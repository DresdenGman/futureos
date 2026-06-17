import { Check, Loader2 } from "lucide-react"

interface Step {
  label: string
  status: "pending" | "active" | "completed"
  explanation?: string
}

interface CreateStepperProps {
  steps: Step[]
}

export function CreateStepper({ steps }: CreateStepperProps) {
  const activeStep = steps.find((s) => s.status === "active")

  return (
    <div>
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  step.status === "completed"
                    ? "bg-primary text-primary-foreground"
                    : step.status === "active"
                      ? "bg-primary/20 text-primary border border-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.status === "completed" ? (
                  <Check className="h-3 w-3" />
                ) : step.status === "active" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`text-xs hidden sm:inline ${
                  step.status === "completed"
                    ? "text-foreground font-medium"
                    : step.status === "active"
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-6 sm:w-10 ${
                  step.status === "completed" ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      {activeStep?.explanation && (
        <p className="text-xs text-muted-foreground text-center mb-6">
          {activeStep.explanation}
        </p>
      )}
    </div>
  )
}
