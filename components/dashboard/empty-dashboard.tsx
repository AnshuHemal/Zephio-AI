"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Sparkles } from "lucide-react";

export default function EmptyDashboard({ hasSearch }: { hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Search className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No projects found</h3>
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
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8 border border-primary/15">
        <Sparkles className="size-7 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground">No projects yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        Start your first project and watch Zephio turn your ideas into stunning web designs.
      </p>
      <Button className="mt-6 gap-2" asChild>
        <Link href="/new">
          <Plus className="size-4" />
          Create your first project
        </Link>
      </Button>
    </motion.div>
  );
}
