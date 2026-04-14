"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PageVersion, PageType } from "@/types/project";
import { restorePageVersionAction } from "@/app/action/action";
import { getHTMLWrapper } from "@/lib/page-wrapper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  X,
  History,
  RotateCcw,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  page: PageType | null;
  onClose: () => void;
  /** Called after a successful restore so the canvas updates immediately */
  onRestored: (updatedPage: PageType) => void;
};

// ── Relative time formatter ───────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function absoluteTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Mini iframe preview ───────────────────────────────────────────────────────
function VersionPreview({
  version,
  page,
  isActive,
}: {
  version: PageVersion;
  page: PageType;
  isActive: boolean;
}) {
  const html = getHTMLWrapper(
    version.htmlContent,
    version.label ?? page.name,
    version.rootStyles,
    `preview-${version.id}`
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border transition-all duration-200",
        isActive
          ? "border-primary/50 ring-2 ring-primary/20"
          : "border-border"
      )}
      style={{ height: 160 }}
    >
      {/* Scale-down iframe */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{ transform: "scale(0.2)", width: "500%", height: "500%" }}
      >
        <iframe
          srcDoc={html}
          title={`Version ${version.versionNumber}`}
          sandbox="allow-scripts"
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </div>

      {/* Overlay gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-card/80 to-transparent pointer-events-none" />
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function PageVersionDrawer({ open, page, onClose, onRestored }: Props) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Fetch versions whenever the drawer opens for a page
  const fetchVersions = useCallback(async (pageId: string) => {
    setLoading(true);
    setError(null);
    setVersions([]);
    setSelectedVersionId(null);
    try {
      const res = await fetch(`/api/page-versions/${pageId}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setVersions(data.versions ?? []);
    } catch {
      setError("Couldn't load version history. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && page?.id) {
      fetchVersions(page.id);
    }
  }, [open, page?.id, fetchVersions]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleRestore = async (version: PageVersion) => {
    if (!page) return;
    setRestoringId(version.id);
    try {
      const result = await restorePageVersionAction(page.id, version.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.page) {
        onRestored({
          ...page,
          htmlContent: result.page.htmlContent,
          rootStyles: result.page.rootStyles,
        });
        toast.success(`Restored to version ${version.versionNumber}`);
        onClose();
      }
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="vd-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="vd-panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-80 flex-col border-l border-border bg-card shadow-2xl shadow-black/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <History className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    Version History
                  </p>
                  {page && (
                    <p className="text-[11px] text-muted-foreground truncate max-w-44">
                      {page.name}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Info banner */}
            <div className="mx-3 mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <Clock className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The last <strong className="text-foreground">3 versions</strong> are saved automatically before each regeneration. Restoring creates a new version so you can always go back.
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Spinner className="size-6" />
                  <p className="text-sm text-muted-foreground">Loading versions…</p>
                </div>
              )}

              {!loading && error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 py-12 text-center"
                >
                  <AlertCircle className="size-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => page && fetchVersions(page.id)}
                  >
                    Try again
                  </Button>
                </motion.div>
              )}

              {!loading && !error && versions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3 py-12 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <History className="size-5 text-muted-foreground/60" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">No versions yet</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Versions are saved automatically the next time you regenerate this page.
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && !error && versions.length > 0 && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.06 } },
                  }}
                  className="flex flex-col gap-3"
                >
                  {versions.map((version, index) => {
                    const isSelected = selectedVersionId === version.id;
                    const isRestoring = restoringId === version.id;
                    const isCurrent = index === 0;

                    return (
                      <motion.div
                        key={version.id}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
                        }}
                        className={cn(
                          "group relative rounded-xl border bg-background transition-all duration-200 cursor-pointer overflow-hidden",
                          isSelected
                            ? "border-primary/40 shadow-sm shadow-primary/10"
                            : "border-border hover:border-border/80 hover:shadow-sm"
                        )}
                        onClick={() =>
                          setSelectedVersionId(isSelected ? null : version.id)
                        }
                      >
                        {/* Version header row */}
                        <div className="flex items-center justify-between px-3 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Version badge */}
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold transition-colors",
                                isCurrent
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              v{version.versionNumber}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {isCurrent ? "Latest saved" : `Version ${version.versionNumber}`}
                                </p>
                                {isCurrent && (
                                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                                    newest
                                  </span>
                                )}
                              </div>
                              <p
                                className="text-[11px] text-muted-foreground"
                                title={absoluteTime(version.createdAt)}
                              >
                                {relativeTime(version.createdAt)} · {absoluteTime(version.createdAt)}
                              </p>
                            </div>
                          </div>

                          <ChevronRight
                            className={cn(
                              "size-3.5 shrink-0 text-muted-foreground/50 transition-transform duration-200",
                              isSelected && "rotate-90"
                            )}
                          />
                        </div>

                        {/* Expandable preview + restore */}
                        <AnimatePresence initial={false}>
                          {isSelected && page && (
                            <motion.div
                              key="preview"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 flex flex-col gap-2.5">
                                {/* Mini preview */}
                                <VersionPreview
                                  version={version}
                                  page={page}
                                  isActive={isSelected}
                                />

                                {/* Restore button */}
                                <Button
                                  size="sm"
                                  className="w-full gap-2 font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(version);
                                  }}
                                  disabled={!!restoringId}
                                >
                                  {isRestoring ? (
                                    <>
                                      <Spinner className="size-3.5" />
                                      Restoring…
                                    </>
                                  ) : (
                                    <>
                                      <RotateCcw className="size-3.5" />
                                      Restore this version
                                    </>
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-3">
              <p className="text-[11px] text-center text-muted-foreground">
                Restoring a version saves your current state first
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
