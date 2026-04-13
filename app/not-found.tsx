import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8">
        <Logo />
      </div>

      <div className="text-center max-w-sm">
        <p className="text-8xl font-black tracking-tighter text-foreground/10 mb-4 select-none">
          404
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="gap-2 w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="size-4" />
              Go to dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
