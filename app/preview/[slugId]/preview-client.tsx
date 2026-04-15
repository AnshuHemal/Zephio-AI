"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getHTMLWrapper } from "@/lib/page-wrapper";
import { PageType } from "@/types/project";
import { PageComment } from "@/types/comments";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { downloadPage, downloadAllPages } from "@/lib/export";
import {
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Link2,
  Check,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import CommentOverlay from "@/components/preview/comment-overlay";
import CommentPanel from "@/components/preview/comment-panel";

type PreviewData = {
  title: string;
  slugId: string;
  pages: PageType[];
};

export default function PreviewClient({ slugId }: { slugId: string }) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // ── Comment state ──────────────────────────────────────────────────────────
  const [comments, setComments] = useState<PageComment[]>([]);
  const [commentMode, setCommentMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // isOwner: true when the viewer is the project owner (has edit access)
  const [isOwner, setIsOwner] = useState(false);

  // ── Load project data ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/preview/${slugId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slugId]);

  // ── Load comments ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/comments/${slugId}`)
      .then((r) => r.ok ? r.json() : { comments: [] })
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {});
  }, [slugId]);

  // ── Check ownership (best-effort — no auth required for preview) ───────────
  useEffect(() => {
    fetch(`/api/project/${slugId}`)
      .then((r) => r.ok ? setIsOwner(true) : null)
      .catch(() => {});
  }, [slugId]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "ArrowLeft" && activeIndex > 0) {
        setActiveIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && activeIndex < data.pages.length - 1) {
        setActiveIndex((i) => i + 1);
      } else if (e.key === "c" && !e.metaKey && !e.ctrlKey && !isTyping) {
        handleCopyLink();
      } else if (e.key === "f" && !e.metaKey && !e.ctrlKey && !isTyping) {
        setCommentMode((v) => !v);
      } else if (e.key === "Escape") {
        setCommentMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const activePage = data?.pages[activeIndex];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDownloadAll = async () => {
    if (!data) return;
    setIsDownloading(true);
    await downloadAllPages(data.pages, data.title);
    setIsDownloading(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleAddComment = useCallback(
    async (xPct: number, yPct: number, authorName: string, text: string) => {
      if (!activePage) return;
      try {
        const res = await fetch(`/api/comments/${slugId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageId: activePage.id,
            authorName,
            text,
            xPct,
            yPct,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Failed to post comment.");
          return;
        }
        setComments((prev) => [...prev, data.comment]);
        toast.success("Comment added!");
      } catch {
        toast.error("Something went wrong.");
      }
    },
    [activePage, slugId]
  );

  const handleResolve = useCallback(
    async (id: string, resolved: boolean) => {
      // Optimistic update
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, resolved } : c))
      );
      try {
        const res = await fetch(`/api/comments/${slugId}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolved }),
        });
        if (!res.ok) {
          // Revert
          setComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, resolved: !resolved } : c))
          );
          toast.error("Failed to update comment.");
        }
      } catch {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, resolved: !resolved } : c))
        );
      }
    },
    [slugId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const prev = comments.find((c) => c.id === id);
      setComments((c) => c.filter((x) => x.id !== id));
      try {
        const res = await fetch(`/api/comments/${slugId}/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          if (prev) setComments((c) => [...c, prev]);
          toast.error("Failed to delete comment.");
        } else {
          toast.success("Comment deleted.");
        }
      } catch {
        if (prev) setComments((c) => [...c, prev]);
      }
    },
    [comments, slugId]
  );

  const openCommentCount = activePage
    ? comments.filter((c) => c.pageId === activePage.id && !c.resolved).length
    : 0;

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-10 stroke-1" />
          <p className="text-sm text-muted-foreground">Loading preview…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-lg font-semibold text-foreground">Project not found</p>
        <p className="text-sm text-muted-foreground">
          This preview link may be invalid or expired.
        </p>
        <Button asChild>
          <Link href="/">Go to Zephio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 z-20"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Logo showName />
          <span className="hidden sm:block text-muted-foreground">/</span>
          <span className="hidden sm:block text-sm font-medium text-foreground truncate">
            {data.title}
          </span>
        </div>

        {/* Page tabs */}
        {data.pages.length > 1 && (
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 mx-3">
            {data.pages.map((page, i) => (
              <button
                key={page.id}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all duration-200",
                  i === activeIndex
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {page.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Comment mode toggle */}
          <Button
            variant={commentMode ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-1.5 text-xs font-semibold relative",
              commentMode && "ring-2 ring-primary/30"
            )}
            onClick={() => {
              setCommentMode((v) => !v);
              if (!panelOpen) setPanelOpen(true);
            }}
            title="Toggle comment mode (F)"
          >
            <MessageCircle className="size-3.5" />
            <span className="hidden sm:inline">
              {commentMode ? "Commenting…" : "Comment"}
            </span>
            {openCommentCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {openCommentCount}
              </span>
            )}
          </Button>

          {/* Panel toggle */}
          <Button
            variant={panelOpen ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5 text-xs hidden sm:flex"
            onClick={() => setPanelOpen((v) => !v)}
            title="Toggle comments panel"
          >
            {panelOpen ? <X className="size-3.5" /> : <MessageCircle className="size-3.5" />}
            <span className="hidden lg:inline">
              {panelOpen ? "Hide panel" : "All comments"}
            </span>
          </Button>

          {/* Copy link */}
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-sm"
            onClick={handleCopyLink}
          >
            <AnimatePresence mode="wait" initial={false}>
              {linkCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Check className="size-3.5" />
                </motion.div>
              ) : (
                <motion.div
                  key="link"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -180 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link2 className="size-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="hidden xs:inline">
              {linkCopied ? "Copied!" : "Copy link"}
            </span>
          </Button>

          {activePage && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hidden lg:flex"
              onClick={() => downloadPage(activePage)}
            >
              <Download className="size-3.5" />
              Download page
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={handleDownloadAll}
            disabled={isDownloading}
          >
            {isDownloading ? <Spinner className="size-3.5" /> : <Download className="size-3.5" />}
            <span className="hidden sm:inline">
              {isDownloading ? "Preparing…" : "Export"}
            </span>
          </Button>
          {isOwner && (
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs hidden md:flex">
              <Link href={`/project/${slugId}`}>
                <ExternalLink className="size-3.5" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </motion.header>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview + overlay */}
        <div className="relative flex-1 overflow-hidden bg-muted/30">
          {/* Comment mode banner */}
          <AnimatePresence>
            {commentMode && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm shadow-lg"
              >
                <MessageCircle className="size-3.5" />
                Click anywhere to leave a comment · Press{" "}
                <kbd className="rounded bg-primary/20 px-1 py-0.5 font-mono text-[10px]">Esc</kbd>{" "}
                to exit
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile page selector */}
          {data.pages.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 z-10 md:hidden"
            >
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background/90 backdrop-blur-md p-1 shadow-lg">
                {data.pages.map((page, i) => (
                  <button
                    key={page.id}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200",
                      i === activeIndex
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {page.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activePage && (
              <motion.div
                key={activePage.id}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full"
              >
                <CommentOverlay
                  comments={comments}
                  activePageId={activePage.id}
                  commentMode={commentMode}
                  isOwner={isOwner}
                  onAddComment={handleAddComment}
                  onResolve={handleResolve}
                  onDelete={handleDelete}
                >
                  <iframe
                    srcDoc={getHTMLWrapper(
                      activePage.htmlContent,
                      activePage.name,
                      activePage.rootStyles,
                      activePage.id
                    )}
                    title={activePage.name}
                    sandbox="allow-scripts"
                    className="h-full w-full border-none"
                  />
                </CommentOverlay>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prev / Next arrows */}
          {data.pages.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur shadow-lg transition-all",
                  activeIndex === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-accent hover:scale-110 cursor-pointer active:scale-95"
                )}
              >
                <ChevronLeft className="size-5" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                onClick={() =>
                  setActiveIndex((i) => Math.min(data.pages.length - 1, i + 1))
                }
                disabled={activeIndex === data.pages.length - 1}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 backdrop-blur shadow-lg transition-all",
                  activeIndex === data.pages.length - 1
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-accent hover:scale-110 cursor-pointer active:scale-95"
                )}
              >
                <ChevronRight className="size-5" />
              </motion.button>
            </>
          )}
        </div>

        {/* Comment panel */}
        <AnimatePresence>
          {panelOpen && activePage && (
            <CommentPanel
              key="panel"
              comments={comments}
              activePageId={activePage.id}
              isOwner={isOwner}
              onResolve={handleResolve}
              onDelete={handleDelete}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-background/60 backdrop-blur px-4"
      >
        <p className="text-xs text-muted-foreground">
          Built with{" "}
          <Link
            href="/"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Zephio
          </Link>{" "}
          — AI that designs. You that decides.
        </p>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
            F
          </kbd>
          <span>comment mode</span>
          <span className="mx-1">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
            C
          </kbd>
          <span>copy link</span>
          {data.pages.length > 1 && (
            <>
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                ←
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                →
              </kbd>
              <span>navigate</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
