"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  RefreshCw,
  Pencil,
  Trash2,
  Copy,
  Plus,
  History,
  Download,
  Link2,
  FolderPlus,
  X,
  Activity,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityEvent, ActivityEventType, ACTIVITY_CONFIG } from "@/types/activity";
import { formatDistanceToNow } from "@/lib/date-utils";

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  RefreshCw,
  Pencil,
  Trash2,
  Copy,
  Plus,
  History,
  Download,
  Link2,
  FolderPlus,
};

function EventIcon({ type, className }: { type: ActivityEventType; className?: string }) {
  const config = ACTIVITY_CONFIG[type];
  const Icon = ICON_MAP[config.icon] ?? Activity;
  return <Icon className={cn("size-3.5 shrink-0", config.color, className)} />;
}

type Props = {
  slugId: string;
  open: boolean;
  onClose: () => void;
};

export default function ActivityDrawer({ slugId, open, onClose }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(false);
    fetch(`/api/activity/${slugId}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [open, slugId]);

  // Group events by relative date bucket
  const grouped = groupByDate(events);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-80 flex-col border-l border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Activity className="size-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">Activity Log</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    {events.length > 0 ? `${events.length} event${events.length !== 1 ? "s" : ""}` : "Project history"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="size-5 text-muted-foreground animate-spin" />
                  <p className="text-xs text-muted-foreground">Loading activity…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 px-4 text-center">
                  <Activity className="size-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">Failed to load</p>
                  <p className="text-xs text-muted-foreground">Could not fetch activity log.</p>
                </div>
              ) : events.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="p-4 space-y-6">
                  {grouped.map(({ label, items }) => (
                    <div key={label}>
                      {/* Date bucket header */}
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="size-3 text-muted-foreground/60 shrink-0" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                          {label}
                        </p>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Timeline */}
                      <div className="relative pl-4">
                        {/* Vertical line */}
                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

                        <AnimatePresence initial={false}>
                          {items.map((event, i) => (
                            <ActivityItem key={event.id} event={event} index={i} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5">
              <p className="text-[10px] text-muted-foreground text-center">
                Showing last 100 events
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Single activity item ──────────────────────────────────────────────────────
function ActivityItem({ event, index }: { event: ActivityEvent; index: number }) {
  const config = ACTIVITY_CONFIG[event.eventType];

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ delay: index * 0.025, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mb-3 flex items-start gap-3"
    >
      {/* Dot on the timeline */}
      <div className={cn(
        "absolute -left-4 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 bg-background",
        "border-border group-hover:border-primary/40 transition-colors duration-150"
      )}>
        <div className={cn(
          "h-1.5 w-1.5 rounded-full transition-colors duration-150",
          config.color.replace("text-", "bg-").replace("text-destructive", "bg-destructive")
        )} />
      </div>

      {/* Card */}
      <div className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 hover:border-primary/20 hover:shadow-sm transition-all duration-150">
        <div className="flex items-start gap-2">
          <EventIcon type={event.eventType} className="mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground leading-snug">
              {event.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatDistanceToNow(event.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 text-center px-6"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 border border-primary/15">
        <Activity className="size-6 text-primary" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">No activity yet</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
        Activity will appear here as you generate pages, rename, export, and more.
      </p>
    </motion.div>
  );
}

// ── Date grouping helper ──────────────────────────────────────────────────────
function groupByDate(events: ActivityEvent[]): { label: string; items: ActivityEvent[] }[] {
  const now = new Date();
  const buckets = new Map<string, ActivityEvent[]>();

  for (const event of events) {
    const date = new Date(event.createdAt);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays < 7) label = `${diffDays} days ago`;
    else if (diffDays < 14) label = "Last week";
    else if (diffDays < 30) label = `${Math.floor(diffDays / 7)} weeks ago`;
    else label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(event);
  }

  return Array.from(buckets.entries()).map(([label, items]) => ({ label, items }));
}
