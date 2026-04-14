"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Sparkles, Wand2 } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "A SaaS landing page for an AI writing tool",
  "A portfolio for a UI/UX designer",
  "An e-commerce store for luxury sneakers",
];

export default function EmptyDashboard({ hasSearch }: { hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4"
      >
        <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-muted">
          <Search className="size-5 sm:size-6 text-muted-foreground" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          No projects found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search term.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/8 border border-primary/15"
      >
        <Sparkles className="size-6 sm:size-7 text-primary" />
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-foreground">
          No projects yet
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Describe what you want to build and Zephio will design it for you in seconds.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.4 }}
        className="mt-6"
      >
        <Button className="gap-2 h-10 px-5 text-sm font-semibold" asChild>
          <Link href="/new">
            <Plus className="size-4" />
            Create your first project
          </Link>
        </Button>
      </motion.div>

      {/* Example prompts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-8 sm:mt-10 w-full max-w-sm"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Try one of these
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((prompt, i) => (
            <motion.div
              key={prompt}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={`/new?prompt=${encodeURIComponent(prompt)}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground hover:border-primary/30 hover:bg-primary/3 hover:text-foreground transition-all duration-200 active:scale-[0.98]"
              >
                <Wand2 className="size-3.5 shrink-0 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="truncate">{prompt}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
