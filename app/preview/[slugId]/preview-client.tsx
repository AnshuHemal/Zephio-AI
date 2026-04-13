"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getHTMLWrapper } from "@/lib/page-wrapper";
import { PageType } from "@/types/project";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { downloadPage, downloadAllPages } from "@/lib/export";
import { Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

  const activePage = data?.pages[activeIndex];

  const handleDownloadAll = async () => {
    if (!data) return;
    setIsDownloading(true);
    await downloadAllPages(data.pages, data.title);
    setIsDownloading(false);
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
        <div className="flex items-center gap-3">
          <Logo showName />
          <span className="hidden sm:block text-muted-foreground">/</span>
          <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-48">
            {data.title}
          </span>
        </div>

        {/* Page tabs */}
        {data.pages.length > 1 && (
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
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

        <div className="flex items-center gap-2">
          {activePage && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => downloadPage(activePage)}
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Download page</span>
            </Button>
          )}
          <Button
            size="sm"
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
              {isDownloading ? "Preparing…" : "Export all"}
            </span>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
            <Link href={`/project/${slugId}`}>
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">Open in editor</span>
            </Link>
          </Button>
        </div>
      </motion.header>

      {/* Preview area */}
      <div className="relative flex-1 overflow-hidden bg-muted/30">
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
            <button
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              disabled={activeIndex === 0}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur shadow-sm transition-all",
                activeIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setActiveIndex((i) => Math.min(data.pages.length - 1, i + 1))}
              disabled={activeIndex === data.pages.length - 1}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur shadow-sm transition-all",
                activeIndex === data.pages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex h-9 shrink-0 items-center justify-center border-t border-border bg-background/60 backdrop-blur">
        <p className="text-xs text-muted-foreground">
          Built with{" "}
          <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
            Zephio
          </Link>{" "}
          — AI that designs. You that decides.
        </p>
      </div>
    </div>
  );
}
