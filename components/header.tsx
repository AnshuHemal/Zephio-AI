"use client"

import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import { Button } from "./ui/button"
import { DarkModeToggle } from "./dark-mode-toggle"
import { SignedIn, SignedOut, useAuth } from "@/components/auth-context"
import Link from "next/link"
import { LogOutIcon } from "lucide-react"

const Header = () => {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const isProjectPage = pathname.startsWith('/project/')

  return (
    <header className="w-full">
      <div className={cn(
        "w-full flex py-3.5 px-8 items-center justify-between",
        isProjectPage && "absolute top-0 z-50 px-2 py-1 right-0 w-auto"
      )}>

        <div>
          {!isProjectPage && <Logo />}
        </div>

        <div className="flex items-center justify-end gap-3" suppressHydrationWarning>
          <DarkModeToggle />

          <SignedOut>
            <Button variant="outline" asChild>
              <Link href="/auth/sign-in">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <Button
              variant="ghost"
              className="gap-2 rounded-full px-4 text-sm font-medium"
              onClick={signOut}
            >
              <LogOutIcon className="size-4" />
              Sign out
            </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  )
}

export default Header