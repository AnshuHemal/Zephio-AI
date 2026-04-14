"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { extractPalette, buildThumbnailGradient } from "@/lib/thumbnail";
import { cn } from "@/lib/utils";
import { FileStack } from "lucide-react";

type Props = {
  name: string;
  rootStyles: string;
  isLoading?: boolean;
  children: React.ReactNode;
};

/**
 * Wraps a sidebar page row and shows a CSS-based visual preview
 * on hover — positioned to the right of the sidebar.
 * Uses the same palette extraction as the dashboard thumbnails.
 * No iframes, no live HTML, zero memory overhead.
 */
export default function PagePreviewTooltip({ name, rootStyles, isLoading, children }: Props) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delay show slightly to avoid flicker on fast mouse-overs
  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setVisible(true), 300);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {visible && !isLoading && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: -8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            // Position to the right of the sidebar (sidebar is 180px wide)
            className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50"
          >
            <div className="rounded-xl border border-border bg-card shadow-xl shadow-black/15 overflow-hidden w-44">
              {/* Thumbnail area */}
              <div className="h-28 w-full relative overflow-hidden">
                <PageThumbnailPreview rootStyles={rootStyles} name={name} />
              </div>
              {/* Label */}
              <div className="px-2.5 py-2 border-t border-border">
                <p className="text-[11px] font-semibold text-foreground truncate">{name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Click to select</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CSS-based page thumbnail ──────────────────────────────────────────────────
function PageThumbnailPreview({ rootStyles, name }: { rootStyles: string; name: string }) {
  const palette = extractPalette(rootStyles);
  const gradient = buildThumbnailGradient(palette);

  if (!rootStyles?.trim()) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <FileStack className="size-5 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ background: gradient }}>
      {/* Nav bar */}
      <div
        className="flex items-center justify-between px-2 py-1.5"
        style={{
          background: `color-mix(in oklch, ${palette.background} 85%, transparent)`,
          borderBottom: `1px solid color-mix(in oklch, ${palette.border} 50%, transparent)`,
        }}
      >
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full" style={{ background: palette.primary }} />
          <div className="h-1 w-7 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 20%, transparent)` }} />
        </div>
        <div className="h-2 w-5 rounded-full" style={{ background: palette.primary }} />
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center gap-1.5 px-3 pt-2.5">
        <div className="h-2 w-2/3 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 65%, transparent)` }} />
        <div className="h-1.5 w-1/2 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 40%, transparent)` }} />
        <div className="flex flex-col gap-0.5 w-full items-center mt-0.5">
          {[55, 70, 45].map((w, i) => (
            <div
              key={i}
              className="h-1 rounded-full"
              style={{
                width: `${w}%`,
                background: `color-mix(in oklch, ${palette.foreground} 18%, transparent)`,
              }}
            />
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          <div className="h-3 w-10 rounded-full" style={{ background: palette.primary }} />
          <div className="h-3 w-8 rounded-full" style={{ border: `1px solid color-mix(in oklch, ${palette.border} 70%, transparent)` }} />
        </div>
      </div>

      {/* Feature cards */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-1.5 pb-1.5">
        {[palette.primary, palette.secondary, palette.accent].map((color, i) => (
          <div
            key={i}
            className="flex-1 rounded-md p-1.5 flex flex-col gap-0.5"
            style={{
              background: `color-mix(in oklch, ${palette.background} 80%, ${color} 20%)`,
              border: `1px solid color-mix(in oklch, ${palette.border} 40%, transparent)`,
            }}
          >
            <div className="h-1.5 w-1.5 rounded-sm" style={{ background: `color-mix(in oklch, ${palette.primary} 55%, transparent)` }} />
            <div className="h-1 w-full rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 25%, transparent)` }} />
            <div className="h-1 w-2/3 rounded-full" style={{ background: `color-mix(in oklch, ${palette.foreground} 15%, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
