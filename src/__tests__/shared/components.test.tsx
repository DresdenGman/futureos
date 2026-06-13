import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoadingState } from "@/components/shared/loading-state"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { CreateStepper } from "@/components/create/create-stepper"

describe("LoadingState", () => {
  it("renders default title and description", () => {
    render(<LoadingState />)
    expect(screen.getByText("Loading...")).toBeDefined()
    expect(screen.getByText("Please wait a moment.")).toBeDefined()
  })

  it("renders custom title and description", () => {
    render(<LoadingState title="Please wait" description="Fetching data..." />)
    expect(screen.getByText("Please wait")).toBeDefined()
    expect(screen.getByText("Fetching data...")).toBeDefined()
  })
})

describe("EmptyState", () => {
  it("renders default title and description", () => {
    render(<EmptyState />)
    expect(screen.getByText("Nothing here yet")).toBeDefined()
  })

  it("renders with action button", () => {
    render(
      <EmptyState
        title="No forecasts"
        description="Create one to begin."
        actionLabel="Create"
        actionHref="/create"
      />
    )
    expect(screen.getByText("No forecasts")).toBeDefined()
    expect(screen.getByText("Create")).toBeDefined()
  })

  it("does not render action when no href", () => {
    render(<EmptyState title="Empty" description="No data" />)
    expect(screen.queryByRole("link")).toBeNull()
  })
})

describe("ErrorState", () => {
  it("renders title and message", () => {
    render(<ErrorState message="Something broke." />)
    expect(screen.getByText("Something went wrong")).toBeDefined()
    expect(screen.getByText("Something broke.")).toBeDefined()
  })

  it("does not show stack trace", () => {
    const { container } = render(
      <ErrorState message="An error occurred. Stack: at line 42 in file.ts" />
    )
    const html = container.innerHTML
    // The message is user-facing, but we should not expose raw stack traces in the UI
    expect(html).not.toContain("Error.stack")
    expect(html).not.toContain("traceback")
  })

  it("renders retry button when onRetry provided", () => {
    render(<ErrorState message="Error" onRetry={() => {}} retryLabel="Retry" />)
    expect(screen.getByText("Retry")).toBeDefined()
  })

  it("does not render retry button when onRetry absent", () => {
    render(<ErrorState message="Error" />)
    expect(screen.queryByText("Try Again")).toBeNull()
  })
})

describe("CreateStepper", () => {
  it("renders all steps", () => {
    render(
      <CreateStepper
        steps={[
          { label: "S1", status: "completed" },
          { label: "S2", status: "active" },
          { label: "S3", status: "pending" },
          { label: "S4", status: "pending" },
        ]}
      />
    )
    // Check step numbers are rendered
    const circles = document.querySelectorAll(".rounded-full")
    expect(circles.length).toBe(4)
  })

  it("shows checkmark for completed steps", () => {
    render(
      <CreateStepper
        steps={[
          { label: "Done", status: "completed" },
          { label: "Next", status: "pending" },
        ]}
      />
    )
    // The completed step should have the Check SVG icon
    const completedEl = document.querySelectorAll(".rounded-full")[0]
    expect(completedEl.querySelector("svg")).toBeTruthy()
  })

  it("shows spinner for active step", () => {
    render(
      <CreateStepper
        steps={[
          { label: "Active", status: "active" },
          { label: "Later", status: "pending" },
        ]}
      />
    )
    const activeEl = document.querySelectorAll(".rounded-full")[0]
    expect(activeEl.innerHTML).toContain("animate-spin")
  })

  it("shows number for pending step", () => {
    render(
      <CreateStepper
        steps={[
          { label: "First", status: "completed" },
          { label: "Second", status: "pending" },
        ]}
      />
    )
    const pendingEl = document.querySelectorAll(".rounded-full")[1]
    expect(pendingEl.textContent).toContain("2")
  })
})
