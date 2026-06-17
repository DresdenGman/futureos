import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export async function Navbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          FutureOS
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/create">
            <Button variant="outline" size="sm">
              Create Forecast
            </Button>
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
