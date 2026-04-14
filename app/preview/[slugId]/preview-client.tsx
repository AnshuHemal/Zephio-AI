"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getHTMLWrapper } from "@/lib/page-wrapper";
import { PageType } from "@/types/project";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { downloadPage, downloadAllPages } from "@/lib/export";
import { Download, ExternalLink, ChevronLeft, ChevronRight, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

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

  // Keyboard shortcuts for navigation
  useEffect(() => {
    if (!data) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys for page navigation
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        setActiveIndex((i) => i - 1);
      } else if (e.key === "ArrowRight" && activeIndex < data.pages.length - 1) {
        setActiveIndex((i) => i + 1);
      }
      // C key to copy link
      else if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          handleCopyLink();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const activePage = data?.pages[activeIndex];

  const handleDownloadAll = async () => {
    if (!data) return;
    setIsDownloading(true);
    await downloadAllPages(data.pages, data.title);
    setIsDownloading(false);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

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
        <p className="text-sm text-muted-foreground">This preview link may be invalid or expired.</p>
        <Button asChild>
          <Link href="/">Go to Zephio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Top bar */}
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
          {/* Copy Link Button - Prominent placement */}
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
            <span className="hidden xs:inline">{linkCopied ? "Copied!" : "Copy link"}</span>
            <span className="xs:hidden">{linkCopied ? "✓" : "Share"}</span>
          </Button>

          {activePage && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs hidden lg:flex"
              onClick={() => downloadPage(activePage)}
            >
              <Download className="size-3.5" />
              <span>Download page</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={handleDownloadAll}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Spinner className="size-3.5" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? "Preparing…" : "Export"}
            </span>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs hidden md:flex">
            <Link href={`/project/${slugId}`}>
              <ExternalLink className="size-3.5" />
              <span>Edit</span>
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Preview area */}
      <div className="relative flex-1 overflow-hidden bg-muted/30">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prev / Next arrows for multi-page */}
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
              onClick={() => setActiveIndex((i) => Math.min(data.pages.length - 1, i + 1))}
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

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-background/60 backdrop-blur px-4"
      >
        <p className="text-xs text-muted-foreground">
          Built with{" "}
          <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
            Zephio
          </Link>{" "}
          — AI that designs. You that decides.
        </p>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
            C
          </kbd>
          <span>to copy link</span>
          {data.pages.length > 1 && (
            <>
              <span className="mx-1">•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                ←
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                →
              </kbd>
              <span>to navigate</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
