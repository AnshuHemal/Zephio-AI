"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Report to Sentry with the error digest for correlation
    Sentry.captureException(error, {
      tags: { boundary: "global" },
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20"
        >
          <AlertTriangle className="size-7 text-destructive" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            An unexpected error occurred. Our team has been notified and is looking into it.
          </p>

          {/* Error digest for support reference */}
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono mb-6">
              Error ID: {error.digest}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button onClick={reset} className="gap-2 w-full sm:w-auto">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
            <Link href="/dashboard">
              <Home className="size-4" />
              Go to dashboard
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
