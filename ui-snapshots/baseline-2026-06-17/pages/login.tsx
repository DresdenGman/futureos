"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/" })
  }

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground">
          Sign in to create and track your forecasts
        </p>

        <Button size="lg" className="w-full" onClick={handleSignIn}>
          Sign in with GitHub
        </Button>
      </div>
    </div>
  )
}
