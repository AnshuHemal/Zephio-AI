"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Clock, X } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import ProjectThumbnail from "./project-thumbnail";
import type { DashboardProject } from "./dashboard-client";

type Props = {
  project: DashboardProject;
  openedAt: string;
  onDismiss: () => void;
};

export default function ContinueBanner({ project, openedAt, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 sm:mb-8"
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-r from-primary/5 via-primary/3 to-transparent">
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -top-8 -left-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
          {/* Thumbnail */}
          <Link
            href={`/project/${project.slugId}`}
            className="relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-xl overflow-hidden border border-primary/15 bg-muted shadow-sm"
          >
            <ProjectThumbnail thumbnail={project.thumbnail} variant="list" />
          </Link>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70 mb-0.5">
              Continue where you left off
            </p>
            <p className="text-sm font-bold text-foreground truncate leading-tight">
              {project.title}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" />
              <span>Opened {formatDistanceToNow(openedAt)}</span>
              {project.pageCount > 0 && (
                <>
                  <span className="mx-1 opacity-40">·</span>
                  <span>{project.pageCount} page{project.pageCount !== 1 ? "s" : ""}</span>
                </>
              )}
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/project/${project.slugId}`}
            className="group hidden sm:flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] shrink-0"
          >
            Continue
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          {/* Mobile CTA */}
          <Link
            href={`/project/${project.slugId}`}
            className="flex sm:hidden items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground shrink-0"
          >
            <ArrowRight className="size-4" />
          </Link>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Dismiss"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
